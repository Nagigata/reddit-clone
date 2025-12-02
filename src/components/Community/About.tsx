import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { MdExitToApp } from "react-icons/md";
import { useSetRecoilState } from "recoil";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import { auth, firestore, storage } from "../../firebase/clientApp";
import useSelectFile from "../../hooks/useSelectFile";
import axios from "axios";

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const selectedFieldRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectedFile } = useSelectFile();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  const bg = useColorModeValue("white", "#1A202C");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const onUploadingImage = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);

    try {
      const formData = new FormData();
      const res = await fetch(selectedFile);
      const blob = await res.blob();
      formData.append("avatar", blob, "avatar.jpg");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/${communityData.community_id}/upload-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatar = response.data.avatar;
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          avatar: newAvatar,
        } as Community,
      }));

      setSelectedFile('');
    } catch (error) {
      console.error("Upload avatar error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    setIsLeaving(true);
    try {
      // Giả sử user_id là 1 - SAU NHO THAY DOI ID USER CHO NAY
      const userId = 1;
      if(isCreator) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/${communityData.community_id}`
        );  
      } else {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}/reject-member/${userId}`
        );        
      }

      toast({
        title: "Success",
        description: `You have left r/${communityData.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect về trang home sau khi leave
      router.push("/");
      
      // Cập nhật state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (snippet) => snippet.communityId !== communityData.community_id
        ),
      }));

      onClose();
    } catch (error) {
      console.error("Leave community error:", error);
      toast({
        title: "Error",
        description: "Unable to leave community. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
    }
  };

  // Kiểm tra xem user có phải là creator không
  const isCreator = communityData.created_by === 1; // SAU NHO THAY DOI ID USER CHO NAY

  return (
    <Box position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        bg="blue.400"
        color="white"
        p={3}
        borderRadius="4px 4px 0px 0px"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Community
        </Text>
        
        <Menu>
          <MenuButton cursor="pointer" _hover={{ opacity: 0.8 }}>
            <Icon as={HiOutlineDotsHorizontal} />
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<MdExitToApp />}
              onClick={onOpen}
              color="red.500"
              _hover={{ bg: "red.50" }}
              fontSize={"sm"}
            >
              {isCreator ? "Delete community" : "Leave Community"}
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      <Flex direction="column" p={3} bg={bg} borderRadius="0px 0px 4px 4px">
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt" fontWeight={700}>
            <Flex direction="column" flexGrow={1}>
              <Text>{communityData.members}</Text>
              <Text>Members</Text>
            </Flex>
            <Flex direction="column" flexGrow={1}>
              <Text>1</Text>
              <Text>Online</Text>
            </Flex>
          </Flex>
          <Divider />

          <Flex
            align="center"
            width="100%"
            p={1}
            fontWeight={500}
            fontSize="10pt"
          >
            <Icon as={RiCakeLine} fontSize={18} mr={2} />
            {communityData.created_at && (
              <Text>
                Created{" "}
                {moment(new Date(communityData.created_at)).format("MMM DD, YYYY")}
              </Text>
            )}
          </Flex>
          <Link href={`/r/${communityData.name}/submit`}>
            <Button mt={3} height="30px">
              Create Post
            </Button>
          </Link>
          {isCreator && (
            <>
              <Divider />
              <Stack spacing={1} fontSize="10pt">
                <Text fontWeight={600}>Admin</Text>
                <Flex align="center" justify="space-between">
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => selectedFieldRef.current?.click()}
                  >
                    Change Image
                  </Text>
                  {communityData.avatar || selectedFile ? (
                    <Image
                      src={selectedFile || communityData.avatar}
                      borderRadius="full"
                      boxSize="40px"
                      alt="community Image"
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize={40}
                      color="brand.100"
                      mr={2}
                    />
                  )}
                </Flex>
                {selectedFile &&
                  (uploadingImage ? (
                    <Spinner />
                  ) : (
                    <Text cursor="pointer" onClick={onUploadingImage}>
                      Save Changes
                    </Text>
                  ))}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg"
                  hidden
                  ref={selectedFieldRef}
                  onChange={onSelectedFile}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Flex>

      {/* Confirm Leave Community Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Leave r/{communityData.name}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to {isCreator ? 'delete' : 'leave'} this community? You can always rejoin later.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleLeaveCommunity}
                ml={3}
                isLoading={isLeaving}
              >
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default About;
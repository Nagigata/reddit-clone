import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  Select,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FaReddit, FaUsers } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { useSetRecoilState } from "recoil";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import { useAuth } from "../../contexts/AuthContext";
import useSelectFile from "../../hooks/useSelectFile";
import { CommunityType, communityService } from "../../services/communityService";
import ManageMembersModal from "./ManageMembersModal";

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const selectedFieldRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectedFile } = useSelectFile();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [membersCount, setMembersCount] = useState<number>(
    communityData.numberOfMembers || 0
  );
  const [communityName, setCommunityName] = useState(communityData.name || "");
  const [selectedType, setSelectedType] = useState<string>(
    communityData.typeId ? String(communityData.typeId) : ""
  );
  const [communityTypes, setCommunityTypes] = useState<CommunityType[]>([]);
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [deletingCommunity, setDeletingCommunity] = useState(false);
  const isAdmin = user && String(user.id) === String(communityData.creatorId);
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const imageBg = useColorModeValue("gray.200", "gray.700");

  const onSelectedFileWithObj = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      onSelectedFile(event);
    }
  };

  const onUploadingImage = async () => {
    if (!selectedFileObj || !communityData.id) return;
    setUploadingImage(true);

    try {
      const communityIdNum =
        communityData.backendId ?? Number(communityData.id);
      if (!communityIdNum || Number.isNaN(communityIdNum)) {
        throw new Error("Invalid community ID");
      }

      const updated = await communityService.uploadCommunityAvatar(
        communityIdNum,
        selectedFileObj
      );

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: updated.avatar,
        } as Community,
      }));

      setSelectedFileObj(null);
      setSelectedFile("");
    } catch (error) {
      console.log("onUploader Image", error);
    }
    setUploadingImage(false);
  };
  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const communityIdNum =
          communityData.backendId ?? Number(communityData.id);
        if (!communityIdNum || Number.isNaN(communityIdNum)) {
          setMembersCount(communityData.numberOfMembers || 0);
          return;
        }
        const members = await communityService.getCommunityMembers(
          communityIdNum
        );
        setMembersCount(members.length);
        setCommunityStateValue((prev) => ({
          ...prev,
          currentCommunity: {
            ...prev.currentCommunity,
            numberOfMembers: members.length,
          } as Community,
        }));
      } catch (error) {
        console.log("fetchMembersCount error", error);
        setMembersCount(communityData.numberOfMembers || 0);
      }
    };

    fetchMembersCount();
  }, [communityData, setCommunityStateValue]);

  useEffect(() => {
    setCommunityName(communityData.name || "");
    setSelectedType(communityData.typeId ? String(communityData.typeId) : "2"); 
  }, [communityData.id, communityData.typeId, communityData.name]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await communityService.getCommunityTypes();
        setCommunityTypes(types);
        if (!selectedType && types.length) {
          const match =
            types.find((type) => type.id === communityData.typeId) || types[0];
          if (match.id) {
            setSelectedType(String(match.id));
          }
        }
      } catch (error) {
        console.log("fetchCommunityTypes error", error);
      }
    };

    fetchTypes();
  }, [communityData.typeId, selectedType]);

  const handleSaveCommunity = async () => {
    if (!communityName.trim()) {
      toast({
        title: "Community name is required",
        status: "warning",
      });
      return;
    }

    const communityIdNum = communityData.backendId ?? Number(communityData.id);
    if (!communityIdNum || Number.isNaN(communityIdNum)) {
      toast({
        title: "Missing community id",
        status: "error",
      });
      return;
    }

    try {
      setSavingCommunity(true);
      const typeIdNumber = selectedType ? Number(selectedType) : undefined;

      await communityService.updateCommunity(communityIdNum, {
        name: communityName,
        type_id: typeIdNumber,
      });

      setCommunityStateValue((prev) => {
        const updatedCommunity: Community = {
          ...(prev.currentCommunity || communityData),
          id: String(communityIdNum), // Keep ID as identifier
          name: communityName, // Update name
          backendId: communityIdNum,
          typeId: typeIdNumber,
        };

        return {
          ...prev,
          currentCommunity: updatedCommunity,
          mySnippets: prev.mySnippets.map((snippet) =>
            snippet.backendId === communityIdNum
              ? { ...snippet, communityId: String(communityIdNum) }
              : snippet
          ),
        };
      });

      toast({
        title: "Community updated",
        status: "success",
      });

      // No need to navigate - URL uses ID which doesn't change
    } catch (error: any) {
      console.log("update community error", error);
      toast({
        title: "Failed to update community",
        description: error.message,
        status: "error",
      });
    } finally {
      setSavingCommunity(false);
    }
  };

  const handleDeleteCommunity = async () => {
    const communityIdNum = communityData.backendId ?? Number(communityData.id);
    if (!communityIdNum || Number.isNaN(communityIdNum)) {
      toast({
        title: "Missing community id",
        status: "error",
      });
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${communityData.name || `community ${communityData.id}`}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingCommunity(true);
      await communityService.deleteCommunity(communityIdNum);
      toast({
        title: "Community deleted",
        status: "success",
      });
      router.push("/");
    } catch (error: any) {
      console.log("delete community error", error);
      toast({
        title: "Failed to delete community",
        description: error.message,
        status: "error",
      });
    } finally {
      setDeletingCommunity(false);
    }
  };

  return (
    <Box position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        bgGradient="linear(to-r, blue.400, blue.500)"
        color="white"
        p={3}
        borderRadius="8px 8px 0px 0px"
        boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Community
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>
      <Flex
        direction="column"
        p={3}
        bg={bg}
        borderRadius="0px 0px 8px 8px"
        boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
        border="1px solid"
        borderColor={borderColor}
        borderTop="none"
      >
        <Stack spacing={3}>
          {/* Members Count */}
          <Flex width="100%" p={2} fontSize="10pt">
            <Flex direction="column" align="center" flex={1}>
              <Text fontSize="16pt" fontWeight={700} color="blue.500">
                {membersCount.toLocaleString()}
              </Text>
              <Text fontSize="9pt" color="gray.500" fontWeight={500}>
                Members
              </Text>
            </Flex>
          </Flex>
          
          <Divider />

          {/* Created Date */}
          <Flex
            align="center"
            width="100%"
            p={2}
            fontWeight={500}
            fontSize="10pt"
          >
            <Icon as={RiCakeLine} fontSize={18} mr={2} color="gray.500" />
            <Text color="gray.600">
              Created{" "}
              {communityData.createdAt
                ? moment(new Date(communityData.createdAt)).format(
                    "MMM DD, YYYY"
                  )
                : "—"}
            </Text>
          </Flex>

          <Divider />

          {/* Create Post Button */}
          <Link href={`/r/${communityData.id}/submit`}>
            <Button
              height="32px"
              width="100%"
              colorScheme="blue"
              _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              transition="all 0.2s ease-in-out"
            >
              Create Post
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Divider />
              <Stack spacing={3} fontSize="10pt" mt={2}>
                <Text fontWeight={600} fontSize="11pt">
                  Community Settings
                </Text>
                
                {/* Change Image Section */}
                <Box>
                  <Text fontSize="9pt" fontWeight={500} mb={2}>
                    Community Image
                  </Text>
                  <Flex align="center" gap={3}>
                    {communityData.imageURL || selectedFile ? (
                      <Image
                        src={selectedFile || communityData.imageURL}
                        borderRadius="full"
                        boxSize="60px"
                        alt="community Image"
                      />
                    ) : (
                      <Flex
                        align="center"
                        justify="center"
                        borderRadius="full"
                        boxSize="60px"
                        bg={imageBg}
                      >
                        <Icon
                          as={FaReddit}
                          fontSize={40}
                          color="brand.100"
                        />
                      </Flex>
                    )}
                    <Stack spacing={1} flex={1}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectedFieldRef.current?.click()}
                        width="fit-content"
                      >
                        Change Image
                      </Button>
                      {selectedFile &&
                        (uploadingImage ? (
                          <Flex align="center" gap={2}>
                            <Spinner size="sm" />
                            <Text fontSize="8pt" color="gray.500">
                              Uploading...
                            </Text>
                          </Flex>
                        ) : (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={onUploadingImage}
                            width="fit-content"
                          >
                            Save Image
                          </Button>
                        ))}
                    </Stack>
                  </Flex>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/x-png,image/gif,image/jpeg"
                    hidden
                    ref={selectedFieldRef}
                    onChange={onSelectedFileWithObj}
                  />
                </Box>

                <Divider />

                {/* Community Name */}
                <Box>
                  <Text fontSize="9pt" fontWeight={500} mb={2}>
                    Community Name
                  </Text>
                  <Input
                    value={communityName}
                    onChange={(event) => setCommunityName(event.target.value)}
                    size="sm"
                  />
                </Box>

                {/* Community Type */}
                <Box>
                  <Text fontSize="9pt" fontWeight={500} mb={2}>
                    Community Type
                  </Text>
                  <Select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    size="sm"
                  >
                    <option value="1">Private</option>
                    <option value="2">Public</option>
                    <option value="3">Restricted</option>
                  </Select>
                </Box>

                {/* Action Buttons */}
                <Stack spacing={2} mt={2}>
                  <Button
                    height="32px"
                    colorScheme="blue"
                    onClick={handleSaveCommunity}
                    isLoading={savingCommunity}
                    width="100%"
                  >
                    Save Changes
                  </Button>
                  <Button
                    height="32px"
                    variant="outline"
                    leftIcon={<Icon as={FaUsers} />}
                    onClick={onOpen}
                    width="100%"
                  >
                    Manage Members
                  </Button>
                  <Button
                    height="32px"
                    color="white"
                    bg="red.500"
                    _hover={{ bg: "red.600" }}
                    _active={{ bg: "red.700" }}
                    onClick={handleDeleteCommunity}
                    isLoading={deletingCommunity}
                    width="100%"
                  >
                    Delete Community
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Flex>
      
      {/* Manage Members Modal */}
      {isAdmin && (
        <ManageMembersModal
          isOpen={isOpen}
          onClose={onClose}
          communityData={communityData}
        />
      )}
    </Box>
  );
};
export default About;

import {
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsChat, BsDot } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowRedoOutline,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoBookmarkOutline,
} from "react-icons/io5";

import { Post } from "../../atoms/PostAtom";
import { useAuth } from "../../contexts/AuthContext";
import { postService } from "../../services/postService";
import { useSetRecoilState } from "recoil";
import { authModelState } from "../../atoms/authModalAtom";

type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<Element, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
  homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  homePage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const singlePostPage = !onSelectPost;
  const router = useRouter();
  const { user } = useAuth();
  const setAuthModalState = useSetRecoilState(authModelState);
  const toast = useToast();
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();

  // Themes
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const singlePageBorderColor = useColorModeValue("white", "#2D3748");
  const voteLineBorderColor = useColorModeValue("gray.100", "#171923");
  const IconHoverBg = useColorModeValue("gray.200", "#2A4365");
  const IconBg = useColorModeValue("gray.500", "#A0AEC0");
  const voteIconBg = useColorModeValue("gray.400", "#CBD5E0");

  const handleDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setLoadingDelete(true);
    try {
      const success = await onDeletePost(post);

      if (!success) {
        throw new Error("Failed to Delete Post");
      }

      console.log("Post was Successfully Deleted");

      if (singlePostPage) {
        router.push(`/r/${post.communityId}`);
      }
    } catch (error: any) {
      setError(error.message);
    }
    setLoadingDelete(false);
  };

  const getCreatedAtText = () => {
    const createdAt: any = post.createdAt;
    if (createdAt?.seconds) {
      return moment(new Date(createdAt.seconds * 1000)).fromNow();
    }
    if (typeof createdAt === "string") {
      return moment(new Date(createdAt)).fromNow();
    }
    try {
      return moment(createdAt).fromNow();
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const checkSaved = async () => {
      if (!user || !post.id) return;
      try {
        const postIdNum = Number(post.id);
        if (isNaN(postIdNum)) return;
        const saved = await postService.getMySavedPost(postIdNum);
        setIsSaved(!!saved);
      } catch {

      }
    };
    checkSaved();
  }, [user, post.id]);

  const handleToggleSave = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    if (!post.id) return;

    try {
      setSaving(true);
      const postIdNum = Number(post.id);
      if (isNaN(postIdNum)) return;

      if (isSaved) {
        await postService.unsavePost(postIdNum);
        setIsSaved(false);
        toast({
          title: "Post unsaved",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      } else {
        await postService.savePost(postIdNum);
        setIsSaved(true);
        toast({
          title: "Post saved",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (e: any) {
      console.error("Failed to toggle save:", e);
      toast({
        title: isSaved ? "Failed to unsave post" : "Failed to save post",
        description: e.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    
    if (!post.id || !post.communityId) return;

    const postUrl = `${window.location.origin}/r/${post.communityId}/comments/${post.id}`;
    
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Link copied to clipboard!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (fallbackErr) {
        toast({
          title: "Failed to copy link",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <Flex
      border="1px solid"
      bg={bg}
      borderColor={singlePostPage ? singlePageBorderColor : borderColor}
      borderRadius={singlePostPage ? "4px 4px 0px 0px" : "8px"}
      _hover={{ 
        borderColor: singlePostPage ? "none" : borderColor,
        boxShadow: singlePostPage ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transform: singlePostPage ? "none" : "translateY(-2px)",
      }}
      transition="all 0.2s ease-in-out"
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)}
      boxShadow={singlePostPage ? "none" : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"}
      mb={singlePostPage ? 0 : 3}
    >
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : voteLineBorderColor}
        p={2}
        width="40px"
        borderRadius={singlePostPage ? "0" : "3px 0px 0px 3px"}
      >
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? "brand.100" : voteIconBg}
          fontSize={22}
          onClick={(event) => onVote(event, post, 1, post.communityId)}
          cursor="pointer"
          _hover={{ transform: "scale(1.1)", color: "brand.100" }}
          transition="all 0.2s ease-in-out"
        />
        <Text fontSize="9pt" color={voteIconBg}>
          {post.voteStatus}
        </Text>
        <Icon
          as={
            userVoteValue === -1
              ? IoArrowDownCircleSharp
              : IoArrowDownCircleOutline
          }
          color={userVoteValue === -1 ? "#4379ff" : voteIconBg}
          fontSize={22}
          onClick={(event) => onVote(event, post, -1, post.communityId)}
          cursor="pointer"
          _hover={{ transform: "scale(1.1)", color: "#4379ff" }}
          transition="all 0.2s ease-in-out"
        />
      </Flex>
      <Flex direction="column" width="100%">
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Text mr={2}>{error}</Text>
          </Alert>
        )}
        <Stack spacing={1} p="10px">
          <Stack direction="row" spacing={0.5} align="center" fontSize="9pt">
            {/* check */}
            {homePage && (
              <>
                {post.communityImageURL ? (
                  <Image
                    src={post.communityImageURL}
                    borderRadius="full"
                    boxSize="18px"
                    mr={2}
                    alt="Community Avatar"
                  />
                ) : (
                  <Icon as={FaReddit} fontSize="18px" color="blue.500" />
                )}
                <Link href={`/r/${post.communityId}`}>
                  <Text
                    fontWeight={700}
                    _hover={{ textDecoration: "underline" }}
                    cursor="pointer"
                    onClick={(e) => e.stopPropagation()}
                  >{`r/${post.communityName || post.communityId}`}</Text>
                </Link>
                <Icon as={BsDot} color="gray.500" fontSize={8} />
              </>
            )}
            <Text>
              Posted by u/{post.creatorDisplayName || "anonymous"}{" "}
              {getCreatedAtText()}
            </Text>
          </Stack>
          <Text fontSize="12pt" fontWeight={600}>
            {post.title}
          </Text>
          <Text fontSize="10pt">{post.body}</Text>
          {post.imageURL && (
            <Flex justify="center" align="center" p={2}>
              {loadingImage && (
                <Skeleton height="200px" width="100%" borderRadius={4} />
              )}
              <Image
                src={post.imageURL}
                maxHeight="460px"
                alt="Post Image"
                display={loadingImage ? "none" : "unset"}
                onLoad={() => setLoadingImage(false)}
                onClick={(event) => {
                  event.stopPropagation();
                  onImageModalOpen();
                }}
                cursor="pointer"
                _hover={{ opacity: 0.9 }}
                transition="opacity 0.2s"
              />
            </Flex>
          )}
        </Stack>
        <Flex ml={1} mb={0.5} color="gray.500" fontWeight={600}>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: IconHoverBg, transform: "scale(1.05)" }}
            cursor="pointer"
            transition="all 0.2s ease-in-out"
          >
            <Icon as={BsChat} mr={2} color={IconBg} />
            <Text fontSize="9pt" color={IconBg}>
              {post.numberOfComments}
            </Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: IconHoverBg, transform: "scale(1.05)" }}
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            onClick={handleShare}
          >
            <Icon as={IoArrowRedoOutline} mr={2} color={IconBg} />
            <Text fontSize="9pt" color={IconBg}>
              Share
            </Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: IconHoverBg, transform: "scale(1.05)" }}
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            onClick={handleToggleSave}
          >
            <Icon
              as={IoBookmarkOutline}
              mr={2}
              color={isSaved ? "orange.400" : IconBg}
              aria-label={isSaved ? "Unsave post" : "Save post"}
            />
            <Text fontSize="9pt" color={IconBg}>
              {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
            </Text>
          </Flex>
          {userIsCreator && (
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: IconHoverBg }}
              cursor="pointer"
              onClick={handleDelete}
            >
              {loadingDelete ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Icon as={AiOutlineDelete} mr={2} color={IconBg} />
                  <Text fontSize="9pt" color={IconBg}>
                    Delete
                  </Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Image Modal/Lightbox */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="full">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" zIndex={1000} />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={0}
            onClick={onImageModalClose}
          >
            <Image
              src={post.imageURL}
              maxW="90vw"
              maxH="90vh"
              objectFit="contain"
              alt="Post Image Fullscreen"
              onClick={(e) => e.stopPropagation()}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
export default PostItem;

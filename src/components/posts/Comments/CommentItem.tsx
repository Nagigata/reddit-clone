import {
  Avatar,
  Box,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";

export type Comment = {
  id?: string;
  creatorId: string;
  creatorDisplayText: string;
  creatorPhotoURL?: string;
  communityId?: string;
  postId: string;
  postTitle?: string;
  text: string;
  createdAt: any;
  voteStatus?: number;
  userVoteValue?: number;
};

type CommentItemProps = {
  comment: Comment;
  onDeleteComment: (comment: Comment) => void;
  isLoading: boolean;
  userId?: string;
  onVote?: (comment: Comment, value: number) => void;
  onReply?: (comment: Comment) => void;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  isLoading,
  userId,
  onVote,
  onReply,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const getCreatedAtText = () => {
    const createdAt: any = comment.createdAt;
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

  const handleVote = (value: number) => {
    if (!onVote) return;
    onVote(comment, value);
  };

  return (
    <Flex
      p={3}
      borderRadius={6}
      border="1px solid"
      borderColor={borderColor}
      bg={bg}
      _hover={{ borderColor: "blue.400" }}
      transition="all 0.15s ease-in-out"
    >
      <Box mr={3}>
        <Avatar
          src={comment.creatorPhotoURL}
          size="sm"
          name={comment.creatorDisplayText || "anonymous"}
        />
      </Box>
      <Stack spacing={1} flex={1}>
        <Stack direction="row" align="center" fontSize="9px" color={mutedText}>
          <Text fontWeight={600} color="gray.700">
            {comment.creatorDisplayText || "anonymous"}
          </Text>
          <Text>• {getCreatedAtText()}</Text>
          {isLoading && <Spinner size="sm" />}
        </Stack>
        <Text fontSize="10pt">{comment.text}</Text>
        <Stack
          direction="row"
          align="center"
          spacing={4}
          mt={1}
          fontSize="9pt"
          color={mutedText}
        >
          <Flex align="center">
            <Icon
              as={IoArrowUpCircleOutline}
              mr={1}
              fontSize={16}
              cursor="pointer"
              color={comment.userVoteValue === 1 ? "blue.400" : mutedText}
              onClick={() => handleVote(1)}
            />
            <Text fontWeight={600}>{comment.voteStatus ?? 0}</Text>
            <Icon
              as={IoArrowDownCircleOutline}
              ml={1}
              fontSize={16}
              cursor="pointer"
              color={comment.userVoteValue === -1 ? "blue.400" : mutedText}
              onClick={() => handleVote(-1)}
            />
          </Flex>
          {onReply && (
            <Text
              _hover={{ color: "blue.500" }}
              cursor="pointer"
              onClick={() => onReply(comment)}
            >
              Reply
            </Text>
          )}
          {userId === comment.creatorId && (
            <>
              <Text
                fontSize="9pt"
                _hover={{ color: "blue.500" }}
                onClick={() => onDeleteComment(comment)}
              >
                Delete
              </Text>
            </>
          )}
        </Stack>
      </Stack>
    </Flex>
  );
};
export default CommentItem;

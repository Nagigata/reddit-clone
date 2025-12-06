import {
  Avatar,
  Box,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
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
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const voteBg = useColorModeValue("gray.100", "gray.700");
  const voteIconColor = useColorModeValue("gray.600", "gray.400");
  const upvoteColor = useColorModeValue("brand.100", "#63B3ED");
  const downvoteColor = useColorModeValue("#4379ff", "#90CDF4");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const voteTextColor = useColorModeValue("gray.700", "gray.300");
  const replyHoverBg = useColorModeValue("blue.50", "blue.900");
  const deleteHoverBg = useColorModeValue("red.50", "red.900");

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
      p={4}
      borderRadius={8}
      border="1px solid"
      borderColor={borderColor}
      bg={bg}
      _hover={{ 
        borderColor: "blue.300",
        bg: hoverBg,
        boxShadow: "sm"
      }}
      transition="all 0.2s ease-in-out"
      mb={2}
    >
      <Box mr={3}>
        <Avatar
          src={comment.creatorPhotoURL}
          size="sm"
          name={comment.creatorDisplayText || "anonymous"}
        />
      </Box>
      <Stack spacing={2} flex={1}>
        <Stack direction="row" align="center" fontSize="9pt" spacing={2}>
          <Text fontWeight={700} color={textColor}>
            {comment.creatorDisplayText || "anonymous"}
          </Text>
          <Text color={mutedText}>•</Text>
          <Text color={mutedText}>{getCreatedAtText()}</Text>
          {isLoading && <Spinner size="xs" />}
        </Stack>
        
        <Text 
          fontSize="11pt" 
          color={textColor}
          lineHeight="1.6"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {comment.text}
        </Text>
        
        <Flex
          direction="row"
          align="center"
          gap={2}
          mt={1}
        >
          {/* Vote Section - Improved */}
          <Flex
            align="center"
            bg={voteBg}
            borderRadius={20}
            px={2}
            py={1}
            gap={1}
          >
            <Icon
              as={comment.userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
              fontSize={18}
              cursor="pointer"
              color={comment.userVoteValue === 1 ? upvoteColor : voteIconColor}
              onClick={() => handleVote(1)}
              _hover={{ 
                transform: "scale(1.15)",
                color: upvoteColor
              }}
              transition="all 0.2s ease-in-out"
            />
            <Text 
              fontWeight={700} 
              fontSize="10pt"
              minW="20px"
              textAlign="center"
              color={voteTextColor}
            >
              {comment.voteStatus ?? 0}
            </Text>
            <Icon
              as={comment.userVoteValue === -1 ? IoArrowDownCircleSharp : IoArrowDownCircleOutline}
              fontSize={18}
              cursor="pointer"
              color={comment.userVoteValue === -1 ? downvoteColor : voteIconColor}
              onClick={() => handleVote(-1)}
              _hover={{ 
                transform: "scale(1.15)",
                color: downvoteColor
              }}
              transition="all 0.2s ease-in-out"
            />
          </Flex>

          {/* Action Buttons */}
          <Flex align="center" gap={3} ml={2}>
            {onReply && (
              <Button
                variant="ghost"
                size="xs"
                fontSize="9pt"
                fontWeight={500}
                color={mutedText}
                _hover={{ 
                  color: "blue.500",
                  bg: replyHoverBg
                }}
                onClick={() => onReply(comment)}
                px={2}
                py={1}
                h="auto"
              >
                Reply
              </Button>
            )}
            {userId === comment.creatorId && (
              <Button
                variant="ghost"
                size="xs"
                fontSize="9pt"
                fontWeight={500}
                color={mutedText}
                _hover={{ 
                  color: "red.500",
                  bg: deleteHoverBg
                }}
                onClick={() => onDeleteComment(comment)}
                px={2}
                py={1}
                h="auto"
              >
                Delete
              </Button>
            )}
          </Flex>
        </Flex>
      </Stack>
    </Flex>
  );
};
export default CommentItem;

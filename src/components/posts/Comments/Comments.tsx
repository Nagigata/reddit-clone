import {
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

import { Post, postState } from "../../../atoms/PostAtom";
import { useAuth } from "../../../contexts/AuthContext";
import { postService } from "../../../services/postService";
import useCommunityData from "../../../hooks/useCommunityData";
import CommentInput from "./CommentInput";
import CommentItem, { Comment } from "./CommentItem";

type CommentsProps = {
  selectedPost: Post | null;
  communityId: string;
};

const Comments: React.FC<CommentsProps> = ({
  selectedPost,
  communityId,
}) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [repliesByParent, setRepliesByParent] = useState<Record<string, Comment[]>>({});
  const [activeReplyParentId, setActiveReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const setPostState = useSetRecoilState(postState);
  const bg = useColorModeValue("white", "#1A202C");
  const lineBorderColor = useColorModeValue("gray.100", "#171923");
  const bgAccessBox = useColorModeValue("gray.50", "#2D3748");
  const { user } = useAuth();
  const { communityStateValue } = useCommunityData();

  const currentCommunity = communityStateValue.currentCommunity;
  
  // Check if user is a member (status APPROVED)
  const isMember = !!communityStateValue.mySnippets.find(
    (snippet) => snippet.communityId === currentCommunity?.id
  );
  const isCreator = user && currentCommunity && String(user.id) === currentCommunity.creatorId;
  const hasAccess = isMember || isCreator;

  // Private or Restricted: only members can comment
  const isPrivate = currentCommunity?.typeId === 1;
  const isRestricted = currentCommunity?.typeId === 3;
  const requiresMembership = isPrivate || isRestricted;
  const canComment = !requiresMembership || hasAccess;

  const onCreateComments = async () => {
    // Check access for private/restricted communities
    if (requiresMembership && !hasAccess) {
      return;
    }

    try {
      setCreateLoading(true);

      if (!selectedPost) return;

      const created = await postService.createComment({
        post_id: Number(selectedPost.id),
        content: commentText,
      });

      const newComment: Comment = {
        id: String(created.id),
        creatorId: String(created.author_id),
        creatorDisplayText:
          created.author?.full_name ||
          created.author?.email?.split("@")[0] ||
          user?.profile?.full_name ||
          user?.email ||
          "anonymous",
        creatorPhotoURL: created.author?.avatar || undefined,
        communityId,
        postId: String(created.post_id),
        postTitle: selectedPost.title,
        text: created.content,
        createdAt: created.created_at,
        voteStatus: created.vote_count ?? 0,
        userVoteValue: 0,
      };

      setCommentText("");
      setComments((prev) => [newComment, ...prev]);
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }));
    } catch (error) {
      console.log("📝", error);
    }
    setCreateLoading(false);
  };

  const onDeleteComment = async (comment: Comment) => {
    setLoadingDeleteId(comment.id!);
    try {
      await postService.deleteComment(Number(comment.id));

      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! - 1,
        } as Post,
      }));

      setComments((prev) => prev.filter((item) => item.id !== comment.id));
    } catch (error) {
      console.log("CommentDelete Error", error);
    }
    setLoadingDeleteId("");
  };

  const getPostComments = async () => {
    try {
      if (!selectedPost) return;

      const data = await postService.getComments(Number(selectedPost.id));
      const mapped: Comment[] = data.map((c) => ({
        id: String(c.id),
        creatorId: String(c.author_id),
        creatorDisplayText:
          c.author?.full_name ||
          c.author?.email?.split("@")[0] ||
          "anonymous",
        creatorPhotoURL: c.author?.avatar || undefined,
        communityId,
        postId: String(c.post_id),
        postTitle: selectedPost.title,
        text: c.content,
        createdAt: c.created_at,
        voteStatus: c.vote_count ?? 0,
        userVoteValue: 0,
      }));

      setComments(mapped);

      // Load replies for each top-level comment
      const entries = await Promise.all(
        mapped.map(async (comment) => {
          if (!comment.id) return [comment.id as string, [] as Comment[]] as const;
          try {
            const replies = await postService.getCommentReplies(
              Number(comment.id)
            );
            const mappedReplies: Comment[] = replies.map((r) => ({
              id: String(r.id),
              creatorId: String(r.author_id),
              creatorDisplayText:
                r.author?.full_name ||
                r.author?.email?.split("@")[0] ||
                "anonymous",
              creatorPhotoURL: r.author?.avatar || undefined,
              communityId,
              postId: String(r.post_id),
              postTitle: selectedPost.title,
              text: r.content,
              createdAt: r.created_at,
              voteStatus: r.vote_count ?? 0,
              userVoteValue: 0,
            }));
            return [comment.id as string, mappedReplies] as const;
          } catch {
            return [comment.id as string, [] as Comment[]] as const;
          }
        })
      );

      const next: Record<string, Comment[]> = {};
      entries.forEach(([id, list]) => {
        if (id) next[id] = list;
      });
      setRepliesByParent(next);

      // Load my votes for all comments & replies
      if (user) {
        const allComments: Comment[] = [
          ...mapped,
          ...Object.values(next).flat(),
        ];
        const voteMap: Record<string, number> = {};
        for (const c of allComments) {
          if (!c.id) continue;
          try {
            const vote = await postService.getMyVote({
              comment_id: Number(c.id),
            });
            if (vote) {
              let value = 0;
              if (typeof vote.vote_type === "number") {
                value = vote.vote_type as number;
              } else if (typeof vote.vote_type === "string") {
                value =
                  vote.vote_type === "up"
                    ? 1
                    : vote.vote_type === "down"
                    ? -1
                    : 0;
              }
              voteMap[c.id] = value;
            }
          } catch {
            // ignore single comment error
          }
        }

        setComments((prev) =>
          prev.map((c) => ({
            ...c,
            userVoteValue: c.id ? voteMap[c.id] ?? 0 : 0,
          }))
        );
        setRepliesByParent((prev) => {
          const updated: Record<string, Comment[]> = {};
          Object.entries(prev).forEach(([k, list]) => {
            updated[k] = list.map((c) => ({
              ...c,
              userVoteValue: c.id ? voteMap[c.id] ?? 0 : 0,
            }));
          });
          return updated;
        });
      }
    } catch (error) {
      console.log("GetPostComments Error", error);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    if (!selectedPost) return;
    getPostComments();
  }, [selectedPost]);

  const handleVoteComment = async (comment: Comment, value: number) => {
    if (!user || !comment.id) return;
    try {
      const commentIdNum = Number(comment.id);
      if (isNaN(commentIdNum)) return;

      const prevUserVote = comment.userVoteValue ?? 0;
      if (prevUserVote === value) {
        // Không cho unvote để tránh phức tạp với backend, chỉ cho đổi chiều
        return;
      }

      let delta = 0;
      if (prevUserVote === 0) {
        delta = value;
      } else if (prevUserVote === 1 && value === -1) {
        delta = -2;
      } else if (prevUserVote === -1 && value === 1) {
        delta = 2;
      }

      await postService.upsertVote({
        comment_id: commentIdNum,
        vote_type: value,
      });

      // Update state cho comment gốc
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                voteStatus: (c.voteStatus ?? 0) + delta,
                userVoteValue: value,
              }
            : c
        )
      );
      // Và cho replies
      setRepliesByParent((prev) => {
        const updated: Record<string, Comment[]> = {};
        Object.entries(prev).forEach(([k, list]) => {
          updated[k] = list.map((c) =>
            c.id === comment.id
              ? {
                  ...c,
                  voteStatus: (c.voteStatus ?? 0) + delta,
                  userVoteValue: value,
                }
              : c
          );
        });
        return updated;
      });
    } catch (error) {
      console.log("CommentVote Error", error);
    }
  };

  const handleReply = (comment: Comment) => {
    if (!user || !comment.id) return;
    // Check access for private/restricted communities
    if (requiresMembership && !hasAccess) {
      return;
    }
    setActiveReplyParentId(comment.id);
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!user || !selectedPost || !activeReplyParentId || !replyText.trim()) {
      return;
    }
    // Check access for private/restricted communities
    if (requiresMembership && !hasAccess) {
      return;
    }
    try {
      setReplyLoading(true);
      const created = await postService.createComment({
        post_id: Number(selectedPost.id),
        content: replyText,
        parent_comment_id: Number(activeReplyParentId),
      });

      const newReply: Comment = {
        id: String(created.id),
        creatorId: String(created.author_id),
        creatorDisplayText:
          created.author?.full_name ||
          created.author?.email?.split("@")[0] ||
          user.profile?.full_name ||
          user.email ||
          "anonymous",
        creatorPhotoURL: created.author?.avatar || undefined,
        communityId,
        postId: String(created.post_id),
        postTitle: selectedPost.title,
        text: created.content,
        createdAt: created.created_at,
        voteStatus: created.vote_count ?? 0,
        userVoteValue: 0,
      };

      setRepliesByParent((prev) => ({
        ...prev,
        [activeReplyParentId]: [
          ...(prev[activeReplyParentId] || []),
          newReply,
        ],
      }));

      setReplyText("");
      setActiveReplyParentId(null);
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }));
    } catch (error) {
      console.log("CreateReply Error", error);
    }
    setReplyLoading(false);
  };

  return (
    <Box bg={bg} borderRadius="0px 0px 4px 4px" p={2}>
      <Flex
        direction="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        {!fetchLoading && (
          <>
            {requiresMembership && !hasAccess ? (
              <Box
                p={4}
                textAlign="center"
                bg={bgAccessBox}
                borderRadius={4}
                border="1px solid"
                borderColor={lineBorderColor}
              >
                <Text fontSize="12pt" fontWeight={600} mb={2}>
                  {isPrivate ? "This is a private community" : "This is a restricted community"}
                </Text>
                <Text fontSize="10pt" color="gray.500" mb={4}>
                  {isPrivate
                    ? "You must be a member to comment"
                    : "You must join this community to comment"}
                </Text>
                {user ? (
                  <Button size="sm" onClick={() => router.push(`/r/${currentCommunity?.id}`)}>
                    {isPrivate ? "Join Community" : "Join to Comment"}
                  </Button>
                ) : (
                  <Text fontSize="9pt" color="gray.400">
                    Please log in to join
                  </Text>
                )}
              </Box>
            ) : (
          <CommentInput
            commentText={commentText}
            setCommentText={setCommentText}
            isAuthenticated={!!user}
            displayName={user?.profile?.full_name || user?.email}
            createLoading={createLoading}
            onCreateComments={onCreateComments}
          />
            )}
          </>
        )}
      </Flex>
      <Stack spacing={6} p={2}>
        {fetchLoading ? (
          <>
            {[0, 1, 2].map((item) => (
              <Box key={item} padding="6" bg={bg}>
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={2} spacing="4" />
              </Box>
            ))}
          </>
        ) : (
          <>
            {comments.length === 0 ? (
              <Flex
                direction="column"
                justify="center"
                align="center"
                borderTop="1px solid"
                borderColor={lineBorderColor}
                p={20}
              >
                <Text fontWeight={700} opacity={0.3}>
                  No Comments Yet
                </Text>
              </Flex>
            ) : (
              <>
                {comments.map((comment) => (
                  <Box key={comment.id} mb={2}>
                    <CommentItem
                      comment={comment}
                      onDeleteComment={onDeleteComment}
                      isLoading={loadingDeleteId === comment.id!}
                      userId={user ? String(user.id) : undefined}
                      onVote={handleVoteComment}
                      onReply={handleReply}
                    />
                    {activeReplyParentId === comment.id && !!user && (
                      <Box pl={10} mt={2}>
                        {requiresMembership && !hasAccess ? (
                          <Box
                            p={3}
                            textAlign="center"
                            bg={bgAccessBox}
                            borderRadius={4}
                            border="1px solid"
                            borderColor={lineBorderColor}
                          >
                            <Text fontSize="10pt" color="gray.500">
                              {isPrivate
                                ? "You must be a member to reply"
                                : "You must join this community to reply"}
                            </Text>
                          </Box>
                        ) : (
                        <CommentInput
                          commentText={replyText}
                          setCommentText={setReplyText}
                          isAuthenticated={!!user}
                          displayName={
                            user.profile?.full_name || user.email
                          }
                          createLoading={replyLoading}
                          onCreateComments={handleSubmitReply}
                        />
                        )}
                      </Box>
                    )}
                    {repliesByParent[comment.id!] &&
                      repliesByParent[comment.id!].length > 0 && (
                        <Stack pl={10} mt={2} spacing={4}>
                          {repliesByParent[comment.id!].map((reply) => (
                            <CommentItem
                              key={reply.id}
                              comment={reply}
                              onDeleteComment={onDeleteComment}
                              isLoading={false}
                              userId={user ? String(user.id) : undefined}
                              onVote={handleVoteComment}
                            />
                          ))}
                        </Stack>
                      )}
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};
export default Comments;

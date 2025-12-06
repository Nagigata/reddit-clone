import { Stack, Text, Box, Button, Flex, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Community } from "../../atoms/CommunitiesAtom";
import { Post } from "../../atoms/PostAtom";
import { useAuth } from "../../contexts/AuthContext";
import { postService } from "../../services/postService";
import usePosts from "../../hooks/usePosts";
import useCommunityData from "../../hooks/useCommunityData";
import PostItem from "./PostItem";
import PostLoader from "./PostLoader";

type PostsProps = {
  communityData: Community;
  userId?: string;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  } = usePosts();
  const { communityStateValue } = useCommunityData();
  const bgBox = useColorModeValue("white", "#1A202C");
  const borderColorBox = useColorModeValue("gray.300", "#2D3748");

  // Check if user is a member (status APPROVED)
  const isMember = !!communityStateValue.mySnippets.find(
    (snippet) => snippet.communityId === communityData.id
  );
  const isCreator = user && String(user.id) === communityData.creatorId;
  const hasAccess = isMember || isCreator;

  // Private community: only members can view posts
  const isPrivate = communityData.typeId === 1;
  const canViewPosts = !isPrivate || hasAccess;

  const getPost = async () => {
    // Private community: check access before fetching
    if (isPrivate && !hasAccess) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const communityIdNum =
        communityData.backendId ?? Number(communityData.id);
      
      const response = await postService.getPosts(
        20,
        0,
        communityIdNum && !isNaN(communityIdNum) ? communityIdNum : undefined
      );

      const filteredPosts = response.posts.filter((p) => {
          // Filter posts by community if subreddit_id is provided
          if (communityIdNum && !isNaN(communityIdNum)) {
            return p.subreddit_id === communityIdNum;
          }
          return true;
      });

      const posts: Post[] = filteredPosts.map((p) => {
          let voteStatus = 0;
          if (p.vote_count !== undefined) {
            voteStatus = p.vote_count;
          } else if (p.upvotes !== undefined && p.downvotes !== undefined) {
            voteStatus = p.upvotes - p.downvotes;
          }

          const creatorDisplayName =
            p.author?.full_name ||
            p.author?.email?.split("@")[0] ||
            "anonymous";

          const communityName =
            p.community?.name || communityData.id;

          const communityImageURL =
            p.community?.avatar || communityData.imageURL || "";

          return {
            id: String(p.id),
            communityId: String(p.subreddit_id || communityData.id),
            communityName,
            creatorId: String(p.author_id),
            creatorDisplayName,
            title: p.title,
            body: p.content ?? "",
            numberOfComments: Number(p.nr_of_comments || 0),
            voteStatus,
            imageURL: p.media?.[0]?.media_url,
            communityImageURL,
            createdAt: p.created_at
              ? ({ seconds: new Date(p.created_at).getTime() / 1000 } as any)
              : ({ seconds: Date.now() / 1000 } as any),
          };
        });

      // Map my_vote vào postVotes
      const postVotes = filteredPosts
        .filter((p) => p.my_vote !== undefined && p.my_vote !== 0)
        .map((p) => ({
          id: `vote-${p.id}`,
          postId: String(p.id),
          communityId: String(p.subreddit_id || communityData.id),
          voteValue: p.my_vote!,
        }));

      setPostStateValue((prev) => ({
        ...prev,
        posts,
        postVotes: postVotes,
      }));
    } catch (error: any) {
      console.log("get post error", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityData.id, communityData.backendId]);

  // Private community access denied
  if (isPrivate && !hasAccess) {
    return (
      <Box
        p={8}
        textAlign="center"
        bg={bgBox}
        borderRadius={8}
        border="1px solid"
        borderColor={borderColorBox}
      >
        <Text fontSize="16pt" fontWeight={600} mb={2}>
          This is a private community
        </Text>
        <Text fontSize="10pt" color="gray.500" mb={4}>
          You must be a member to view posts
        </Text>
        {!user ? (
          <Button onClick={() => router.push("/")}>
            Go to Home
          </Button>
        ) : (
          <Button onClick={() => router.push(`/r/${communityData.id}`)}>
            Join Community
          </Button>
        )}
      </Box>
    );
  }

  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack>
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={String(user?.id) === item.creatorId}
              userVoteValue={
                postStateValue.postVotes.find(
                  (vote) => vote.postId === item.id
                )?.voteValue
              }
              onVote={onVote}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
            />
          ))}
        </Stack>
      )}
    </>
  );
};
export default Posts;

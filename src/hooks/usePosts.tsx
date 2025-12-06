import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModelState } from "../atoms/authModalAtom";
import { CommunityState } from "../atoms/CommunitiesAtom";
import { Post, postState, PostVote } from "../atoms/PostAtom";
import { useAuth } from "../contexts/AuthContext";
import { postService } from "../services/postService";

const usePosts = () => {
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const { user } = useAuth();
  const router = useRouter();
  const setAuthModalState = useSetRecoilState(authModelState);
  const currentCommunity = useRecoilValue(CommunityState).currentCommunity;
  const onVote = async (
    event: React.MouseEvent<Element, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    try {
      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );

      // Tìm vote hiện tại của user cho post này
      const currentVote = postStateValue.postVotes.find(
        (v) => v.postId === post.id
      );
      const currentVoteValue = currentVote?.voteValue || 0;

      // Tính toán vote mới
      let newVoteValue = vote;
      if (currentVoteValue === vote) {
        // Nếu click lại cùng loại vote, bỏ vote (0)
        newVoteValue = 0;
      } else {
        // Nếu click vote khác, chuyển sang vote mới
        newVoteValue = vote;
      }

      // Tính toán voteStatus mới
      const voteChange = newVoteValue - currentVoteValue;
      updatedPost.voteStatus = (updatedPost.voteStatus || 0) + voteChange;

      // Gọi API vote
      const postIdNumber = Number(post.id);
      if (!isNaN(postIdNumber)) {
        await postService.upsertVote({
          post_id: postIdNumber,
          vote_type: newVoteValue,
        });

        try {
          const updatedPostData = await postService.getPostById(postIdNumber);
          // Cập nhật voteStatus từ API response nếu có
          if (updatedPostData.vote_count !== undefined) {
            updatedPost.voteStatus = updatedPostData.vote_count;
          } else if (updatedPostData.upvotes !== undefined && updatedPostData.downvotes !== undefined) {
            updatedPost.voteStatus = updatedPostData.upvotes - updatedPostData.downvotes;
          }
  
          if (updatedPostData.my_vote !== undefined) {
            newVoteValue = updatedPostData.my_vote;
          }
        } catch (error) {
          console.log("Failed to fetch updated post vote count", error);
          // Nếu fetch thất bại, vẫn dùng tính toán local
        }
      }

      // Cập nhật postVotes
      const updatedVotes = [...postStateValue.postVotes];
      if (newVoteValue === 0) {
        // Bỏ vote
        const voteIndex = updatedVotes.findIndex(
          (v) => v.postId === post.id
        );
        if (voteIndex !== -1) {
          updatedVotes.splice(voteIndex, 1);
        }
      } else {
        // Cập nhật hoặc thêm vote
        const voteIndex = updatedVotes.findIndex((v) => v.postId === post.id);
        if (voteIndex !== -1) {
          updatedVotes[voteIndex] = {
            ...updatedVotes[voteIndex],
            voteValue: newVoteValue,
          };
        } else {
          if (post.id) {
            updatedVotes.push({
              id: String(Date.now()),
              postId: post.id,
              communityId,
              voteValue: newVoteValue,
          });
        }
      }
      }

      updatedPosts[postIdx] = updatedPost;

      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedVotes,
      }));

      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatedPost,
        }));
      }
    } catch (error) {
      console.log("onVote Error", error);
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }));
    router.push(`/r/${post.communityId}/comments/${post.id}`);
  };

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      const postIdNumber = Number(post.id);
      await postService.deletePost(isNaN(postIdNumber) ? 0 : postIdNumber);

      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  };
};

export default usePosts;

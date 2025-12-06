import { Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import usePosts from "../../hooks/usePosts";
import Recommendation from "../Community/Recommendation";
import PageContent from "../Layout/PageContent";
import PostItem from "../posts/PostItem";
import PostLoader from "../posts/PostLoader";
import NoPost from "./NoPost";
import ProfileSide from "./ProfileSide";
import ProfileTopBar from "./ProfileTopBar";

type Props = {};

function MainContainer({}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const {
    postStateValue,
    onDeletePost,
    onSelectPost,
    onVote,
  } = usePosts();

  return (
    <PageContent>
      <>
        <ProfileTopBar />
          <Stack>
            <>
              {postStateValue.posts.length > 0 ? (
                <>
                  {postStateValue.posts.map((post) => (
                    <PostItem
                      key={post.id}
                      post={post}
                      onVote={onVote}
                      onDeletePost={onDeletePost}
                      userVoteValue={
                        postStateValue.postVotes.find(
                          (item) => item.postId === post.id
                        )?.voteValue
                      }
                    userIsCreator={user?.id?.toString() === post.creatorId}
                      onSelectPost={onSelectPost}
                      homePage
                    />
                  ))}
                </>
              ) : (
                <NoPost />
              )}
            </>
          </Stack>
      </>
      <Stack spacing={5}>
        {user && <ProfileSide />}
        <Recommendation />
      </Stack>
    </PageContent>
  );
}

export default MainContainer;

import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModelState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  CommunityState,
} from "../atoms/CommunitiesAtom";
import { auth } from "../firebase/clientApp";

const useCommunityData = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const setAuthModelState = useSetRecoilState(authModelState);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(CommunityState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👉 Xử lý khi click Join / Leave
  const onJoinOrCommunity = (communityData: Community, isJoined: boolean) => {
    if (!user) {
      setAuthModelState({ open: true, view: "login" });
      return;
    }

    if (isJoined) {
      leaveCommunity(communityData.community_id);
      return;
    }
    joinCommunity(communityData);
  };

  // 👉 Lấy danh sách community mà user đã tham gia
  const getMySnippets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/joined-community/1`
        // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/joined-community/${user.uid}`
      );

      // API trả về mảng các community mà user đã tham gia
      const snippets = res.data.map((item: any) => ({
        communityId: item.community_id,
        imageURL: item.avatar || "",
        communityName: item?.name,
        isModerator: item.created_by === 1,
        statusCommunity: item?.status
      }));

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetsFetched: true,
      }));
    } catch (err: any) {
      console.error("Get My Snippets Error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  // 👉 Lấy dữ liệu 1 community theo id
  const getCommunityData = async (communityId: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/${communityId}`
      );

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: res.data as Community,
      }));
    } catch (err) {
      console.error("Get Community Data Error:", err);
    }
  };

  // 👉 Tham gia community
  const joinCommunity = async (communityData: Community) => {
    if (!user) return;
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member`,
        {
          community_id: communityData.community_id,
          user_id: user.uid,
          role: 'member'
        }
      );

      const newSnippet: CommunitySnippet = {
        communityId: communityData.community_id,
        imageURL: communityData.avatar || "",
        communityName: communityData.name,
        isModerator: 1 === Number(communityData.created_by),
        statusCommunity: communityData.status
      };

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (err: any) {
      console.error("Join Community Error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  // 👉 Rời khỏi community
  const leaveCommunity = async (communityId: number) => {
    if (!user) return;
    setLoading(true);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/leave`,
        {
          data: {
            communityId,
            userId: user.uid,
          },
        }
      );

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }));
    } catch (err: any) {
      console.error("Leave Community Error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  // 👉 useEffect để tự load snippets khi có user
  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetsFetched: false,
      }));
      return;
    }
    getMySnippets();
  }, [user]);

  // 👉 useEffect để tự load community hiện tại (nếu vào trang chi tiết)
  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string);
    }
  }, [router.query, communityStateValue.currentCommunity]);

  return {
    communityStateValue,
    onJoinOrCommunity,
    loading,
    error,
    setCommunityStateValue
  };
};

export default useCommunityData;

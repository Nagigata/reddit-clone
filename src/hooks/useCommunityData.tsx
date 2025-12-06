import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModelState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  CommunityState,
} from "../atoms/CommunitiesAtom";
import { useAuth } from "../contexts/AuthContext";
import {
  CommunityDto,
  communityService,
} from "../services/communityService";

const mapDtoToCommunity = (dto: CommunityDto): Community => {
  const backendId = dto.community_id ?? dto.id;
  const slug = backendId ? String(backendId) : "";

  let typeId = dto.type_id ?? dto.communityType?.type_id;

  const typeString = dto.type || dto.communityType?.type;
  if (!typeId && typeString) {
    const t = typeString.toLowerCase();
    if (t === "private") typeId = 1;
    else if (t === "public") typeId = 2;
    else if (t === "restricted") typeId = 3;
  }

  return {
    id: slug, 
    backendId,
    name: dto.name, 
    creatorId: String(dto.created_by ?? ""),
    numberOfMembers: dto.members ?? 0,
    privacyType: "public",
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
    imageURL: dto.avatar,
    typeId,
  };
};

const useCommunityData = () => {
  const { user } = useAuth();
  const router = useRouter();
  const setAuthModelState = useSetRecoilState(authModelState);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(CommunityState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onJoinOrCommunity = (communityData: Community, isJoined: boolean) => {
    if (!user) {
      // model
      setAuthModelState({ open: true, view: "login" });
      return;
    }

    if (isJoined) {
      // Admin (creator) không được rời khỏi community
      if (user && String(user.id) === communityData.creatorId) {
        return;
      }
      leaveCommunity(communityData);
      return;
    }
    joinCommunity(communityData);
  };

  const getMySnippets = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setCommunityStateValue((prev) => ({
          ...prev,
          mySnippets: [],
          snippetsFetched: false,
        }));
        setLoading(false);
        return;
      }

      const joined = await communityService.getJoinedCommunities(user.id);

      const snippets: CommunitySnippet[] = joined.map((c) => {
        const backendId = c.community_id ?? c.id;
        // Use ID as the identifier for routing
        const slug = backendId ? String(backendId) : "";
        return {
          communityId: slug,
          backendId,
          name: c.name, 
          imageURL: c.avatar,
          isModerator: c.created_by === user.id,
        };
      });

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets,
        snippetsFetched: true,
      }));

      //console.log(snippets, "🙌🚀🚀");
    } catch (error: any) {
      console.log("Get My Snippet Error", error);
      setError(error.message);
    }
    setLoading(false);
  }, [user, setCommunityStateValue]);

  const getCommunityData = useCallback(async (communityId: string) => {
    try {
      const dto = await communityService.getCommunityById(communityId);

      const community = mapDtoToCommunity(dto);

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: community,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [setCommunityStateValue]);

  useEffect(() => {
    getMySnippets();
  }, [getMySnippets]);

  useEffect(() => {
    const { communityId } = router.query;

    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string);
    }
  }, [
    router.query,
    communityStateValue.currentCommunity,
    getCommunityData,
  ]);

  const joinCommunity = async (communityData: Community) => {
    setLoading(true);
    try {
      if (!user) return;

      const communityIdNumber =
        communityData.backendId ?? Number(communityData.id);

      if (!communityIdNumber || Number.isNaN(communityIdNumber)) {
        throw new Error("Missing community id");
      }

      // 
      const typeId = communityData.typeId;
      const isPublic = !typeId || typeId === 2;
      const status = isPublic ? "APPROVED" : "PENDING";
      await communityService.joinCommunity({
        community_id: communityIdNumber,
        user_id: user.id,
        status,
      });

      if (status === "APPROVED") {
        const newSnippet: CommunitySnippet = {
          communityId: communityData.id,
          backendId: communityIdNumber,
          name: communityData.name, 
          imageURL: communityData.imageURL || "",
          isModerator: String(user.id) === communityData.creatorId,
        };

        setCommunityStateValue((prev) => ({
          ...prev,
          mySnippets: [...prev.mySnippets, newSnippet],
        }));
      } else {
        setCommunityStateValue((prev) => ({
          ...prev,
          pendingCommunityIds: prev.pendingCommunityIds.includes(
            communityData.id
          )
            ? prev.pendingCommunityIds
            : [...prev.pendingCommunityIds, communityData.id],
        }));
      }
    } catch (error: any) {
      console.log("JoinCommunity Error", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const leaveCommunity = async (communityData: Community) => {
    setLoading(true);
    try {
      if (!user) return;

      const communityIdNumber =
        communityData.backendId ?? Number(communityData.id);

      if (!communityIdNumber || Number.isNaN(communityIdNumber)) {
        throw new Error("Missing community id");
      }

      await communityService.rejectMember(communityIdNumber, user.id);

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityData.id
        ),
        pendingCommunityIds: prev.pendingCommunityIds.filter(
          (id) => id !== communityData.id
        ),
      }));
    } catch (error: any) {
      console.log("JoinCommunity Error", error);
      setError(error.message);
    }
    setLoading(false);
  };

  return {
    communityStateValue,
    onJoinOrCommunity,
    loading,
  };
};
export default useCommunityData;

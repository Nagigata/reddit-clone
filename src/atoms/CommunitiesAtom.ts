import { atom } from "recoil";

export interface Community {
  id: string; 
  backendId?: number;
  name?: string; 
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "restricted" | "private";
  createdAt?: Date | string;
  imageURL?: string;
  typeId?: number;
}

export interface CommunitySnippet {
  communityId: string;
  backendId?: number;
  name?: string; 
  isModerator?: boolean;
  imageURL?: string;
  updateTimeStamp?: Date | string;
}

interface CommunityState {
  mySnippets: CommunitySnippet[];
  currentCommunity?: Community;
  snippetsFetched: boolean;
  pendingCommunityIds: string[];
}

export const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetsFetched: false,
  pendingCommunityIds: [],
};

export const CommunityState = atom<CommunityState>({
  key: "communityState",
  default: defaultCommunityState,
});

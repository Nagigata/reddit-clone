import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export interface Community {
  community_id: number;
  name: string;
  avatar: string;
  type: string;
  members: number;
  status: string;
  created_by: number;
  created_at: string;
}

export interface CommunitySnippet {
  communityId: number;
  isModerator?: boolean;
  imageURL?: string;
  statusCommunity: string;
  communityName: string;
  updateTimeStamp?: Timestamp;
}

interface CommunityState {
  mySnippets: CommunitySnippet[];
  currentCommunity?: Community;
  snippetsFetched: boolean;
}

export const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetsFetched: false,
};

export const CommunityState = atom<CommunityState>({
  key: "communityState",
  default: defaultCommunityState,
});

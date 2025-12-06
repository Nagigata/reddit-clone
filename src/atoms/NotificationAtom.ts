import { atom } from "recoil";
import { Notification } from "../services/notificationService";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  nextCursor: string | null;
  isLoading: boolean;
}

const defaultNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  nextCursor: null,
  isLoading: false,
};

export const notificationState = atom<NotificationState>({
  key: "NotificationState",
  default: defaultNotificationState,
});


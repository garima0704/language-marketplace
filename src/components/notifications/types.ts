export type NotificationType =
  | "comment"
  | "like"
  | "report"
  | "seller"
  | "system";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  href?: string | null;
  is_read: boolean;
  created_at: string;
};
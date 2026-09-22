import type { ComponentType } from "react";

export type Section =
  | "account"
  | "notifications"
  | "payouts"
  | "delete-account";

export type SettingItem = {
  id: Section;
  title: string;
  icon: ComponentType<{ className?: string }>;
};
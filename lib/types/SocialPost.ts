export type Platform = "instagram" | "linkedin";

export type SocialPost = {
  id: string;
  platform: Platform;
  originalUrl: string;
  caption: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

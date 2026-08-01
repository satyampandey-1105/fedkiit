import type { Platform } from "@/lib/types/SocialPost";

export function deriveEmbedUrl(url: string, platform: Platform): string {
  const normalized = url.trim();

  if (!normalized) {
    return "";
  }

  if (platform === "instagram") {
    const instagramMatch = normalized.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([^/?#]+)(?:[/?#].*)?$/i,
    );

    if (instagramMatch) {
      const shortcode = instagramMatch[1];
      return `https://www.instagram.com/p/${shortcode}/embed/`;
    }

    return normalized;
  }

  if (normalized.includes("linkedin.com/embed/feed/update/")) {
    return normalized;
  }

  const linkedInUrnMatch = normalized.match(/(?:urn:li:(?:share|ugcPost):[^/?#]+)/i);
  if (linkedInUrnMatch) {
    return `https://www.linkedin.com/embed/feed/update/${linkedInUrnMatch[0]}`;
  }

  const linkedInFeedMatch = normalized.match(
    /linkedin\.com\/feed\/update\/([^/?#]+)/i,
  );
  if (linkedInFeedMatch) {
    return `https://www.linkedin.com/embed/feed/update/${linkedInFeedMatch[1]}`;
  }

  return normalized;
}

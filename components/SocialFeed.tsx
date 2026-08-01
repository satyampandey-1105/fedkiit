"use client";

import { useEffect, useState } from "react";

import type { SocialPost } from "@/lib/types/SocialPost";
import { deriveEmbedUrl } from "@/lib/utils/embedUrl";

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch("/api/social-posts?visibility=visible");
        const payload = (await response.json()) as {
          success: boolean;
          message: string;
          data: SocialPost[] | null;
        };

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load social posts");
        }

        setPosts(payload.data ?? []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load social posts",
        );
      }
    }

    void loadPosts();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {posts.length === 0 ? (
        <p>No public social posts to display yet.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} style={{ display: "grid", gap: 8 }}>
            <iframe
              src={deriveEmbedUrl(post.originalUrl, post.platform)}
              title={`${post.platform} social post`}
              loading="lazy"
              style={{ width: "100%", minHeight: 420, border: 0 }}
              allow="clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            {post.caption ? <p>{post.caption}</p> : null}
          </article>
        ))
      )}
    </section>
  );
}

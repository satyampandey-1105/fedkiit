"use client";

import { useContext, useEffect, useState } from "react";

import AuthContext from "@/src/context/AuthContext";
import type { Platform, SocialPost } from "@/lib/types/SocialPost";

const PLATFORM_OPTIONS: Platform[] = ["instagram", "linkedin"];

type SocialPostFormState = {
  platform: Platform;
  originalUrl: string;
  caption: string;
  isVisible: boolean;
};

const EMPTY_FORM: SocialPostFormState = {
  platform: "instagram",
  originalUrl: "",
  caption: "",
  isVisible: true,
};

export function SocialAdminPage() {
  const authCtx = useContext(AuthContext);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [form, setForm] = useState<SocialPostFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authCtx.isLoggedIn || authCtx.user.access !== "ADMIN") {
      return;
    }

    void loadPosts();
  }, [authCtx.isLoggedIn, authCtx.user.access]);

  async function loadPosts() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/social-posts");
      const payload = (await response.json()) as {
        success: boolean;
        message: string;
        data: SocialPost[] | null;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load posts");
      }

      setPosts(payload.data ?? []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load posts",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/social-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to create post");
      }

      setMessage(payload.message);
      setForm(EMPTY_FORM);
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create post",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(postId: string, isVisible: boolean) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/social-posts/${postId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update visibility");
      }

      setMessage(payload.message);
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update visibility",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(postId: string) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/social-posts/${postId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to delete post");
      }

      setMessage(payload.message);
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete post",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!authCtx.isLoggedIn || authCtx.user.access !== "ADMIN") {
    return (
      <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
        <h1>Social Post Admin</h1>
        <p>You must be signed in as an admin to manage social posts.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Social Post Admin</h1>
      <p>Manage Instagram and LinkedIn social embeds.</p>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {message ? <p style={{ color: "green" }}>{message}</p> : null}

      <form onSubmit={(event) => void submitPost(event)} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <label>
          Platform
          <select
            value={form.platform}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                platform: event.target.value as Platform,
              }))
            }
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>
                {platform[0].toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Original URL
          <input
            type="url"
            value={form.originalUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, originalUrl: event.target.value }))
            }
            placeholder="https://www.instagram.com/..."
            required
          />
        </label>

        <label>
          Caption
          <textarea
            value={form.caption}
            onChange={(event) =>
              setForm((current) => ({ ...current, caption: event.target.value }))
            }
            placeholder="Optional caption"
          />
        </label>

        <label>
          Visible on public social feed
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) =>
              setForm((current) => ({ ...current, isVisible: event.target.checked }))
            }
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create post"}
        </button>
      </form>

      <section>
        <h2>Existing posts</h2>
        {posts.length === 0 ? (
          <p>No social posts found yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Original URL</th>
                <th>Caption</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.platform}</td>
                  <td>{post.originalUrl}</td>
                  <td>{post.caption ?? "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        void toggleVisibility(post.id, !post.isVisible)
                      }
                    >
                      {post.isVisible ? "Hide" : "Show"}
                    </button>
                  </td>
                  <td>
                    <button type="button" onClick={() => void deletePost(post.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

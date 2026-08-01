# Work Plan: Admin Social Post Management (Social Links Only)

This document provides exact instructions for implementing the Social Post Management feature. 
**CRITICAL NOTE:** Although the original implementation plan references "Blog" management, **you must ignore all blog-related requirements**. Another team member is handling the blog integration on a separate branch. You are only responsible for the Instagram and LinkedIn features.

---

## 1. Context & Codebase Status
- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4.
- **Current DB Setup:** The codebase currently uses **Prisma** (`prisma/schema.prisma`) connected to MongoDB. 
  - *Decision Point:* The original implementation plan instructs to install the `mongodb` native driver and create a direct connection (`lib/mongodb.ts`). You can either follow this directly OR update the `schema.prisma` to include a `SocialPost` model and use Prisma instead. Choose the approach that best fits the existing architecture.

## 2. Data Model
Create the TypeScript types for the posts (e.g., in `lib/types/SocialPost.ts`). 
- The `Platform` type MUST strictly be: `export type Platform = 'instagram' | 'linkedin';`
- Do not include 'blog'.

## 3. Utility Functions
Create the URL parsing utility (e.g., `lib/utils/embedUrl.ts`).
- Implement the `deriveEmbedUrl` function.
- It should only contain logic to derive embed URLs for **Instagram** and **LinkedIn**.
- Do not include any fallback logic for blog links.

## 4. API Routes (`app/api/social-posts`)
Implement the backend routes for CRUD operations:
- `GET /api/social-posts`: Fetch all posts (optionally filtered by visibility).
- `POST /api/social-posts`: Create a new post.
- `PUT /api/social-posts/[id]`: Update an existing post.
- `DELETE /api/social-posts/[id]`: Delete a post.
- `PATCH /api/social-posts/[id]/visibility`: Toggle post visibility.
*Note: Ensure these routes enforce the `x-admin-secret` header.*

## 5. Admin Panel (`app/admin/page.tsx`)
Create the Admin UI for managing social posts.
- **Form Select:** The platform dropdown should only contain options for `Instagram` and `LinkedIn`. Do not add a `Blog` option.
- **Table/List:** Display the platform, original URL, caption, and visibility toggle.
- **Authentication:** Implement the simple client-side `sessionStorage` secret check as defined in the plan.

## 6. Social Feed Component (`components/SocialFeed.tsx`)
Create the component that fetches and displays the posts.
- Fetch posts where `isVisible: true`.
- Render `<iframe>` tags for Instagram and LinkedIn embeds based on `post.platform`.
- Do not implement any custom cards or link rendering for blogs.

## 7. Integration (`app/(main)/Social/page.jsx`)
- Import and render the `<SocialFeed />` component inside the existing Social page.
- Do not rename or merge this page with the Blogs page. Keep it focused on Social media.

## 8. Security & Config
- **Middleware:** Implement `middleware.ts` to protect the `/admin` route (redirecting to a login or handling auth).
- **CSP Headers:** Update `next.config.ts` to allow `frame-src` for `https://www.instagram.com` and `https://www.linkedin.com` so the iframes can load properly.

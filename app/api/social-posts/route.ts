import { ApiError } from "@/lib/api/errors";
import { created, handleRoute, ok, readJson } from "@/lib/api/respond";
import { requireAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/db";
import type { Platform } from "@/lib/types/SocialPost";

const VALID_PLATFORMS: Platform[] = ["instagram", "linkedin"];

type SocialPostRow = {
  id: string;
  platform: Platform;
  originalUrl: string;
  caption: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function requireAdmin() {
  await requireAccess("ADMIN");
}

function parsePlatform(value: unknown): Platform {
  if (typeof value !== "string" || !VALID_PLATFORMS.includes(value as Platform)) {
    throw new ApiError(
      400,
      "platform must be one of: instagram, linkedin",
    );
  }

  return value as Platform;
}

function parseVisibilityFilter(value: string | null): boolean | undefined {
  if (!value) return undefined;
  if (value === "visible") return true;
  if (value === "hidden") return false;
  return undefined;
}

export async function GET(request: Request) {
  return handleRoute(async () => {
    const visibility = parseVisibilityFilter(
      new URL(request.url).searchParams.get("visibility"),
    );

    if (visibility === undefined) {
      await requireAdmin();
    }

    const posts = (await prisma.socialPost.findMany({
      where: visibility === undefined ? undefined : { isVisible: visibility },
      orderBy: { createdAt: "desc" },
    })) as SocialPostRow[];

    return ok(
      posts.map((post: SocialPostRow) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
      "Social posts fetched successfully",
    );
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAdmin();

    const body = await readJson<{
      platform?: unknown;
      originalUrl?: unknown;
      caption?: unknown;
      isVisible?: unknown;
    }>(request);

    if (typeof body.originalUrl !== "string" || body.originalUrl.trim().length === 0) {
      throw new ApiError(400, "originalUrl is required");
    }

    const createdPost = await prisma.socialPost.create({
      data: {
        platform: parsePlatform(body.platform),
        originalUrl: body.originalUrl.trim(),
        caption: typeof body.caption === "string" ? body.caption.trim() : null,
        isVisible:
          typeof body.isVisible === "boolean" ? body.isVisible : true,
      },
    });

    return created(
      {
        ...createdPost,
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      },
      "Social post created successfully",
    );
  });
}

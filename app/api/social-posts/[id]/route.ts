import { ApiError } from "@/lib/api/errors";
import { handleRoute, ok, readJson } from "@/lib/api/respond";
import { requireAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/db";
import type { Platform } from "@/lib/types/SocialPost";

const VALID_PLATFORMS: Platform[] = ["instagram", "linkedin"];

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    await requireAdmin();

    const { id } = await params;
    const body = await readJson<{
      platform?: unknown;
      originalUrl?: unknown;
      caption?: unknown;
      isVisible?: unknown;
    }>(request);

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Social post not found");
    }

    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        ...(body.platform !== undefined ? { platform: parsePlatform(body.platform) } : {}),
        ...(typeof body.originalUrl === "string" && body.originalUrl.trim().length > 0
          ? { originalUrl: body.originalUrl.trim() }
          : {}),
        ...(typeof body.caption === "string"
          ? { caption: body.caption.trim() || null }
          : {}),
        ...(typeof body.isVisible === "boolean" ? { isVisible: body.isVisible } : {}),
      },
    });

    return ok(
      {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      "Social post updated successfully",
    );
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    await requireAdmin();

    const { id } = await params;
    const existing = await prisma.socialPost.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError(404, "Social post not found");
    }

    await prisma.socialPost.delete({ where: { id } });

    return ok(null, "Social post deleted successfully");
  });
}

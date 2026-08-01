import { ApiError } from "@/lib/api/errors";
import { handleRoute, ok, readJson } from "@/lib/api/respond";
import { requireAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  await requireAccess("ADMIN");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    await requireAdmin();

    const { id } = await params;
    const body = await readJson<{ isVisible?: unknown }>(request);

    if (typeof body.isVisible !== "boolean") {
      throw new ApiError(400, "isVisible must be a boolean");
    }

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Social post not found");
    }

    const updated = await prisma.socialPost.update({
      where: { id },
      data: { isVisible: body.isVisible },
    });

    return ok(
      {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      "Social post visibility updated successfully",
    );
  });
}

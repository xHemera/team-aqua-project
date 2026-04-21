import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveProfileIcon } from "@/lib/profile-icons";
import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        badges: true,
        avatarId: true,
        image: true,
        profileBackground: true,
        profileBanner: true,
        avatar: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
      });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const fallbackAvatar = resolveProfileIcon({ id: user.avatarId, url: user.image });
    const dbAvatar = user.avatar ?? {
      id: fallbackAvatar.id,
      name: fallbackAvatar.name,
      url: fallbackAvatar.url,
    };
    const avatarMeta = resolveProfileIcon({ id: dbAvatar.id, url: dbAvatar.url });

    return Response.json({
      ...user,
      badges: user.badges ?? [],
      profileBackground: user.profileBackground ?? undefined,
      profileBanner: user.profileBanner ?? undefined,
      avatar: {
        id: dbAvatar.id,
        name: dbAvatar.name,
        url: dbAvatar.url,
        type: avatarMeta.type,
        accent: avatarMeta.accent,
        accentHover: avatarMeta.accentHover,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT()
{
const session = await auth.api.getSession({ headers: await headers() });
if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            online: false
        }
    });
    if (user) return Response.json(null, { status: 201});
    return Response.json({error: "Unprocessable entity"}, {status: 422});
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarId, profileBackground, profileBanner } = body as {
      avatarId: string;
      profileBackground?: string | null;
      profileBanner: string | null;
    };

    // Validate and find avatar if provided
    let nextAvatar = null;
    if (avatarId) {
      nextAvatar = await prisma.avatar.findUnique({
        where: { id: avatarId },
        select: {
          id: true,
          name: true,
          url: true,
        },
      });

      if (!nextAvatar) {
        return Response.json({ error: "Avatar not found" }, { status: 404 });
      }
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {};
    if (avatarId && nextAvatar) {
      updateData.avatar = { connect: { id: nextAvatar.id } };
      updateData.image = nextAvatar.url;
    }
    if (profileBackground !== undefined) {
      updateData.profileBackground = profileBackground;
    }
    if (profileBanner !== undefined) {
      updateData.profileBanner = profileBanner;
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        avatarId: true,
        profileBackground: true,
        profileBanner: true,
        avatar: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    });

    const avatarMeta = nextAvatar
      ? resolveProfileIcon({ id: nextAvatar.id, url: nextAvatar.url })
      : resolveProfileIcon({ id: updated.avatarId, url: updated.avatar?.url });

    return Response.json({
      ...updated,
      avatar: {
        id: updated.avatar?.id ?? nextAvatar?.id,
        name: updated.avatar?.name ?? nextAvatar?.name,
        url: updated.avatar?.url ?? nextAvatar?.url,
        type: avatarMeta.type,
        accent: avatarMeta.accent,
        accentHover: avatarMeta.accentHover,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      await tx.messages.deleteMany({ where: { user_id: userId } });
      //await tx.inbox.deleteMany({ where: { inboxUser: {some : {user_id: userId } } } });
      await tx.inbox_users.deleteMany({ where: { user_id: userId } });
      await tx.friends.deleteMany({ where: { userId: userId } });
      await tx.session.deleteMany({ where: { userId: userId } });
      await tx.account.deleteMany({ where: { userId: userId } });
      await tx.match_history.deleteMany({ where: { user_id: userId } });

      await tx.user.delete({ where: { id: userId } });
    });

    return Response.json({ success: true }, { status: 200});
  } catch (error) {
    console.error("Error deleting profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

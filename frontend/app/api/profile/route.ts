import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveProfileIcon } from "@/lib/profile-icons";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarId: true,
        image: true,
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

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarId } = body as { avatarId: string };

    if (!avatarId) {
      return Response.json({ error: "avatarId is required" }, { status: 400 });
    }

    const nextAvatar = await prisma.avatar.findUnique({
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

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatarId: nextAvatar.id,
        image: nextAvatar.url,
      },
      select: {
        id: true,
        name: true,
        avatarId: true,
        image: true,
        avatar: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    });

    const avatarMeta = resolveProfileIcon({ id: nextAvatar.id, url: nextAvatar.url });

    return Response.json({
      ...updated,
      avatar: {
        id: nextAvatar.id,
        name: nextAvatar.name,
        url: nextAvatar.url,
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

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { username?: string };
    const username = body.username?.trim();

    if (!username) {
      return Response.json(
        { error: "enter a username" },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        name: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        badges: true,
        avatar: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!targetUser) {
      return Response.json({ error: "this player does not exist" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return Response.json(
        { error: "you cannot invite yourself" },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      message: "your invitation has been sent",
      user: {
        name: targetUser.name,
        avatarUrl: targetUser.image ?? targetUser.avatar?.url,
        badges: targetUser.badges ?? [],
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { username?: string };
    const username = body.username?.trim();

    if (!username) {
      return Response.json(
        { error: "entrez le nom d'utilisateur" },
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
        avatar: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!targetUser) {
      return Response.json({ error: "ce joueur n'existe pas" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return Response.json(
        { error: "vous ne pouvez pas vous inviter" },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      message: "votre invitation a bien ete envoyer",
      user: {
        name: targetUser.name,
        avatarUrl: targetUser.image ?? targetUser.avatar?.url,
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

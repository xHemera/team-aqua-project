import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function POST(request: Request) {
  const h = await headers();
  const ip = h
  .get("x-forwarded-for")
  ?.split(",")[0]
  .trim() || "unknown";

  const allowed = await rateLimit(redis, `rl:inbox${ip}`, 20, 1);

  if (!allowed) {
      console.log("Too many requests");
      return Response.json({error: "Too many request"}, {status: 429});
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { username: string };
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
      return Response.json({ error: "This player does not exist" }, { status: 404 });
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
    }, {status: 200});
  } catch (error) {
    console.error("Error inviting user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

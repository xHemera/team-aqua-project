import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

const ensureGameState = async (userId: string) => {
  return prisma.gameState.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      rubis: 0,
    },
    update: {},
    select: {
      rubis: true,
    },
  });
};

export async function GET() {
  const h = await headers();
  const ip = h
  .get("x-forwarded-for")
  ?.split(",")[0]
  .trim() || "unknown";

  const allowed = await rateLimit(redis, `rl:ressources${ip}`, 20, 1);

  if (!allowed) {
      console.log("Too many requests");
      return Response.json({error: "Too many request"}, {status: 429});
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameState = await ensureGameState(session.user.id);
    return Response.json(gameState, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile resources:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const h = await headers();
  const ip = h
  .get("x-forwarded-for")
  ?.split(",")[0]
  .trim() || "unknown";

  const allowed = await rateLimit(redis, `rl:ressources${ip}`, 10, 1);

  if (!allowed) {
      console.log("Too many requests");
      return Response.json({error: "Too many request"}, {status: 429});
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      rubisDelta?: number;
    };

    const rubisDelta = Number(body.rubisDelta ?? 0);

    const gameState = await prisma.gameState.upsert({
      where: { user_id: session.user.id },
      create: {
        user_id: session.user.id,
        rubis: 0 + rubisDelta,
      },
      update: {
        rubis: { increment: rubisDelta },
      },
      select: {
        rubis: true,
      },
    });

    return Response.json(gameState, { status: 200 });
  } catch (error) {
    console.error("Error updating profile resources:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

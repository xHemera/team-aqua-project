import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PLAYER_RESOURCES } from "@/app/characters/character-roster";
import { headers } from "next/headers";

const ensureGameState = async (userId: string) => {
  return prisma.gameState.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      rubis: PLAYER_RESOURCES.ruby,
      gold: PLAYER_RESOURCES.coin,
    },
    update: {},
    select: {
      rubis: true,
      gold: true,
    },
  });
};

export async function GET() {
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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      rubisDelta?: number;
      goldDelta?: number;
    };

    const rubisDelta = Number(body.rubisDelta ?? 0);
    const goldDelta = Number(body.goldDelta ?? 0);

    const gameState = await prisma.gameState.upsert({
      where: { user_id: session.user.id },
      create: {
        user_id: session.user.id,
        rubis: PLAYER_RESOURCES.ruby + rubisDelta,
        gold: PLAYER_RESOURCES.coin + goldDelta,
      },
      update: {
        rubis: { increment: rubisDelta },
        gold: { increment: goldDelta },
      },
      select: {
        rubis: true,
        gold: true,
      },
    });

    return Response.json(gameState, { status: 200 });
  } catch (error) {
    console.error("Error updating profile resources:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

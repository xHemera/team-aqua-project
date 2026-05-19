import prisma from "@/lib/prisma";
import { CHARACTERS } from "@/public/gameResources/heroes";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function GET(req: Request)
{
  const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:friend${ip}`, 20, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }
    try {
      const {searchParams} = new URL(req.url);
      const currentUser = searchParams.get("currentUser");
      const otherUser = searchParams.get("otherUser");
      if (!currentUser || !otherUser)
        return Response.json({error: "Internal server error"}, {status: 500});
      
      let characters: CharacterData[];
      
    }
    catch (e) {
      console.log(e);
    }
}

export async function POST(req: Request)
{
  const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:characters${ip}`, 5, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }
    try {
      const data = await req.json();
      const { name } = data;
      console.log(name);
      const userId = await prisma.user.findFirst({
        where: { name: name },
        select: {
          id: true,
          gameState: true,
        }
      });
      if (!userId)
        return Response.json({error: "Internal server error"}, {status: 500});

      const gs = await prisma.gameState.create({
        data: {
          user_id: userId.id,
          rubis: 0,
        }
      });
      if (!gs)
        return Response.json({error: "Internal server error"}, {status: 500});

      for (const character of CHARACTERS)
      {
        const char = await prisma.character.create({
          data: {
            gameStateId: gs.id,
            name: character.identity.name,
            hp: character.baseStats.hp,
            level: 1,
          }
        })
        if (!char)
          return Response.json({error: "Internal server error"}, {status: 500});
        for (const spell of character.skills)
        {
          await prisma.spell.create({
            data: {
              characterId: char.id,
              name: spell.info.name,
              type: spell.type,
              mpCost: spell.manaCost,
              level: 1,
            }
          });
        }
      }
      return Response.json({msg: "Created"}, {status: 201});
    }
    catch (e) {
      console.log(e);
      return Response.json({error: "Internal server error"}, {status: 500});
    }
}
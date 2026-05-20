import prisma from "@/lib/prisma";
import { CHARACTERS } from "@/public/gameResources/heroes";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";
import type { CharacterData, CharacterSkill, CharacterStats, PlayerResources } from "@/components/organisms/characters/types";

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
    const currentUser = searchParams.get("username");
    if (!currentUser)
      return Response.json({error: "Internal server error"}, {status: 500});
    
    let characters: CharacterData[] = [];
    const user = await prisma.user.findFirst({
      where: {
        name: currentUser,
      },
      select: {
        id: true,
        gameState: {
          select: {
            characters: {
              select: { 
                name: true,
                level: true,
                spells: true,
                id: true,
                xp: true,
              }
            },
            rubis: true,
          }
        }
      }
    });
    if (!user || !user.gameState || !user.gameState.characters)
      return Response.json({error: "Internal server error"}, {status: 500});

    for (const char of user.gameState.characters)
    {
      const c = CHARACTERS.find(i => i.identity.name === char.name);
      if (!c)
        return Response.json({error: "Internal server error"}, {status: 500});

      let skills: CharacterSkill[] = [];
      for (const spell of c.skills)
      {
        const s = char.spells.find(i => i.name === spell.info.name)
        if (!s)
          continue;
        const lvl = s.level;
        const skill: CharacterSkill = {
          id: s.id,
          name: spell.info.name,
          image: spell.info.icon,
          description: spell.info.description,
          unlockLevel: spell.unlockLevel,
          level: lvl,
          cost: spell.manaCost,
        }
        skills.push(skill);
      }

      const result = {} as CharacterStats;
      for (const key in c.baseStats) {
        result[key as keyof CharacterStats] =
          c.baseStats[key as keyof typeof c.baseStats] +
          c.growth[key as keyof typeof c.growth] * (char.level - 1);
      }
      const character: CharacterData = {
        id: char.id,
        name: c.identity.name,
        portrait: c.identity.assets.portrait,
        body: c.identity.assets.body,
        baseStats: c.baseStats,
        stats: result,
        level: char.level,
        xpPercent: char.xp,
        levelUpCost: 10,
        skills: skills,
      }
      characters.push(character);
    }
    const resources: PlayerResources = {
      ruby: user.gameState.rubis,
    };
    return Response.json({characters: characters, resources: resources, maxSkillLevel: 10}, {status: 201});
  }
  catch (e) {
    console.log(e);
    return Response.json({error: "Internal server error"}, {status: 500});
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
            xp: 0,
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

export async function PUT(req: Request)
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
      const { name, skillId } = data;
      const user = await prisma.user.findFirst({
        where: { name: name },
        select: {
          id: true,
          gameState: true,
        }
      });
      if (!user || !user.gameState)
        return Response.json({error: "Internal server error"}, {status: 500});
      const skill = await prisma.spell.update({
        where: { id: skillId, level: { lt: 10 } },
        data: {
          level: {
            increment: 1
          }
        }
      });
      await prisma.gameState.update({
        where: { id: user.gameState.id, rubis: { gt: 10 * (skill.level - 1) } },
        data: {
          rubis: {decrement: 10 * (skill.level - 1)}
        }
      });
      return Response.json({msg: "OK"}, {status: 200});
    }
    catch (e) {
      console.log(e);
      return Response.json({error: "Internal server error"}, {status: 500});
    }
}

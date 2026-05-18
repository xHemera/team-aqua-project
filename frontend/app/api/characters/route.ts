import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CHARACTERS, MAX_CHARACTER_LEVEL, MAX_SKILL_LEVEL, PLAYER_RESOURCES } from "@/app/characters/character-roster";
import { headers } from "next/headers";

type ApiCharacterSkill = {
  id: string;
  name: string;
  image: string;
  description: string;
  unlockLevel?: number;
  level: number;
  cost: number;
};

type ApiCharacterData = {
  id: string;
  name: string;
  portrait: string;
  body: string;
  baseStats: (typeof CHARACTERS)[number]["baseStats"];
  level: number;
  xpPercent: number;
  levelUpCost: number;
  skills: ApiCharacterSkill[];
  stats: (typeof CHARACTERS)[number]["stats"];
};

class UpgradeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const ensureGameState = async (userId: string) => {
  return prisma.gameState.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      rubis: PLAYER_RESOURCES.ruby,
    },
    update: {},
    select: {
      id: true,
      rubis: true,
    },
  });
};

const ensureCharacterRoster = async (gameStateId: string) => {
  const existingCharacters = await prisma.character.findMany({
    where: { gameStateId },
    select: {
      id: true,
      name: true,
    },
  });

  const existingByName = new Map(existingCharacters.map((character) => [character.name, character]));

  for (const templateCharacter of CHARACTERS) {
    if (existingByName.has(templateCharacter.name)) {
      continue;
    }

    await prisma.character.create({
      data: {
        gameStateId,
        name: templateCharacter.name,
        hp: templateCharacter.stats.hp,
        level: templateCharacter.level,
        countering: false,
        silenced: false,
        poisened: false,
        berserk: false,
        aBoost: 0,
        dBoost: 0,
        nturnEffect: 0,
        spells: {
          create: templateCharacter.skills.map((skill) => ({
            name: skill.name,
            type: "ability",
            effect: 0,
            mpCost: skill.cost,
            level: skill.level,
          })),
        },
      },
      select: {
        id: true,
      },
    });
  }

  const charactersWithSpells = await prisma.character.findMany({
    where: { gameStateId },
    include: {
      spells: true,
    },
  });

  for (const character of charactersWithSpells) {
    const templateCharacter = CHARACTERS.find((item) => item.name === character.name);
    if (!templateCharacter) {
      continue;
    }

    const existingSpellNames = new Set(character.spells.map((spell) => spell.name));
    const missingTemplateSkills = templateCharacter.skills.filter((skill) => !existingSpellNames.has(skill.name));

    if (!missingTemplateSkills.length) {
      continue;
    }

    await prisma.spell.createMany({
      data: missingTemplateSkills.map((skill) => ({
        characterId: character.id,
        name: skill.name,
        type: "ability",
        effect: 0,
        mpCost: skill.cost,
        level: skill.level,
      })),
    });
  }
};

const getApiCharacters = async (gameStateId: string): Promise<ApiCharacterData[]> => {
  const dbCharacters = await prisma.character.findMany({
    where: { gameStateId },
    include: {
      spells: true,
    },
  });

  const dbCharactersByName = new Map(dbCharacters.map((character) => [character.name, character]));

  return CHARACTERS.map((templateCharacter) => {
    const dbCharacter = dbCharactersByName.get(templateCharacter.name);

    if (!dbCharacter) {
      return {
        ...templateCharacter,
      };
    }

    const dbSpellsByName = new Map(dbCharacter.spells.map((spell) => [spell.name, spell]));

    return {
      ...templateCharacter,
      id: dbCharacter.id,
      level: dbCharacter.level,
      stats: {
        ...templateCharacter.stats,
        hp: dbCharacter.hp,
      },
      skills: templateCharacter.skills.map((templateSkill) => {
        const dbSpell = dbSpellsByName.get(templateSkill.name);

        return {
          ...templateSkill,
          id: dbSpell?.id ?? templateSkill.id,
          level: dbSpell?.level ?? templateSkill.level,
          cost: dbSpell?.mpCost ?? templateSkill.cost,
        };
      }),
    };
  });
};

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameState = await ensureGameState(session.user.id);
    await ensureCharacterRoster(gameState.id);
    const characters = await getApiCharacters(gameState.id);

    return Response.json(
      {
        characters,
        resources: {
          ruby: gameState.rubis,
        },
        maxCharacterLevel: MAX_CHARACTER_LEVEL,
        maxSkillLevel: MAX_SKILL_LEVEL,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching characters:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { spellId?: string };
    const spellId = body.spellId?.trim();

    if (!spellId) {
      return Response.json({ error: "spellId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const spell = await tx.spell.findUnique({
        where: { id: spellId },
        include: {
          character: {
            include: {
              gameState: {
                select: {
                  id: true,
                  user_id: true,
                  rubis: true,
                },
              },
            },
          },
        },
      });

      if (!spell) {
        throw new UpgradeError("Spell not found", 404);
      }

      if (spell.character.gameState.user_id !== session.user.id) {
        throw new UpgradeError("Forbidden", 403);
      }

      if (spell.level >= MAX_SKILL_LEVEL) {
        throw new UpgradeError("Spell is already max level", 400);
      }

      const gameStateUpdate = await tx.gameState.updateMany({
        where: {
          id: spell.character.gameState.id,
          user_id: session.user.id,
          rubis: { gte: spell.mpCost },
        },
        data: {
          rubis: { decrement: spell.mpCost },
        },
      });

      if (gameStateUpdate.count === 0) {
        throw new UpgradeError("Not enough rubies", 400);
      }

      const spellUpdate = await tx.spell.updateMany({
        where: {
          id: spell.id,
          level: { lt: MAX_SKILL_LEVEL },
        },
        data: {
          level: { increment: 1 },
        },
      });

      if (spellUpdate.count === 0) {
        throw new UpgradeError("Spell is already max level", 400);
      }

      const [updatedSpell, updatedGameState] = await Promise.all([
        tx.spell.findUnique({
          where: { id: spell.id },
          select: { id: true, level: true },
        }),
        tx.gameState.findUnique({
          where: { id: spell.character.gameState.id },
          select: { rubis: true },
        }),
      ]);

      if (!updatedSpell || !updatedGameState) {
        throw new UpgradeError("Upgrade failed", 500);
      }

      return {
        spellId: updatedSpell.id,
        level: updatedSpell.level,
        resources: {
          ruby: updatedGameState.rubis,
        },
      };
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UpgradeError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Error upgrading spell:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

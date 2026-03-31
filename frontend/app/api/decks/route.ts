import { auth } from "@/lib/auth";
import { DEFAULT_DECKS } from "@/lib/default-decks";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type CreateDeckBody = {
  name?: string;
};

type RenameDeckBody = {
  deckId?: string;
  name?: string;
};

type DeleteDeckBody = {
  deckId?: string;
};

const ensureDefaultDecks = async (userId: string) => {
  await prisma.$transaction(async (tx) => {
    for (const defaultDeck of DEFAULT_DECKS) {
      const matches = await tx.decks.findMany({
        where: {
          userId,
          title: defaultDeck.title,
        },
        select: {
          id: true,
          cards: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (matches.length === 0) {
        await tx.decks.create({
          data: {
            title: defaultDeck.title,
            image: defaultDeck.image,
            userId,
            cards: {
              create: defaultDeck.cards.map((card) => ({
                name: card.name,
                prize: card.count,
                type: "deck_card",
              })),
            },
          },
        });
        continue;
      }

      const [primary, ...duplicates] = matches;

      await tx.decks.update({
        where: { id: primary.id },
        data: { image: defaultDeck.image },
      });

      if (primary.cards.length === 0 && defaultDeck.cards.length > 0) {
        await tx.cards.createMany({
          data: defaultDeck.cards.map((card) => ({
            name: card.name,
            prize: card.count,
            type: "deck_card",
            deckId: primary.id,
          })),
        });
      }

      for (const duplicate of duplicates) {
        await tx.cards.deleteMany({ where: { deckId: duplicate.id } });
        await tx.decks.delete({ where: { id: duplicate.id } });
      }
    }
  });
};

const getSessionUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
};

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDefaultDecks(user.id);

    const decks = await prisma.decks.findMany({
      where: { userId: user.id },
      include: {
        cards: {
          where: { deckId: { not: null } },
          select: {
            id: true,
            name: true,
            prize: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({
      decks: decks.map((deck) => ({
        id: deck.id,
        title: deck.title,
        image: deck.image,
        cards: deck.cards.map((card) => ({
          id: card.id,
          name: card.name,
          count: card.prize ?? 1,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching decks:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateDeckBody;
    const name = body.name?.trim();

    if (!name) {
      return Response.json({ error: "Le nom du deck est obligatoire" }, { status: 400 });
    }

    const created = await prisma.decks.create({
      data: {
        title: name,
        image: "/decks/flygon-icon.png",
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        image: true,
        cards: {
          select: {
            id: true,
            name: true,
            prize: true,
          },
        },
      },
    });

    return Response.json({ deck: created }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return Response.json({ error: "Un deck avec ce nom existe déjà" }, { status: 409 });
    }

    console.error("Error creating deck:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RenameDeckBody;
    const deckId = body.deckId;
    const name = body.name?.trim();

    if (!deckId || !name) {
      return Response.json({ error: "deckId et name sont obligatoires" }, { status: 400 });
    }

    const existing = await prisma.decks.findFirst({
      where: { id: deckId, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json({ error: "Deck introuvable" }, { status: 404 });
    }

    const updated = await prisma.decks.update({
      where: { id: deckId },
      data: { title: name },
      select: {
        id: true,
        title: true,
      },
    });

    return Response.json({ deck: updated });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return Response.json({ error: "Un deck avec ce nom existe déjà" }, { status: 409 });
    }

    console.error("Error renaming deck:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as DeleteDeckBody;
    const deckId = body.deckId;

    if (!deckId) {
      return Response.json({ error: "deckId est obligatoire" }, { status: 400 });
    }

    const existing = await prisma.decks.findFirst({
      where: { id: deckId, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json({ error: "Deck introuvable" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.cards.deleteMany({ where: { deckId } }),
      prisma.decks.delete({ where: { id: deckId } }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

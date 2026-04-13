import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type AddCardBody = {
  deckId?: string;
  cardName?: string;
};

type UpdateCardBody = {
  deckId?: string;
  cardId?: string;
  action?: "increment" | "decrement";
};

const getSessionUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
};

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as AddCardBody;
    const deckId = body.deckId;
    const cardName = body.cardName?.trim();

    if (!deckId || !cardName) {
      return Response.json({ error: "deckId et cardName sont obligatoires" }, { status: 400 });
    }

    const deck = await prisma.decks.findFirst({
      where: { id: deckId, userId: user.id },
      select: {
        id: true,
        cards: {
          where: { deckId: { not: null } },
          select: {
            prize: true,
          },
        },
      },
    });

    if (!deck) {
      return Response.json({ error: "Deck introuvable" }, { status: 404 });
    }

    const totalCards = deck.cards.reduce((sum, card) => sum + (card.prize ?? 1), 0);
    if (totalCards >= 60) {
      return Response.json({ error: "Deck is full! Maximum 60 cards." }, { status: 400 });
    }

    const existingCard = await prisma.cards.findFirst({
      where: {
        deckId,
        name: {
          equals: cardName,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        prize: true,
      },
    });

    let card;
    if (existingCard) {
      card = await prisma.cards.update({
        where: { id: existingCard.id },
        data: { prize: (existingCard.prize ?? 1) + 1 },
        select: {
          id: true,
          name: true,
          prize: true,
        },
      });
    } else {
      card = await prisma.cards.create({
        data: {
          deckId,
          name: cardName,
          prize: 1,
          type: "deck_card",
        },
        select: {
          id: true,
          name: true,
          prize: true,
        },
      });
    }

    return Response.json({
      card: {
        id: card.id,
        name: card.name,
        count: card.prize ?? 1,
      },
    });
  } catch (error) {
    console.error("Error adding card:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateCardBody;
    const deckId = body.deckId;
    const cardId = body.cardId;
    const action = body.action;

    if (!deckId || !cardId || !action) {
      return Response.json({ error: "deckId, cardId et action sont obligatoires" }, { status: 400 });
    }

    const deck = await prisma.decks.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
      select: {
        id: true,
        cards: {
          select: {
            id: true,
            prize: true,
          },
        },
      },
    });

    if (!deck) {
      return Response.json({ error: "Deck introuvable" }, { status: 404 });
    }

    const card = deck.cards.find((item) => item.id === cardId);
    if (!card) {
      return Response.json({ error: "Carte introuvable" }, { status: 404 });
    }

    if (action === "increment") {
      const totalCards = deck.cards.reduce((sum, item) => sum + (item.prize ?? 1), 0);
      if (totalCards >= 60) {
        return Response.json({ error: "Deck is full! Maximum 60 cards." }, { status: 400 });
      }

      const updated = await prisma.cards.update({
        where: { id: cardId },
        data: { prize: (card.prize ?? 1) + 1 },
        select: {
          id: true,
          name: true,
          prize: true,
        },
      });

      return Response.json({
        card: {
          id: updated.id,
          name: updated.name,
          count: updated.prize ?? 1,
        },
      });
    }

    if ((card.prize ?? 1) <= 1) {
      await prisma.cards.delete({ where: { id: cardId } });
      return Response.json({ removed: true, cardId });
    }

    const updated = await prisma.cards.update({
      where: { id: cardId },
      data: { prize: (card.prize ?? 1) - 1 },
      select: {
        id: true,
        name: true,
        prize: true,
      },
    });

    return Response.json({
      card: {
        id: updated.id,
        name: updated.name,
        count: updated.prize ?? 1,
      },
    });
  } catch (error) {
    console.error("Error updating card:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

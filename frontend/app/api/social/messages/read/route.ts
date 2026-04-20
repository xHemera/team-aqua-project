import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inbox_id, other_user_id } = await req.json();

    if (!inbox_id || !other_user_id) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Mark all messages from other_user in this inbox as read
    await prisma.messages.updateMany({
      where: {
        inbox_id: inbox_id,
        user_id: other_user_id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const inboxId = url.searchParams.get("inbox_id");
    const currentUserId = session.user.id;

    if (!inboxId) {
      return Response.json({ error: "Missing inbox_id" }, { status: 400 });
    }

    // Get all messages in this inbox that the current user sent (where read = true)
    const readMessages = await prisma.messages.findMany({
      where: {
        inbox_id: inboxId,
        user_id: currentUserId,
        read: true,
      },
      select: {
        id: true,
      },
    });

    const readMessageIds = readMessages.map((m) => m.id);
    return Response.json({ readMessageIds });
  } catch (error) {
    console.error("Error fetching read messages:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


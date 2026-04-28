import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.inbox_users.findMany({
      where: { user_id: session.user.id },
      select: { unread_messages: true },
    });

    const totalUnread = rows.reduce((sum, row) => sum + (row.unread_messages ?? 0), 0);

    return Response.json({ totalUnread }, {status: 200});
  } catch (error) {
    console.error("Error fetching social unread count:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

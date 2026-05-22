import prisma from "@/lib/prisma";
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

  const allowed = await rateLimit(redis, `rl:unreadMap${ip}`, 20, 1);

  if (!allowed) {
      console.log("Too many requests");
      return Response.json({error: "Too many request"}, {status: 429});
  }

  try {
    const {searchParams} = new URL(req.url);
    const currentUser = searchParams.get("user");
    if (!currentUser)
        return Response.json({error: "Internal server error"}, {status: 500});

    const results: Record<string, number> = {};
    const cUser = await prisma.user.findFirst({
        where: { name: currentUser },
        select: {id: true}
    });
    if (!cUser) return Response.json({error: "Internal server error"}, {status: 500});

    const inboxes = await prisma.inbox.findMany({
        where: {
            inboxUser: {
                some: {
                    user_id: cUser.id
                }
            }
        },
        include: {
            inboxUser: {
                include: {
                    user: true
                }
            }
        }
    });
    for (const inbox of inboxes) {
        const currentUserInbox = inbox.inboxUser.find(
            iu => iu.user_id === cUser.id
        );

        const otherUser = inbox.inboxUser.find(
            iu => iu.user_id !== cUser.id
        )?.user;

        if (!otherUser) continue;

        if (currentUserInbox)
            results[otherUser.name] = currentUserInbox.unread_messages ?? 0;
    }
    return Response.json({results: results}, {status: 200});
  }
  catch {
    return Response.json({error: "Internal server error"}, {status: 500});
  }
}
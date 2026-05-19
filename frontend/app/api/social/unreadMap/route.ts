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
    const users = inboxes.flatMap(inbox =>
        inbox.inboxUser
        .map(iu => iu.user)
        .filter((user): user is NonNullable<typeof user> =>
        !!user && user.id !== cUser.id)
    );
    if (!users) return Response.json({error: "Internal server error"}, {status: 500});
    await Promise.all(
        users.map(async (user) => {
            if (!user) return;
            const iU = await prisma.inbox_users.findFirst({
                where: {
                    inbox: {
                        inboxUser: {
                            some: { user_id: cUser.id }
                        },
                        AND: {
                            inboxUser: {
                                some: { user_id: user.id }
                            }
                        }
                    },
                },
                select: {
                    unread_messages: true
                }
            });
            let unread = 0;
            if (!iU || !iU.unread_messages) { unread = 0; }
            else { unread = iU.unread_messages; }
            results[user.name] = unread;
        })
    );
    return Response.json({results: results}, {status: 200});
  }
  catch {
    return Response.json({error: "Internal server error"}, {status: 500});
  }
}
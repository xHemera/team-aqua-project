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

  const allowed = await rateLimit(redis, `rl:${ip}`, 20, 1);

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
    const users = await prisma.user.findMany({
        where: {
            inbox: {
                some: {
                    inboxUser: {
                        some: {
                            user_id: cUser.id
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
        }
    });
    await Promise.all(
        users.map(async (user) => {
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
                    user_id: cUser.id
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
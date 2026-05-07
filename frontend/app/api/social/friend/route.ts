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
        const currentUser = searchParams.get("currentUser");
        const otherUser = searchParams.get("otherUser");
        if (!currentUser || !otherUser)
            return Response.json({error: "Internal server error"}, {status: 500});

        const cUser = await prisma.user.findFirst({
            where: {name: currentUser},
            select: {id: true}
        });
        const oUser = await prisma.user.findFirst({
            where: {name: otherUser},
            select: {id: true}
        });
        if (!cUser || !oUser) return Response.json({error: "Internal server error"}, {status: 500});

        const friend = await prisma.friends.findUnique({
            where: {
                userId_friendId: {
                    userId: cUser.id,
                    friendId: oUser.id
                },
            }
        });
        return Response.json({friend: friend}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}
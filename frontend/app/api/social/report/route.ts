import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function POST(req: Request)
{
    const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 5, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }

    try {
        const data = await req.json();
        const {user, reportedUser} = data;

        const cUser = await prisma.user.findFirst({
            where: { name: user },
            select: {
                id: true,
            }
        });
        const rUser = await prisma.user.findFirst({
            where: { name: reportedUser },
            select: {
                id: true,
            }
        });
        if (!cUser || !rUser) return Response.json({error: "Internal server error"}, {status: 500});
        
        const inbox = await prisma.inbox.findFirst({
            where: {
                inboxUser: {
                    some: {user_id: cUser.id }
                },
                AND: {
                    inboxUser: {
                        some: { user_id: rUser.id }
                    }
                }
            },
            select: {
                id: true,
            }
        });
        if (!inbox) return Response.json({error: "Internal server error"}, {status: 500});

        const alreadyReported = await prisma.reported_Conv.findFirst({
            where: { inboxId: inbox.id }
        })
        if (alreadyReported) return Response.json({error: "Conflict"}, {status: 409});

        await prisma.reported_Conv.create({
            data: {
                inboxId: inbox.id,
                reporter: user,
                reportedUser: reportedUser,
                reason: "placeholder",
            }
        });
        return Response.json({message: "Created"}, {status: 201});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}
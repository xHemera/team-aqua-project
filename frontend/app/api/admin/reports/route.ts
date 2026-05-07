import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

//get reported conversations
export async function GET()
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
        const reports = await prisma.reported_Conv.findMany({
            select: {
                id: true,
                inbox: { select: { 
                    id: true, last_message: true, messages: { 
                        select: { 
                            id: true,
                            message: true,
                            user_id: true,
                            createdAt: true
                            } 
                        } 
                    }
                },
                inboxId: true,
                reportedUser: true,
                reporter: true,
                reason: true,
                createdAt: true,
            }
        });
        return Response.json({reports: reports}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

//delete reports after review
export async function DELETE(req: Request)
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
        const {searchParams} = new URL(req.url);
        const reporter = searchParams.get("reporter");
        const reported = searchParams.get("reported");
        if (!reporter || !reported)
            return Response.json({error: "Internal server error"}, {status: 500});

        await prisma.reported_Conv.deleteMany({
            where: {
                reportedUser: reported,
                reporter: reporter,
            },
        });
        return Response.json({essage: "OK"}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

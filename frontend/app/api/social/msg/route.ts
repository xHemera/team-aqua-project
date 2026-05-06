'use server'
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";
import { headers } from "next/headers"

export async function GET(req: Request)
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
        const user = searchParams.get("user");
        const otherUser = searchParams.get("otherUser");
        if (!user || !otherUser)
            return Response.json({error: "Internal server error"}, {status: 500});

        const user1 = await prisma.user.findFirst({
            where: { name: user },
            select: { id: true }
        })
        const user2 = await prisma.user.findFirst({
            where: { name: otherUser },
            select: { id: true }
        })

        if (!user1 || !user2) return Response.json({error: "Internal server error"}, {status: 500});

        const msgs = await prisma.inbox.findFirst({
            where: {
                inboxUser: {
                    some: {user_id: user1.id}
                },
                AND: {
                    inboxUser: {
                        some: {user_id: user2.id}
                    }
                }
            },
            select: {messages: { include: { attachments: true } } }
        })
        if (!msgs) return Response.json({error: "Internal server error"}, {status: 500});
        return Response.json({msgs: msgs.messages}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

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
        const {sender, receiver, msg, draftIds} = data;

        const user1 = await prisma.user.findFirst({
            where: { name: sender },
            select: {id: true}
        })
        const user2 = await prisma.user.findFirst({
            where: { name: receiver },
            select: {id: true}
        })

        if (!user1 || !user2)
            return Response.json({error: "Internal server error"}, {status: 500});

        const inbox = await prisma.inbox.findFirst({
            where: {
                inboxUser: {
                    some: { user_id: user1.id }
                },
                AND: { 
                    inboxUser: {
                        some: { user_id: user2.id }
                    }
                }
            },
            select: { id: true }
        })

        if (!inbox)
            return Response.json({error: "Internal server error"}, {status: 500});

        const message = await prisma.messages.create({
            data: {
                message: msg,
                user: {
                    connect: { id: user1.id }
                },
                inbox: {
                    connect: { id: inbox.id }
                }
            },
            select: {
                attachments: true,
                id: true
            }
        });

        for (const id of draftIds)
        {
            await prisma.attachment.update({
                where: { id: id },
                data: {
                    msg_id: message.id
                }
            })
        }

        await prisma.inbox_users.updateMany({
            where: {
                inbox_id: inbox.id,
                user_id: user2.id
            },
            data: {
                unread_messages: {increment: 1}
            }
        })

        if (!message)
            return Response.json({error: "Internal server error"}, {status: 500});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }

    return Response.json({message: "Created"}, {status: 201});
}
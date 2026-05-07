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

export async function POST (req: Request)
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
        const data = await req.json();
        const {currentUser, otherUser} = data;

        const cUser = await prisma.user.findFirst({
            where: {name: currentUser},
            select: {id: true}
        });
        const oUser = await prisma.user.findFirst({
            where: {name: otherUser},
            select: {id: true}
        });
        if (!cUser || !oUser) return Response.json({error: "Internal server error"}, {status: 500});

        const existing1 = await prisma.friends.findUnique({
            where: {
                userId_friendId: {
                userId: cUser.id,
                friendId: oUser.id,
                },
            },
        });

        const existing2 = await prisma.friends.findUnique({
            where: {
                userId_friendId: {
                userId: oUser.id,
                friendId: cUser.id,
                },
            },
        });

        if (!existing1) {
            await prisma.friends.create({
                data: {
                userId: cUser.id,
                friendId: oUser.id,
                request_sent: false
                },
            });
        }
        if (!existing2)
        {
            await prisma.friends.create({
                data: {
                    friendId: cUser.id,
                    userId: oUser.id,
                    request_sent: true
                }
            });
        }

        return Response.json({message: "Created"}, {status: 201});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

export async function PATCH(req: Request)
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
        const data = await req.json();
        const {currentUser, otherUser} = data;

        const cUser = await prisma.user.findFirst({
            where: {name: currentUser},
            select: {id: true}
        });
        const oUser = await prisma.user.findFirst({
            where: {name: otherUser},
            select: {id: true}
        });
        if (!cUser || !oUser) return Response.json({error: "Internal server error"}, {status: 500});

        
        await prisma.friends.update({
            where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } },
            data: { request_sent: false}
        });
        await prisma.friends.update({
            where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } },
            data: { request_sent: false}
        });

        return Response.json({message: "OK"}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(req: Request)
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

        await prisma.friends.delete({
            where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } }
            });
        await prisma.friends.delete({
            where: { userId_friendId: { userId: oUser.id, friendId: cUser.id } }
        });

        return Response.json({message: "OK"}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

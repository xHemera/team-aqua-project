import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function PUT()
{
    const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 20, 60);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: session.user.id
        },
        select: { banned: true }
    })
    if (!user) return Response.json({error: "User not found"}, {status: 404});
    if (user.banned === true) return Response.json({error: "Forbidden"}, {status: 403});

    const userUpdate = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            online: true
        }
    });
    if (userUpdate) return Response.json(null, {status: 201});
    return Response.json({error: "Unprocessable entity"}, {status: 422});
}
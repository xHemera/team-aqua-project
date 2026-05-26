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

    const allowed = await rateLimit(redis, `rl:pong${ip}`, 10, 3);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }

    try {
        const data = await req.json();
        const {userPseudo} = data;
        await redis.rPush("pong_queue", userPseudo);
        return Response.json({msg: "OK"}, {status: 200});
    }
    catch (e) {
        console.log(e);
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

    const allowed = await rateLimit(redis, `rl:pong${ip}`, 10, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }
    try {
        const {searchParams} = new URL(req.url);
        const userPseudo = searchParams.get("userPseudo");
        if (!userPseudo)
            return Response.json({error: "Internal server error"}, {status: 500});
        
        // Enlever le joueur de la queue
        await redis.lRem("pong_queue", 1, userPseudo);
        return Response.json({msg: "OK"}, {status: 200});
    }
    catch (e) {
        console.log(e);
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

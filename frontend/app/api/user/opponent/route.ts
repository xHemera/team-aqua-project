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

    const allowed = await rateLimit(redis, `rl:opponent${ip}`, 20, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }
    try {
        const {searchParams} = new URL(req.url);
        const currentUser = searchParams.get("pseudo");
        if (!currentUser)
            return Response.json({error: "Internal server error"}, {status: 500});
        const opponent = await redis.hGet("inGamePlayers", currentUser);
        if (opponent)
        {
            const socket = await redis.hGet("online_users", opponent);
            return Response.json({name: opponent, socketId: socket}, {status: 200});
        }
        return Response.json({error: "Internal server error"}, {status: 500});
    }
    catch (e) {
        console.log(e);
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

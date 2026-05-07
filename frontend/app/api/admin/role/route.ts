import prisma from "@/lib/prisma";
import { authClient } from "@/lib/auth-client";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function POST(req: Request)
{
    const ip = req.headers
  .get("x-forwarded-for")
  ?.split(",")[0]
  .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 3, 10);

    if (!allowed) {
        return new Response("Too many requests", { status: 429 });
    }

    const data = await req.json();
    const { name, email, password } = data;
    const apiKey = req.headers.get('apiKey');
    
    if (apiKey !== process.env.API_KEY)
        return Response.json({error: "Unauthorized"}, {status: 401});
    try
    {
        const user = await prisma.user.findFirst({
            where: { name: name },
            select: { badges: true }
        });
        if (user && user.badges.includes("ADMIN"))
            throw Response.json({error: "Not acceptable"}, {status: 406});
        await authClient.signUp.email({
            name: name,
            email: email,
            password: password,
        });
        await prisma.user.updateMany({
            where: { name: name },
            data: {
                badges: { push: "ADMIN" }
            }
        });
    }
    catch (e) {
        if (e)
            return e;
        return Response.json({error: "Internal server error"}, {status: 500});
    }
    return Response.json({status: 200});
}

export async function PATCH(req: Request)
{
    const ip = req.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 3, 1);

    if (!allowed) {
        return new Response("Too many requests", { status: 429 });
    }

    const body = await req.json();
    const { user, isModo } = body;

    try {
        if (!isModo)
        {
            await prisma.user.update({
                where: { id: user },
                data: {
                    badges: { push: "MODERATOR" }
                }
            });
        }
        else
        {
            await prisma.user.update({
                where: { id: user },
                data: {
                    badges: { set: [] }
                }
            });
        }
        return Response.json({success: true}, {status: 200})
    }
    catch (error)
    {
        if (error)
            return error;
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}
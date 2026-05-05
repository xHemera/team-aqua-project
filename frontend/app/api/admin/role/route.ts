import prisma from "@/lib/prisma";
import { authClient } from "@/lib/auth-client";

export async function POST(req: Request)
{
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
        return Response.json({success: true}, {status: 201})
    }
    catch (error)
    {
        if (error)
            return error;
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}
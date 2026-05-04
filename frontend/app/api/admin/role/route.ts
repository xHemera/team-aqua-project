import prisma from "@/lib/prisma";
import { headers } from "next/headers"

export async function POST(req: Request)
{
    
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
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}
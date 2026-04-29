import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT()
{
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
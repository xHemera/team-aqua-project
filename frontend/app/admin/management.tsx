'use server'
import prisma from "@/lib/prisma";

export async function getUsers()
{
    return await prisma.user.findMany({
        select: {
			id: true,
			name: true,
			badges: true,
            banned: true,
            avatarId: true
		}
    });
}
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

export async function getReports()
{
    const reports = await prisma.reported_Conv.findMany({
        select: {
            id: true,
            inbox: { select: { 
                id: true, last_message: true, messages: { 
                    select: { 
                        id: true,
                        message: true,
                        user_id: true,
                        createdAt: true
                        } 
                    } 
                }
            },
            inboxId: true,
            reportedUser: true,
            reporter: true,
            reason: true,
            createdAt: true,
        }
    });
    if (!reports)
        return ;
    return reports;
}

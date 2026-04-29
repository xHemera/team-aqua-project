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

export async function getUsersByName(reporter: string, reported: string)
{
    const results: Record<string, string> = {};
    const user1 = await prisma.user.findFirst({
        where: { name: reporter },
        select: {
            id: true,
        }
    });
    const user2 = await prisma.user.findFirst({
        where: { name: reported },
        select: {
            id: true,
        }
    });
    if (!user1 || !user2) throw Error("Users not found");
    results[user1.id] = reporter;
    results[user2.id] = reported;
    return results;
}

export async function deleteReport(reporter: string, reported: string)
{
    const report = await prisma.reported_Conv.deleteMany({
        where: {
            reportedUser: reported,
            reporter: reporter,
        },
    });
}

export async function banUser(username: string)
{
    const user = await prisma.user.updateMany({
        where: { name: username,
            NOT: { badges: { has: "ADMIN" } }
         },
        data: { banned: true }
    });
}

export async function unbanUser(username: string)
{
    await prisma.user.updateMany({
        where: { name: username },
        data: { banned: false }
    })
}
'use server'
import prisma from "@/lib/prisma";


export async function getUsers()
{
    return await prisma.user.findMany();
}

export async function getCurrentUser(current: string)
{
    return await prisma.user.findFirst({
        where: { name: current }
    })
}

//creation d'une inbox et de deux inbox_users
export async function addContact(currentUser: string, addUser: string)
{
    if (!currentUser || !addUser) return;
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })

    const inbox = await prisma.inbox.create({
        data: {user: { connect: { id: user1!.id } }}
    })
    const inboxUser1 = await prisma.inbox_users.create({
        data: {
            user_id: user1!.id,
            inbox_id: inbox.id
        }
    })
    const inboxUser2 = await prisma.inbox_users.create({
        data: {
            user_id: user2!.id,
            inbox_id: inbox.id
        }
    })
}
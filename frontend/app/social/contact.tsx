'use server'
import prisma from "@/lib/prisma";


export async function getUsers()
{
    return await prisma.user.findMany({
        include: {
            avatar: true,
        }
    })
}

export async function getCurrentUser(current: string)
{
    const user = await prisma.user.findFirst({
        where: { name: current },
        include: {
            avatar: true,
        }
    })
    if (!user)
        throw new Error("User not found");
    return user;
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
            inbox_id: inbox.id,
            unread_messages: 0
        }
    })
    const inboxUser2 = await prisma.inbox_users.create({
        data: {
            user_id: user2!.id,
            inbox_id: inbox.id,
            unread_messages: 0
        }
    })
}

export async function selectUser(userName: string)
{
	const user = await prisma.user.findFirst({
        where: { name: userName }
    });
    const inbox = await prisma.inbox_users.updateMany({
        where: { user_id: user!.id },
        data: { unread_messages: 0}
    });
	return userName;
};

export async function getAvatar (userName: string)
{
    const user = await prisma.user.findFirst({
        where: { name: userName},
        include: {
            avatar: true
        }
    })
    return user?.avatar?.name;
}

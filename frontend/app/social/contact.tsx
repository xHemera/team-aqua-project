'use server'
import prisma from "@/lib/prisma";


export async function getUsers()
{
    return await prisma.user.findMany({
        include: {
            avatar: true,
			inbox: { include: { inboxUser: true } },
			inboxUser: true,
            messages: true,
        }
    })
}

export async function getInboxes()
{
    return await prisma.inbox.findMany({
        include: {
            inboxUser: true,
            messages: true,
         }
    })
}

export async function getCurrentUser(current: string)
{
    const user = await prisma.user.findFirst({
        where: { name: current },
        include: {
            avatar: true,
			inbox: { include: { inboxUser: true } },
			inboxUser: true,
            messages: true,
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

export async function alreadyAdded(currentUser: string, addUser: string)
{
	if (!currentUser || !addUser) return;
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })
    const inboxes = await prisma.inbox.findMany({
        select: { inboxUser: { select: { user_id: true } } }
    });

	if (inboxes.length === 0) return true;

    for (const inbox of inboxes)
    {
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

		if (ids.includes(user1!.id) && ids.includes(user2!.id))
		{
			return false;
		}
    };
	return true;
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

export async function addMsg(msg: string, sender: string, receiver: string)
{
    if (!sender || !receiver) return;
    const user1 = await prisma.user.findFirst({
        where: { name: sender }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: receiver }
    })
    const inboxes = await prisma.inbox.findMany({
        include: { inboxUser: true, messages:true }
    });

	if (inboxes.length === 0) return;

    for (const inbox of inboxes)
    {
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

		if (ids.includes(user1!.id) && ids.includes(user2!.id))
		{
			const messages = await prisma.messages.update({
                
            })
		}
    };
}

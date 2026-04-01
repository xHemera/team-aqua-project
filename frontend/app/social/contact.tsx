'use server'
import prisma from "@/lib/prisma";


export async function getUsers()
{
    return await prisma.user.findMany({
        include: {
            inbox: {
            include: {
                messages: true,
                inboxUser: true,
            },
            },
            messages: true,
            inboxUser: true,
            avatar: true,
        },
        });
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
            inbox: {
            include: {
                messages: true,
                inboxUser: true,
            },
            },
            messages: true,
            inboxUser: true,
            avatar: true,
        },
    });
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

    if (!user1 || !user2) return;

    const inbox = await prisma.inbox.create({
        data: {user: { connect: { id: user1.id } }}
    })
    await prisma.inbox_users.create({
        data: {
            user_id: user1.id,
            inbox_id: inbox.id,
            unread_messages: 0
        }
    })
    await prisma.inbox_users.create({
        data: {
            user_id: user2.id,
            inbox_id: inbox.id,
            unread_messages: 0
        }
    })
}

export async function alreadyAdded(currentUser: string, addUser: string): Promise<boolean>
{
    if (!currentUser || !addUser) return false;
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })

    if (!user1 || !user2) return false;

    const inboxes = await prisma.inbox.findMany({
        select: { inboxUser: { select: { user_id: true } } }
    });

	if (inboxes.length === 0) return true;

    for (const inbox of inboxes)
    {
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

        if (ids.includes(user1.id) && ids.includes(user2.id))
		{
			return false;
		}
    };
	return true;
}

export async function selectUser(currentUser: string, userName: string)
{
	if (!currentUser || !userName) return userName;

	const current = await prisma.user.findFirst({
        where: { name: currentUser }
    });
    const selected = await prisma.user.findFirst({
        where: { name: userName }
    });

    if (!current || !selected) return userName;

    const inboxes = await prisma.inbox.findMany({
        include: { inboxUser: true }
    });

	for (const inbox of inboxes)
	{
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

		if (ids.includes(current.id) && ids.includes(selected.id))
		{
            await prisma.inbox_users.updateMany({
                where: {
                    inbox_id: inbox.id,
                    user_id: current.id,
                },
                data: { unread_messages: 0 }
            });
            break;
		}
	}

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

    if (!user1 || !user2) return;

	if (inboxes.length === 0) return;

    for (const inbox of inboxes)
    {
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

		if (ids.includes(user1.id) && ids.includes(user2.id))
		{
			const messages = await prisma.messages.create({
                data: {
                    message: msg,
                    user: {
                        connect: { id: user1.id }
                    },
                    inbox: {
                        connect: { id: inbox.id }
                    }
                }
            });
            const up_inbox = await prisma.inbox.update({
                where: { id: inbox.id },
                data: {
                    last_message: msg,
                    last_sent_user_id: user1.id,
                },
                include: {
                    messages: true,
					inboxUser: true
                }
            });
            up_inbox.messages.push(messages);
            for (const iU of up_inbox.inboxUser) {
				if (iU.user_id == user2.id)
				{
                    await prisma.inbox_users.update({
						where: { id: iU.id },
						data: { unread_messages: { increment: 1} }
					})
				}
            }
		}
    }
}

export async function getMsg(sender: string, receiver: string)
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

    if (!user1 || !user2) return;

	if (inboxes.length === 0) return;

    for (const inbox of inboxes)
    {
        const ids = inbox.inboxUser.map(inboxUser => inboxUser.user_id);

		if (ids.includes(user1.id) && ids.includes(user2.id))
		{
			const messages = await prisma.messages.findMany({
                where: { inbox_id: inbox.id }
            });
			return messages;
		}
    }
}

export async function getUnread(currentUser: string)
{
	if (!currentUser) return;

	const cUser = await prisma.user.findFirst({
		where: { name: currentUser },
        include: {
            inbox: {
				include: { inboxUser: true }
			},
        },
    });

	if (!cUser) return;

	return cUser.inbox;
}

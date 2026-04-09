'use server'
import prisma from "@/lib/prisma";

//get all users and their relations
export async function getUsers()
{
    return await prisma.user.findMany({
        include: {
            friends: true,
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

//get all inboxes and its relations
export async function getInboxes()
{
    return await prisma.inbox.findMany({
        include: {
            inboxUser: true,
            messages: true,
         }
    })
}

//get the current user and their relations
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
            friends: true,
            messages: true,
            inboxUser: true,
            avatar: true,
        },
    });
    if (!user)
        throw new Error("User not found");
    return user;
}

//get a user and their relations by name
export async function getUser(name: string)
{
    const user = await prisma.user.findFirst({
        where: { name: name },
        include: {
            inbox: {
            include: {
                messages: true,
                inboxUser: true,
            },
            },
            friends: true,
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
			up_inbox.inboxUser.map(async (iU) => {
                if (iU.user_id == user2.id)
                {
                    const new_iU = await prisma.inbox_users.update({
                        where: { id: iU.id },
                        data: { unread_messages: { increment: 1} }
                    })
                }
			})
		}
    }
}

export async function getMsg(user: string, otherUser: string)
{
	if (!user || !otherUser) return;
    const user1 = await prisma.user.findFirst({
        where: { name: user },
        include: { inboxUser: true }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: otherUser },
        include: { inboxUser: true }
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
            for (const iU of user1.inboxUser)
            {
                if (iU.inbox_id == inbox.id)
                {
                    const new_iU = await prisma.inbox_users.update({
                        where: { id: iU.id },
                        data: { unread_messages: 0 }
                    })
                }
            }
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

export async function getBadge(user: string)
{
    if (!user) return;
    const dbUser = await prisma.user.findFirst({
        where: {name: user}
    });
    if (dbUser) return dbUser.badges;
}

export async function getFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    for (const friend of cUser.friends)
    {
        if (friend.friendId === oUser.id && friend.userId === cUser.id)
            return friend;
    }
    return null;
}

export async function getFriendFromOther(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    for (const friend of oUser.friends)
    {
        if (friend.friendId === cUser.id && friend.userId === oUser.id)
            return friend;
    }
    return null;
}

export async function addFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    const cFriend = await prisma.friends.create({
        data: {
            friendId: oUser.id,
            userId: cUser.id,
            request_sent: false
        }
    })
    const oFriend = await prisma.friends.create({
        data: {
            friendId: cUser.id,
            userId: oUser.id,
            request_sent: true
        }
    });
    cUser.friends.push(cFriend);
    oUser.friends.push(oFriend);
}

export async function acceptFriendRequest(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    for (const friend of cUser.friends)
    {
        if (friend.friendId == oUser.id)
        {
            const newFriend = await prisma.friends.update({
                where: {friendId: oUser.id, userId: cUser.id},
                data: { request_sent: false}
            });
        }
    }
    for (const friend of oUser.friends)
    {
        if (friend.friendId == cUser.id)
        {
            const newFriend = await prisma.friends.update({
                where: {friendId: cUser.id, userId: oUser.id},
                data: { request_sent: false}
            });
        }
    }
}

export async function denyFriendRequest(currentUser: string, otherUser: string)
{
    {
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    for (const friend of cUser.friends)
    {
        if (friend.friendId == oUser.id)
        {
            const refused = await prisma.friends.delete({
                where: {userId: cUser.id, friendId: oUser.id}
            });
        }
    }
    for (const friend of oUser.friends)
    {
        if (friend.friendId == cUser.id)
        {
            const refused = await prisma.friends.delete({
                where: {userId: oUser.id, friendId: cUser.id}
            });
        }
    }
}
}

export async function blockFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    for (const friend of cUser.friends)
    {
        if (friend.friendId == oUser.id)
        {
            const blockUser = await prisma.friends.delete({
                where: {userId: cUser.id, friendId: oUser.id}
            });
        }
    }
    cUser.blockedUsers.push(oUser.id);
}

export async function blockUser(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    cUser.blockedUsers.push(oUser.id);
}

export async function unblockUser(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        include: {friends: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        include: {friends: true}
    });
    if (!cUser || !oUser) return;

    const index = cUser.blockedUsers.indexOf(oUser.id)

    if (index !== -1)
        cUser.blockedUsers.splice(index, 1);
}

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

//creation of a new inbox with a inbox_user for each user
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

//check if a user already has a conversation with someone
export async function alreadyAdded(currentUser: string, addUser: string)
{
	if (!currentUser || !addUser) return;
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })

	if (!user1 || !user2)
		throw new Error("User not found");

	const inbox = await prisma.inbox.findFirst({
		where: {
			inboxUser: {
				some: { user_id: user1.id }
			},
			AND: { 
				inboxUser: {
					some: { user_id: user2.id }
				}
			}
		}
	})
	if (inbox) return false;
	return true;
}

//returns the selected user name and resets the unread messages (BROKEN)
export async function selectUser(userName: string)
{
	const user = await prisma.user.findFirst({
        where: { name: userName }
    });
    if (!user) return userName;
    const inbox = await prisma.inbox_users.updateMany({
        where: { user_id: user.id },
        data: { unread_messages: 0}
    });
	return userName;
};

//return the avatar name
export async function getAvatar (userName: string)
{
    const user = await prisma.user.findFirst({
        where: { name: userName},
        select: {
            avatar: true
        }
    })
    return user?.avatar?.name;
}

//adds a message written by the first user
export async function addMsg(msg: string, sender: string, receiver: string)
{
    if (!sender || !receiver) return;
    const user1 = await prisma.user.findFirst({
        where: { name: sender },
		select: {id: true}
    })
    const user2 = await prisma.user.findFirst({
        where: { name: receiver },
		select: {id: true}
    })

    if (!user1 || !user2) return;

	const inbox = await prisma.inbox.findFirst({
		where: {
			inboxUser: {
				some: { user_id: user1.id }
			},
			AND: { 
				inboxUser: {
					some: { user_id: user2.id }
				}
			}
		}
	})

	if (!inbox)
		throw Error("Not discussion found or created");

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
	if (!messages)
		throw Error("Could not create the message");
}

//return all messages from a conversation
export async function getMsg(user: string, otherUser: string)
{
	if (!user || !otherUser) return;
    const user1 = await prisma.user.findFirst({
        where: { name: user },
    })
    const user2 = await prisma.user.findFirst({
        where: { name: otherUser },
    })

    if (!user1 || !user2) return;

    const msgs = await prisma.inbox.findFirst({
		where: {
			inboxUser: {
				some: {user_id: user1.id}
			},
			AND: {
				inboxUser: {
					some: {user_id: user2.id}
				}
			}
		},
		select: {messages: true}
	})
	if (!msgs) return;
	return msgs.messages;
}

//mais c'est quoi cette fonction de merde
export async function getUnread(currentUser: string)
{
	if (!currentUser) return;

	const cUser = await prisma.user.findFirst({
		where: { name: currentUser },
        select: {
            inbox: {
				select: { inboxUser: true }
			},
        },
    });

	if (!cUser) return;
	
	return cUser.inbox;
}

//return badges array
export async function getBadge(user: string)
{
    if (!user) return;
    const dbUser = await prisma.user.findFirst({
        where: {name: user}
    });
    if (dbUser) return dbUser.badges;
}

//return the other user friend type
export async function getFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    const friend = await prisma.friends.findUnique({
		where: {
			userId_friendId: {
				userId: cUser.id,
				friendId: oUser.id
			},
		}
	});
    if (!friend) return null;
	return friend;
}

//return your friend type from the other user side
export async function getFriendFromOther(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    const friend = await prisma.friends.findUnique({
		where: {
			userId_friendId: {
				userId: oUser.id,
				friendId: cUser.id
			},
		}
	});
    if (!friend) return null;
	return friend;
}

//adds a friend relation for each user
export async function addFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    const existing1 = await prisma.friends.findUnique({
        where: {
            userId_friendId: {
            userId: cUser.id,
            friendId: oUser.id,
            },
        },
    });

    const existing2 = await prisma.friends.findUnique({
        where: {
            userId_friendId: {
            userId: oUser.id,
            friendId: cUser.id,
            },
        },
    });

    if (!existing1) {
        await prisma.friends.create({
            data: {
            userId: cUser.id,
            friendId: oUser.id,
            request_sent: false
            },
        });
    }
    if (!existing2)
    {
        await prisma.friends.create({
            data: {
                friendId: cUser.id,
                userId: oUser.id,
                request_sent: true
            }
        });
    }
}

//change both requests to false, making them friends
export async function acceptFriendRequest(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    
	await prisma.friends.update({
		where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } },
		data: { request_sent: false}
	});
	await prisma.friends.update({
		where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } },
		data: { request_sent: false}
	});
}

//refuse and deletes each other friend relation
export async function denyFriendRequest(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    await prisma.friends.delete({
         where: { userId_friendId: { userId: cUser.id, friendId: oUser.id } }
		});
    await prisma.friends.delete({
         where: { userId_friendId: { userId: oUser.id, friendId: cUser.id } }
    });
}

//adds the other user to the blocked list and remove from each their friend relation
export async function blockFriend(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    await prisma.friends.deleteMany({
        where: {
            OR: [
                { userId: cUser.id, friendId: oUser.id },
                { userId: oUser.id, friendId: cUser.id },
            ]
        }
    })
    await prisma.user.update({
        where: {id: cUser.id},
        data: {
            blockedUsers: {
                push: oUser.id
            }
        }
    })
}

//adds the other user to the blocked list
export async function blockUser(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    await prisma.user.update({
        where: {id: cUser.id},
        data: {
            blockedUsers: {
                push: oUser.id
            }
        }
    })
}

//remove the other user from the blocked list
export async function unblockUser(currentUser: string, otherUser: string)
{
    if (!currentUser || !otherUser) return;

    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true, blockedUsers: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) return;

    await prisma.user.update({
        where: {id: cUser.id},
        data: {
            blockedUsers: {
                set: cUser.blockedUsers.filter(id => id !== oUser.id),
            }
        }
    })
}

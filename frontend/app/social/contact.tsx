'use server'
import prisma from "@/lib/prisma";

//get all users and their relations
export async function getUsers()
{
    return await prisma.user.findMany({
        select: {
			id: true,
			name: true,
			badges: true,
			blockedUsers: true,
			avatar: true
		}
    });
}

//get the current user and their relations
export async function getCurrentUser(current: string)
{
    const user = await prisma.user.findFirst({
        where: { name: current },
        select: {
			id: true,
			name: true,
			badges: true,
			blockedUsers: true,
			avatar: true
		}
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
        select: {
			id: true,
			name: true,
			badges: true,
			blockedUsers: true,
			avatar: true
		}
    });
    if (!user)
        throw new Error("User not found");
    return user;
}

//fetch the user inboxes
export async function getInboxes(username: string)
{
    const user = await prisma.user.findFirst({
        where: { name: username },
        select: { id: true }
    })

    if (!user)
        throw Error("User not found")

    const inboxes = await prisma.inbox.findMany({
        where: {
            inboxUser: {
                some: {user_id: user.id}
            }
        },
        select: {
            id: true,
            inboxUser: true,
        }
    })
    
    return inboxes;
}

//creation of a new inbox with a inbox_user for each user
export async function addContact(currentUser: string, addUser: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })

	if (!user1 || !user2) throw new Error("Users not found");

    await prisma.inbox.create({
        data: {
            user: { connect:
                { id: user1.id }
            },
            inboxUser: {
                create: [
                    {user_id: user1.id, unread_messages: 0},
                    {user_id: user2.id, unread_messages: 0},
                ]
            }
        }
    })
}

//check if a user already has a conversation with someone
export async function alreadyAdded(currentUser: string, addUser: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: currentUser }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: addUser }
    })

	if (!user1 || !user2)
		return true

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
    if (!user || !user.avatar) throw new Error("User not found");
    return user.avatar.name;
}

//adds a message written by the first user
export async function addMsg(msg: string, sender: string, receiver: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: sender },
		select: {id: true}
    })
    const user2 = await prisma.user.findFirst({
        where: { name: receiver },
		select: {id: true}
    })

    if (!user1 || !user2) throw new Error("User not found");

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
		},
        select: { id: true }
	})

	if (!inbox)
		throw Error("No discussion found or created prior");

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

    await prisma.inbox_users.updateMany({
        where: {
            inbox_id: inbox.id,
            user_id: user2.id
		},
        data: {
            unread_messages: {increment: 1}
        }
    })

	if (!messages)
		throw Error("Could not create the message");
}

export async function resetUnread(sender: string, receiver: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: sender },
		select: {id: true}
    })
    const user2 = await prisma.user.findFirst({
        where: { name: receiver },
		select: {id: true}
    })

    if (!user1 || !user2) throw new Error("User not found");

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
		},
        select: { id: true }
	})

	if (!inbox)
		throw Error("No discussion found or created prior");

    await prisma.inbox_users.updateMany({
        where: {
            inbox_id: inbox.id,
            user_id: user1.id
		},
        data: {
            unread_messages: 0
        }
    })
}

//return all messages from a conversation
export async function getMsg(user: string, otherUser: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: user },
    })
    const user2 = await prisma.user.findFirst({
        where: { name: otherUser },
    })

    if (!user1 || !user2) throw new Error("Users not found");

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
	if (!msgs) throw new Error("Could not fetch messages");
	return msgs.messages;
}

//fetch the unread number
export async function getUnread(currentUser: string)
{
    const results: Record<string, number> = {};
    const cUser = await prisma.user.findFirst({
        where: { name: currentUser },
        select: {id: true}
    });
    if (!cUser) throw Error("User not found");
    const users = await prisma.user.findMany({
        where: {
            inbox: {
                some: {
                    inboxUser: {
                        some: {
                            user_id: cUser.id
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            name: true
        }
    });
    if (!users) return results;
    await Promise.all(
        users.map(async (user) => {
            const iU = await prisma.inbox_users.findFirst({
                where: {
                    inbox: {
                        inboxUser: {
                            some: { user_id: cUser.id }
                        },
                        AND: {
                            inboxUser: {
                                some: { user_id: user.id }
                            }
                        }
                    },
                    user_id: cUser.id
                },
                select: {
                    unread_messages: true
                }
            });
            let unread = 0;
            if (!iU || !iU.unread_messages) { unread = 0; }
            else { unread = iU.unread_messages; }
            results[user.name] = unread;
        })
    );
    return results;
}



//return the other user friend type
export async function getFriend(currentUser: string, otherUser: string)
{
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");;

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");

    
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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("User not found");

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("User not found");

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
    const cUser = await prisma.user.findFirst({
        where: {name: currentUser},
        select: {id: true, blockedUsers: true}
    });
    const oUser = await prisma.user.findFirst({
        where: {name: otherUser},
        select: {id: true}
    });
    if (!cUser || !oUser) throw new Error("Users not found");

    await prisma.user.update({
        where: {id: cUser.id},
        data: {
            blockedUsers: {
                set: cUser.blockedUsers.filter(id => id !== oUser.id),
            }
        }
    })
}

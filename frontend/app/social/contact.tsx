'use server'
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";
import { headers } from "next/headers"

//get all users and their relations
export async function getUsers()
{
    return await prisma.user.findMany({
        select: {
			id: true,
			name: true,
			badges: true,
			blockedUsers: true,
			avatar: true,
			image: true,
            online: true,
		}
    });
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

//return all messages from a conversation
export async function getMsg(user: string, otherUser: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: user },
        select: { id: true }
    })
    const user2 = await prisma.user.findFirst({
        where: { name: otherUser },
        select: { id: true }
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
		select: {messages: { include: { attachments: true } } }
	})
	if (!msgs) throw new Error("Could not fetch messages");
	return msgs.messages;
}

export async function resetUnread(sender: string, receiver: string)
{
    const user1 = await prisma.user.findFirst({
        where: { name: sender },
		select: {id: true}
    });
    const user2 = await prisma.user.findFirst({
        where: { name: receiver },
		select: {id: true}
    });

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
	});

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
    });
}

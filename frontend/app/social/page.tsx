"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON, PROFILE_ICONS } from "@/lib/profile-icons";
import { contact }  from "./index"
import NotificationToast from "@/components/organisms/home/NotificationToast";
import ProfileViewerModal from "@/components/organisms/social/ProfileViewer";
import Validate from "@/components/organisms/Validate";
import {type} from "./index"



const formatTime = (date: Date) =>
  date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const toSizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

//creation d'un fichier a partager
const buildAttachmentFromFile = (file: File): type.Attachment => ({
  id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
  name: file.name,
  sizeLabel: toSizeLabel(file.size),
  type: file.type,
  previewUrl: URL.createObjectURL(file),
});

export default function SocialPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<type.Attachment[]>([]);
  const [inviteNotification, setInviteNotification] = useState<type.InviteNotification | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<type.Messages[]>([]);
  const [users, setUsers] = useState<type.User[]>([]);
  const [inboxes, setInboxes] = useState<type.Inbox[]>([]);
  const [currentUser, setCurrentUser] = useState<type.User | null>(null);
	const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [showProfileViewer, setShowProfileViewer] = useState(false);
  const [profileViewerUser, setProfileViewerUser] = useState<type.User | null>(null);
  const [request, setRequest] = useState(false);
  const [friendRequestSender, setFriendRequestSender] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [friend, setFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const [messageImages, setMessageImages] = useState<Record<string, Array<{ id: string; name: string; data: string }>>>({});
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [challenge, setChallenge] = useState(false);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [typer, setTyper] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);

  const MAX_MESSAGE_LENGTH = 500;
  const MAX_DISPLAY_LENGTH = 200;

  let timeout: NodeJS.Timeout;
  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;

  const toggleMessageExpanded = (messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };
  
  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name)
        setUserPseudo(data.user.name);
    };
    getUserData();
  }, []);

  //fetch users and their inboxes
  useEffect(() => {
    async function fetchUsers() {
    if (!userPseudo) return;
      const [u, cU, i] = await Promise.all([
      contact.getUsers(),
      contact.getCurrentUser(userPseudo),
      contact.getInboxes(userPseudo),
    ]);
    setCurrentUser(cU);
    setUsers(u);
    setInboxes(i);
    }
    fetchUsers();
  }, [userPseudo]);

  //reconnect socket in case of a page refresh
  useEffect(() => {
		if (!userPseudo || socket.connected) return;

		socket.connect();
		socket.emit("login", userPseudo);

		socket.on("online_users", (users) => {
			console.log("Users from Redis:", users);
		});

		return () => {
			socket.off("online_users");
		};
	}, [userPseudo]);

  //render messages sent by other users
  useEffect(() => {
    if (!userPseudo) return;
    const handler = async ({ sender,
      receiver,
      msg,
      images,
      messageId }: {
      sender: string,
      receiver: string,
      msg: string,
      images: string,
      messageId: string }) => {

      if (selectedUser && selectedUser === sender)
      {
        const newMessages = await contact.getMsg(userPseudo, selectedUser);
        if (!newMessages) return;
        setCurrentMessages(newMessages);
        contact.resetUnread(userPseudo, selectedUser);
        socket.emit("has_read", {
          user: userPseudo,
          oUser: selectedUser,
        });
        
        //Store images for this message ID
        // if (images && images.length > 0 && messageId) {
        //   setMessageImages((prev) => ({
        //     ...prev,
        //     [messageId]: images,
        //   }));
        // }
      }
      else //set variables to send a notification
      {
        setNotifSender(sender);
        setNotification(msg);
        setShowNotification(true);
        fetchUnread();
      }
    }
    socket.on("received", handler);
    return () => {
      socket.off("received", handler);
    }
  });

  useEffect(() => {
    if (!userPseudo) return;
    socket.on("add_conv", async () => {
      const i = await contact.getInboxes(userPseudo);
      setInboxes(i);
    });
  }, [userPseudo]);

  //render messages sent by other users
  useEffect(() => {
    if (!userPseudo || !selectedUser) return;
    //show if the selected user is writing
    socket.on("isTyping", async ({sender, receiver}) => {
      if (sender == selectedUser)
      {
        setTyper(sender);
        setTyping(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setTyping(false);
        }, 2000);
      }
    });

    //show if the selected user is writing
    socket.on("isNotTyping", async ({sender, receiver}) => {
      if (sender == selectedUser)
        setTyping(false);
    });

    //adds the request dynamically
    socket.on("request", async ({user, oUser}) => {
      if (user == selectedUser) {
        setRequest(true);
        setFriendRequestSender(user);
      }
    });

    //adds match button dynamically
    socket.on("adding", async ({user, oUser}) => {
      if (user == selectedUser)
      {
        setWaiting(false);
        setRequest(false)
        setFriend(true);
      }
    });

    //resets status dynamically
    socket.on("refusing", async ({user, oUser}) => {
      if (user == selectedUser)
      {
        setWaiting(false);
        setFriend(false);
      }
    });

    //sets blocked status dynamically
    socket.on("blocked", async ({user, oUser}) => {
      if (user == selectedUser)
        setIsBlocked(true);
        setFriend(false);
    });

    socket.on("blocking", async () => {
      setHasBlocked(true);
      setFriend(false);
    })

    //resets status dynamically
    socket.on("unblocking", async ({user, oUser}) => {
      if (oUser == selectedUser)
        setIsBlocked(false);
      if (user == userPseudo)
        setHasBlocked(false);
    });

    //prompt the challenge request
    socket.on("challenge", async({sender, receiver}) => {
      if (receiver == userPseudo)
      {
        setChallenge(true);
        setOpponent(sender);
      }
      if (sender == userPseudo)
        setWaiting(true);
    })

    //send to the game if duel is accepted
    socket.on("accept", async ({user, oUser}) => {
      if (oUser == userPseudo)
      {
        setWaiting(false);
        router.push("game");
      }
    })

    //stops the waiting status if duel is refused
    socket.on("refuse", async ({user, oUser}) => {
      if (oUser == userPseudo)
        setWaiting(false);
    })

    //sets unread to read if message is read
    socket.on("read", async ({user, oUser}) => {
      if (oUser == userPseudo)
        setUnread(false);
    })

    //reloads inboxes and exits the conversation
    socket.on("deletion", async (sender) => {
      const i = await contact.getInboxes(userPseudo);
      setInboxes(i);
      setSelectedUser("");
    })

  }, [userPseudo, selectedUser]);

	//fetch the conversation
	useEffect(() => {
		async function fetchmessages()
		{
			if (!currentUser || !selectedUser) return;
			const newMessages = await contact.getMsg(currentUser.name, selectedUser);
			if (!newMessages) return;
    	setCurrentMessages(newMessages);
      contact.resetUnread(currentUser.name, selectedUser)
      fetchUnread();
		}
		fetchmessages();
    socket.emit("has_read", {
      user: userPseudo,
      oUser: selectedUser,
    });
		messageListRef.current?.scrollTo({
			top: messageListRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [selectedUser]);

  //scroll the conversation to last message
  useEffect(() => {
  messageListRef.current?.scrollTo({
			top: messageListRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [selectedUser, currentMessages.length])

  //sets waiting status
  useEffect(() => {
    async function isWaiting()
    {
      if (!currentUser || !selectedUser) return;
      const friend = await contact.getFriendFromOther(currentUser.name, selectedUser);
      if (!friend) {
        setWaiting(false);
        setRequest(false);
        setFriendRequestSender(null);
        return;
      }
      if (friend.request_sent == true) setWaiting(true);
      else setWaiting(false);
      return;
    }
    isWaiting();
  }, [currentUser, selectedUser])

  //sets friend status
  useEffect(() => {
    async function isFriend()
    {
      if (!currentUser || !selectedUser) return;
      const myFriend = await contact.getFriend(currentUser.name, selectedUser);
      const theirFriend = await contact.getFriendFromOther(currentUser.name, selectedUser);
      if (!myFriend || !theirFriend) {
        setFriend(false);
        return;
      }
      if (myFriend.request_sent == false && theirFriend.request_sent == false) setFriend(true);
      return;
    }
    isFriend();
  }, [currentUser, selectedUser])

  //sets request status
  useEffect(() => {
    async function isRequesting()
    {
      if (!currentUser || !selectedUser) return;
      const friend = await contact.getFriend(currentUser.name, selectedUser);
      if (!friend) {
        setRequest(false);
        setFriendRequestSender(null);
        return;
      }
      if (friend.request_sent == true) 
      {
        setRequest(true);
      } else {
        setRequest(false);
        setFriendRequestSender(null);
      }
      return;
    }
    isRequesting();
  }, [currentUser, selectedUser])

  //sets blocked status
  useEffect(() => {
    async function isBlockedByMe()
    {
      if (!currentUser || !selectedUser) return;
      const blockedUser = await contact.getUser(selectedUser);
      if (!blockedUser) return;
      for (const id of currentUser.blockedUsers)
      {
        if (id == blockedUser.id)
          setHasBlocked(true);
      }
      return;
    }
    isBlockedByMe();
  }, [currentUser, selectedUser])

  //sets blocked status from user
  useEffect(() => {
    async function amIBlocked()
    {
      if (!currentUser || !selectedUser) return;
      const blockingUser = await contact.getUser(selectedUser);
      if (!blockingUser) return;
      for (const id of blockingUser.blockedUsers)
      {
        if (id == currentUser.id)
          setIsBlocked(true);
      }
      return;
    }
    amIBlocked();
  }, [currentUser, selectedUser])

	useEffect(() => {
		return () => {
			draftAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
		};
	}, [draftAttachments]);

	//notifications timer
	useEffect(() => {
		if (!inviteNotification) return;

		const timeoutId = setTimeout(() => {
			setInviteNotification(null);
		}, 3000);

		return () => clearTimeout(timeoutId);
	}, [inviteNotification]);

  //fetch the number of unreaded messages
  useEffect(() => {
    fetchUnread();
  }, [userPseudo])

  //sets read/unread status
  useEffect(() => {
    if (!currentUser || !selectedUser) return;
    async function fetchSelectedUnread()
    {
      if (!currentUser || !selectedUser) return;
      const unr = await contact.getUnread(currentUser.name, selectedUser);
      setUnread(unr > 0);
    }
    fetchSelectedUnread();
  }, [selectedUser])

  async function fetchUnread()
  {
    if (!userPseudo) return;
    const results = await contact.getUnreadNotif(userPseudo);
    setUnreadMap(results);
  }

	//Loading screen while currentUser is not set
	if (!currentUser)
		return <div>Loading...</div>;

  //open a add contact modal
  const openAddContactModal = () => {
    if (isInviting) return;
    setInviteUsername("");
    setIsAddContactModalOpen(true);
  };

  //close the add contact modal
  const closeAddContactModal = () => {
    if (isInviting) return;
    setIsAddContactModalOpen(false);
    setInviteUsername("");
  };

  //create a new contact
  const submitContactInvite = async () => {
    const username = inviteUsername.trim();
    if (isInviting || !username) return;
    try {
      setIsInviting(true);

      //makes an appropriate response and configure variables
      const response = await fetch("/api/social/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const payload = (await response.json()) as {
        error: string;
        user: { name: string; avatarUrl: string | null };
      };
      //return if we invite ourselves
      if (payload.error === "vous ne pouvez pas vous inviter")
      {
        setInviteNotification({
          type: "error",
          message: payload.error,
        });
        return ;
      }
      //check if the inbox already exist
      if (await contact.alreadyAdded(currentUser.name, inviteUsername) === false)
      {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "une discussion a deja ete cree.",
        });
        return;
      }
      //makes a new inbox for both users and updates it
      contact.addContact(currentUser.name, inviteUsername);
      const i = await contact.getInboxes(currentUser.name);
      setInboxes(i);
      socket.emit("new_conv", {
        sender: currentUser.name,
        receiver: inviteUsername,
      });
      
      //return if user does not exist
      if (!response.ok || !payload.user) {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "ce joueur n'existe pas.",
        });
        return;
      }
      const foundName = payload.user.name;
      setSelectedUser(foundName);
      setInviteNotification({
        type: "success",
        message: "invitation sent",
      });
      setIsAddContactModalOpen(false);
      setInviteUsername("");
    } catch {
      setInviteNotification({
        type: "error",
        message: "ce joueur n'existe pas",
      });
    } finally {
      setIsInviting(false);
    }
  };

  //accept someone as a friend to be able to duel
  async function addFriend()
  {
    if (!currentUser || !friendRequestSender) return;
    contact.acceptFriendRequest(currentUser.name, friendRequestSender);
    socket.emit("friend_added", {
      user: currentUser.name,
      oUser: friendRequestSender
    });
    setFriendRequestSender(null);
  }

  //refuse a friend request
  async function refuseFriendship()
  {
    if (!currentUser || !friendRequestSender) return;
    contact.denyFriendRequest(currentUser.name, friendRequestSender);
    socket.emit("friend_denied", {
      user: currentUser.name,
      oUser: friendRequestSender
    });
    setRequest(false);
    setFriendRequestSender(null);
  }

  const handlePickAttachments = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextAttachments = files.map(buildAttachmentFromFile);
    setDraftAttachments((prevAttachments) => [...prevAttachments, ...nextAttachments]);

    event.target.value = "";
  };

  const removeDraftAttachment = (attachmentId: string) => {
    setDraftAttachments((prevAttachments) => {
      const target = prevAttachments.find((item) => item.id === attachmentId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prevAttachments.filter((item) => item.id !== attachmentId);
    });
  };

  //sends a message to selected user
  const sendMessage = async () => {
    const cleanMessage = message.trim();
    if (!cleanMessage && draftAttachments.length === 0) return;
    if (isBlocked || hasBlocked) return;

    contact.addMsg(cleanMessage, currentUser.name, selectedUser);

    //fetch messages between users
		const newMessages = await contact.getMsg(currentUser.name, selectedUser);
    contact.getUnreadNotif(currentUser.name);
		if (!newMessages) return;

    // Prepare images from attachments
    const images = await Promise.all(
      draftAttachments
        .filter(att => att.type.startsWith("image/"))
        .map((attachment) => 
          new Promise<{ id: string; name: string; data: string }>((resolve) => {
            fetch(attachment.previewUrl)
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onload = () => {
                  resolve({
                    id: attachment.id,
                    name: attachment.name,
                    data: reader.result as string,
                  });
                };
                reader.readAsDataURL(blob);
              })
              .catch(() => resolve({ id: attachment.id, name: attachment.name, data: "" }));
          })
        )
    );

    // Get the last message ID
    const lastMessageId = newMessages.length > 0 ? newMessages[newMessages.length - 1].id : null;

    // Store images locally for the sent message
    if (images.length > 0 && lastMessageId) {
      setMessageImages((prev) => ({
        ...prev,
        [lastMessageId]: images,
      }));
    }

    setCurrentMessages(newMessages);

    socket.emit("notTyping", {
      sender : currentUser.name,
      receiver: selectedUser,
    });
    contact.resetUnread(currentUser.name, selectedUser);
    setUnread(true);

    //sends a signal to the other user's socket
    socket.emit("msg_sent", {
      sender: currentUser.name,
      receiver: selectedUser,
      msg: cleanMessage,
      images: images.length > 0 ? images : undefined,
      messageId: lastMessageId,
    });

    setMessage("");
    setDraftAttachments([]);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isBlocked && !hasBlocked && event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const openProfileViewerForUserName = async (name: string) => {
    const targetUser = await contact.getUser(name) ?? null;
    setProfileViewerUser(targetUser);
    setShowProfileViewer(true);
  };

  const acceptDuel = async () => {
    socket.emit("duel_accepted", {
      user: currentUser.name,
      oUser: selectedUser,
    })
    return router.push("game");
  }

  const refuseDuel = async () => {
    setChallenge(false);
    socket.emit("duel_refused", {
      user: currentUser.name,
      oUser: selectedUser,
    })
  }

  const isTyping = async () => {
    if (!selectedUser || !currentUser)
      return ;
    if (message.length === 0)
    {
      socket.emit("notTyping", {
        sender : currentUser.name,
        receiver: selectedUser,
      });
    }
    socket.emit("typing", {
      sender : currentUser.name,
      receiver: selectedUser,
    });
  }

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1 flex-col">
      {showNotification && notification && notifSender && (notifSender !== selectedUser) && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification} sender={notifSender} />)}
      {inviteNotification && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2">
          <div
            className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-lg ${
              inviteNotification.type === "success"
                ? "border-emerald-400/50 bg-emerald-500/90 text-white"
                : "border-red-400/50 bg-red-500/90 text-white"
            }`}
          >
            {inviteNotification.message}
          </div>
        </div>
      )}

      {isAddContactModalOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#3c3650] bg-[#1b1826] p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">enter a username</h3>
            <p className="mt-1 text-sm text-gray-300">Enter the username of the player to send an invitation.</p>

            <input
              type="text"
              value={inviteUsername}
              onChange={(event) => setInviteUsername(event.target.value)}
              placeholder="Player username"
              className="mt-4 w-full rounded-xl border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[var(--accent-color)]"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={closeAddContactModal}
                disabled={isInviting}
                className="rounded-xl border border-[#3c3650] bg-[#242033] px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-[#302a45] disabled:cursor-not-allowed disabled:opacity-50"
              >
                cancel
              </button>
              <button
                onClick={submitContactInvite}
                disabled={isInviting || inviteUsername.trim().length === 0}
                className="rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isInviting ? "Recherche..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full justify-center px-4">
        <section className="flex h-[calc(100vh-2rem)] w-[calc(100%-14rem)] flex-col overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          {/* Header avec contacts et boutons */}
          <header className="flex items-center border-b border-[#3c3650] px-5 py-3">
            {/* Contacts scroll horizontalement */}
            <div className="flex-1 overflow-x-auto px-4">
              <div className="flex gap-2">
                {
                  users.map((user) => {
                  const isActive = selectedUser === user.name;
                  if (user.name === currentUser.name) return null;
                  const hasConversation = inboxes.some(inbox => {
                    const ids = inbox.inboxUser.map(iu => iu.user_id);
                    return ids.includes(user.id);
                  });
                  if (!hasConversation) return null;
                  return(
                    <button
                      key={user.name}
                      onClick={() => {
                          setSelectedUser(user.name);
                          setShowNotification(false);
                        }
                      }
                      className={`relative flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                        isActive
                          ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                          : "border-[#3c3650] bg-[#242033] text-gray-200 hover:bg-[#302a45]"
                      }`}
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-visible">
                        <Image
                          src={user.avatar?.url ?? DEFAULT_PROFILE_ICON.url}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-lg border border-[#3c3650] object-cover"
                          unoptimized
                        />
                      </div>
                      {user.online ? <div>ONLINE</div> : <div>OFFLINE</div>}
                      <span className="shrink-0 whitespace-nowrap text-sm font-semibold">{user.name}</span>
                      {
                        (unreadMap[user.name] ?? 0) > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                          {unreadMap[user.name] ?? 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutons à droite */}
            <div className="flex items-center gap-2">
              <button
                onClick={openAddContactModal}
                disabled={isInviting}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
                aria-label="Ajouter un contact"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </header>
          <section className="flex h-full min-h-0 flex-col">

            {/*Friend request*/}
            {selectedUser && request && friendRequestSender && (
              <div className="border-b border-[#3c3650] bg-[#1b1826] p-4">
                <div className="rounded-lg border border-[var(--accent-color)] bg-[#242033] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-300">
                        <span className="text-[var(--accent-color)]">{friendRequestSender}</span> wants to be your friend
                      </p>
                      <p className="mt-1 text-xs text-gray-400">Do you want to accept this request?</p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={addFriend}
                        className="rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={refuseFriendship}
                        className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                      >
                        Refuse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/*Duel request*/}
            {challenge && (
              <div className="border-b border-[#3c3650] bg-[#1b1826] p-4">
                <div className="rounded-lg border border-[var(--accent-color)] bg-[#242033] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-300">
                        <span className="text-[var(--accent-color)]">{friendRequestSender}</span> wants to du-du-du-du-du-du-duel !
                      </p>
                      <p className="mt-1 text-xs text-gray-400">Do you want to accept this request?</p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => acceptDuel()}
                        className="rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => refuseDuel()}
                        className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                      >
                        Refuse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageListRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {!selectedUser ? (
                <div className="flex h-full min-h-[16rem] items-center justify-center text-base font-semibold text-gray-400">
                  No conversation selected
                </div> ) :
              (
                currentMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === currentUser.id ? "items-end" : "items-start"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (msg.user_id !== currentUser.id && selectedUser) {
                        openProfileViewerForUserName(selectedUser);
                      }
                    }}
                    className="mb-1 flex items-center gap-2 text-xs text-gray-400"
                  >
                    <Image
                      src={
                        msg.user_id === currentUser.id
                          ? currentUser.avatar?.url ?? DEFAULT_PROFILE_ICON.url
                          : users.find(u => u.name === selectedUser)?.avatar?.url ?? DEFAULT_PROFILE_ICON.url
                      }
                      alt="Avatar"
                      width={20}
                      height={20}
                      className="h-4 w-4 rounded border border-[#3c3650]"
                      unoptimized
                    />
                    <span className="font-semibold">
                      {msg.user_id === currentUser.id ? currentUser.name : selectedUser}
                    </span>
                    <span className="opacity-75">{formatTime(msg.createdAt)}</span>
                  </button>
                  <article
                    className={`max-w-[44rem] rounded-2xl px-5 py-3 ${
                      msg.user_id === currentUser.id
                        ? "bg-[var(--accent-color)] text-white"
                        : "border border-[#3c3650] bg-[#242033] text-gray-100"
                    }`}
                  >
                    {msg.message && (
                      <div>
                        <p className="leading-relaxed break-words whitespace-pre-wrap">
                          {expandedMessages.has(msg.id) ? msg.message : msg.message.slice(0, MAX_DISPLAY_LENGTH)}
                        </p>
                        {msg.message.length > MAX_DISPLAY_LENGTH && (
                          <button
                            onClick={() => toggleMessageExpanded(msg.id)}
                            className={`mt-2 text-xs font-semibold transition-colors ${
                              msg.user_id === currentUser.id
                                ? "text-white/80 hover:text-white"
                                : "text-gray-300 hover:text-gray-100"
                            }`}
                          >
                            {expandedMessages.has(msg.id) ? "voir moins" : "voir plus"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* {msg.attachments.length > 0 && (
                      <div className={`mt-2 grid gap-2 ${msg.attachments.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                        {msg.attachments.map((attachment) => {
                          const isImage = attachment.type.startsWith("image/");

                          return (
                            <div
                              key={attachment.id}
                              className={`rounded-lg border p-2 ${
                                msg.user_id === currentUser.id
                                  ? "border-white/30 bg-white/10"
                                  : "border-[#3c3650] bg-[#15131d]"
                              }`}
                            >
                              {isImage ? (
                                <Image
                                  src={attachment.previewUrl}
                                  alt={attachment.name}
                                  width={320}
                                  height={220}
                                  className="h-28 w-full rounded-md object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="mb-2 flex h-28 items-center justify-center rounded-md bg-black/20 text-3xl">
                                  <i className="fa-regular fa-file-lines" />
                                </div>
                              )}
                              <p className="mt-2 truncate text-xs font-semibold">{attachment.name}</p>
                              <p className="text-[11px] opacity-75">{attachment.sizeLabel}</p>
                            </div>
                          );
                        })}
                      </div>
                    )} */}
                  </article>
                </div>
                ))
              )}
            </div>
            <footer className="sticky bottom-0 border-t border-[#3c3650] bg-[#15131d] p-4">
              {selectedUser && (<div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#3c3650] bg-[#242033] px-2 py-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFilesChange}
                    accept="image/*,.pdf,.txt,.doc,.docx"
                  />

                <button
                    onClick={handlePickAttachments}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#302a45] text-white transition-colors hover:bg-[#3b3457]"
                    aria-label="Ajouter des pièces jointes"
                  >
                    <i className="fa-solid fa-paperclip" />
                  </button>

                  <input
                    type="text"
                    placeholder={hasBlocked ? "You have blocked this user" : isBlocked ? "You are blocked by this user" : `Send a message to @${selectedUser}`}
                    value={message}
                    onChange={(event) => {
                      const newValue = event.target.value.slice(0, MAX_MESSAGE_LENGTH);
                      setMessage(newValue)
                      isTyping();
                    }}
                    onKeyDown={handleInputKeyDown}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className={`flex-1 bg-transparent px-1 text-sm outline-none ${
                        isBlocked || hasBlocked
                          ? "text-gray-500 placeholder:text-gray-600 cursor-not-allowed"
                          : "text-gray-200 placeholder:text-gray-500"
                      }`}
                  />
                  <span className="text-xs text-gray-500">{message.length}/{MAX_MESSAGE_LENGTH}</span>
                  <button
                    onClick={() => {
                      if (!isBlocked && !hasBlocked) {
                        sendMessage();
                      }
                    }}
                    disabled={!hasDraft || isBlocked || hasBlocked}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-color)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <i className="fa-solid fa-paper-plane" />
                  </button>
                  {unread ? <div>unread</div> : <div>read</div>}
                </div>
                {draftAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draftAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[#3c3650] bg-[#242033] px-3 py-1 text-xs text-gray-200"
                      >
                        <i className="fa-regular fa-paperclip" />
                        <span className="max-w-[14rem] truncate">{attachment.name}</span>
                        <span className="opacity-75">({attachment.sizeLabel})</span>
                        <button
                          onClick={() => removeDraftAttachment(attachment.id)}
                          className="text-gray-300 transition-colors hover:text-white"
                          aria-label={`Delete ${attachment.name}`}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser && typer && selectedUser === typer && typing && <div>{typer} is typing</div>}
              </div>)}
            </footer>
          </section>
        </section>
      </div>

      <ProfileViewerModal
        open={showProfileViewer}
        onClose={() => setShowProfileViewer(false)}
        user={profileViewerUser}
        currentUser={currentUser}
      />
    </AppPageShell>
  );
}

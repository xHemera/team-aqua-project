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

type Friends = {
  friendId:     string;
  userId:       string;
  request_sent: boolean;
  created_at:   Date;
}

type Messages = {
  id:         string;
  user_id:    string;
  inbox_id:   string;
  message:    string | null;
  createdAt:  Date;
}

type Inbox_users = {
	id:								string;
	inbox_id:					string;
	user_id:					string;
	unread_messages:	number | null;
};

type Inbox = {
  id: 								string;
  last_message: 			string | null;
  last_sent_user_id:  string | null;
  createdAt:  				Date;
  inboxUser:  				Inbox_users[];
	messages:					  Messages[];
};

type Avatar = {
  url:					string;
  id:						string;
  name:					string;
  type:					string;
  accent: 			string;
  accentHover:	string;
	users?:				any;
};

type User = {
  id:            			string;
  name:          			string;
  email:         			string;
  emailVerified:			Boolean;
  badges:             string[];
  blockedUsers:       string[];
  image:        			string | null;
  profileBackground:	string | null;
  profileBanner: 			string | null;
  createdAt:    			Date;
  updatedAt:    			Date;
  avatarId:      			string | null;
  avatar:        			Avatar | null;
  friends:       	    Friends[];
  inboxUser:     			Inbox_users[];
  messages:      	    Messages[];
  inbox:         			Inbox[];
};

type Attachment = {
  id: 				string;
  name: 			string;
  sizeLabel:	string;
  type: 			string;
  previewUrl: string;
};

type InviteNotification = {
  type: "success" | "error";
  message: string;
};

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
const buildAttachmentFromFile = (file: File): Attachment => ({
  id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
  name: file.name,
  sizeLabel: toSizeLabel(file.size),
  type: file.type,
  previewUrl: URL.createObjectURL(file),
});

export default function SocialPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [inviteNotification, setInviteNotification] = useState<InviteNotification | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Messages[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
	const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [showProfileViewer, setShowProfileViewer] = useState(false);
  const [profileViewerUser, setProfileViewerUser] = useState<User | null>(null);
  const [request, setRequest] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [friend, setFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const MAX_MESSAGE_LENGTH = 500;
  const MAX_DISPLAY_LENGTH = 200;

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
  const conversationUsers = useMemo(() => {
    if (!currentUser) return [];

    return users.filter((user) => {
      if (user.name === userPseudo) return false;

      return inboxes.some((inbox) => {
        const ids = inbox.inboxUser.map((iu) => iu.user_id);
        return ids.includes(user.id) && ids.includes(currentUser.id);
      });
    });
  }, [users, inboxes, currentUser, userPseudo]);

  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
        setUserPseudo(data.user.name);
    };
    getUserData();
  });

  //fetch users and their inboxes
  useEffect(() => {
    async function fetchUsers() {
    if (!userPseudo) return;
      const u = await contact.getUsers();
      const cU = await contact.getCurrentUser(userPseudo);
      const i = await contact.getInboxes();
      setUsers(u);
      setCurrentUser(cU);
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
    socket.on("received", async ({sender, receiver, msg}) => {
      if (selectedUser === sender)
      {
        const newMessages = await contact.getMsg(userPseudo, sender);
        if (!newMessages) return;
        setCurrentMessages(newMessages);
      }
      else //set variables to send a notification
      {
        setNotifSender(sender);
        setNotification(msg);
        await fetchUnread();
      }
    });

    //refresh the inboxes to display new conversations
    socket.on("add_conv", async () => {
      const i = await contact.getInboxes();
      setInboxes(i);
    });

    //adds the request live
    socket.on("request", async ({user, oUser}) => {
      if (user == selectedUser)
        setRequest(true);
    });

    //adds match button live
    socket.on("adding", async ({user, oUser}) => {
      if (user == selectedUser)
      {
        setWaiting(false);
        setRequest(false)
        setFriend(true);
      }
    });

    //resets status live
    socket.on("refusing", async ({user, oUser}) => {
      if (user == selectedUser)
      {
        setWaiting(false);
        setFriend(false);
      }
    });

    //sets blocked live
    socket.on("blocking", async ({user, oUser}) => {
      if (user == selectedUser)
        setIsBlocked(true);
        setFriend(false);
    });

    //resets status live
    socket.on("unblocking", async ({user, oUser}) => {
      if (user == selectedUser)
        setIsBlocked(false);
    });
  }, [userPseudo, selectedUser]);

	//fetch the conversation
	useEffect(() => {
		async function fetchmessages()
		{
			if (!currentUser) return;
			const newMessages = await contact.getMsg(currentUser.name, selectedUser);
			if (!newMessages) return;
    	setCurrentMessages(newMessages);
		}
		fetchmessages();
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
      if (!currentUser) return;
      const friend = await contact.getFriendFromOther(currentUser.name, selectedUser);
      if (!friend) return;
      if (friend.request_sent == true) setWaiting(true);
      return;
    }
    isWaiting();
  }, [currentUser, selectedUser])

  //sets friend status
  useEffect(() => {
    async function isFriend()
    {
      if (!currentUser) return;
      const myFriend = await contact.getFriend(currentUser.name, selectedUser);
      const theirFriend = await contact.getFriendFromOther(currentUser.name, selectedUser);
      if (!myFriend || !theirFriend) return;
      if (myFriend.request_sent == false && theirFriend.request_sent == false) setFriend(true);
      return;
    }
    isFriend();
  }, [currentUser, selectedUser])

  //sets request status
  useEffect(() => {
    async function isRequesting()
    {
      if (!currentUser) return;
      const friend = await contact.getFriend(currentUser.name, selectedUser);
      if (!friend) return;
      if (friend.request_sent == true) 
      {
        console.log("here");
        setRequest(true);
      }
      return;
    }
    isRequesting();
  }, [currentUser, selectedUser])

  //sets blocked status
  useEffect(() => {
    async function isBlockedByMe()
    {
      if (!currentUser) return;
      if (!friend) return;
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
      if (!currentUser) return;
      if (!friend) return;
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

	//Loading screen while currentUser is not set
	if (!currentUser)
		return <div>Loading...</div>;

  //fetch the number of unreaded messages (BROKEN)
  async function fetchUnread()
  {
    if (!userPseudo) return;
    const cU = await contact.getCurrentUser(userPseudo);
    const inbox = await contact.getUnread(cU.name);
    if (!inbox) return;
    const results: Record<string, number> = {};
    for (const iU of inbox) {
      let otherUserId: string | null = null;
      let unread = 0;

      for (const user of iU.inboxUser) {
        if (user.user_id !== cU.id) {
          otherUserId = user.user_id;
        } else {
          unread = user.unread_messages ?? 0;
        }
      }

      if (otherUserId) {
        results[otherUserId] = unread;
      }
    }
    setUnreadMap(results);
  }

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
        error?: string;
        user?: { name: string; avatarUrl?: string | null };
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
      const i = await contact.getInboxes();
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

  async function sendFriendRequest()
  {
    if (!currentUser || !selectedUser) return;
    contact.addFriend(currentUser.name, selectedUser);
    socket.emit("friend_request", {
      user: currentUser.name,
      oUser: selectedUser
    });
    setWaiting(true);
  }

  async function addFriend()
  {
    if (!currentUser || !selectedUser) return;
    contact.acceptFriendRequest(currentUser.name, selectedUser);
    socket.emit("friend_added", {
      user: currentUser.name,
      oUser: selectedUser
    });
    setFriend(true);
    setRequest(false);
  }

  async function refuseFriendship()
  {
    if (!currentUser || !selectedUser) return;
    contact.denyFriendRequest(currentUser.name, selectedUser);
    socket.emit("friend_denied", {
      user: currentUser.name,
      oUser: selectedUser
    });
    setRequest(false);
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

    contact.addMsg(cleanMessage, currentUser.name, selectedUser);

    //fetch messages between users
		const newMessages = await contact.getMsg(currentUser.name, selectedUser);
		if (!newMessages) return;
    setCurrentMessages(newMessages);
    //sends a signal to the other user's socket
    socket.emit("msg_sent", {
      sender: currentUser.name,
      receiver: selectedUser,
      msg: cleanMessage
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
                  if (conversationUsers.length === 0 || user.name == currentUser.name) return null;
                return (
                  <button
                    key={user.name}
                    onClick={async () => {
                      const next = await contact.selectUser(user.name);
                      if (next)
                        setSelectedUser(next)
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
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold">{user.name}</span>
                    {
                      unreadMap[user.id] > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {unreadMap[user.id]}
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

            <div ref={messageListRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {!selectedUser ? (
                <div className="flex h-full min-h-[16rem] items-center justify-center text-base font-semibold text-gray-400">
                  No conversation selected
                </div>
              ) : conversationUsers.length === 0 ? (
                <div className="flex h-full min-h-[16rem] items-center justify-center text-base font-semibold text-gray-400">
                  No conversations
                </div>
              ) : (
                currentMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === currentUser.id ? "items-end" : "items-start"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (msg.user_id !== currentUser.id) {
                        openProfileViewerForUserName(selectedUser);
                      }
                    }}
                    className="mb-1 flex items-center gap-2 text-xs text-gray-400"
                  >
                    <Image
                      src={
                        msg.user_id === currentUser.id
                          ? currentUser?.avatar?.url ?? DEFAULT_PROFILE_ICON.url
                          : users.find(u => u.name === selectedUser)?.avatar?.url ?? DEFAULT_PROFILE_ICON.url
                      }
                      alt="Avatar"
                      width={20}
                      height={20}
                      className="h-4 w-4 rounded border border-[#3c3650]"
                      unoptimized
                    />
                    <span className="font-semibold">
                      {msg.user_id === currentUser.id ? currentUser?.name : selectedUser}
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
                    placeholder={isBlocked ? "You are blocked by this user" : `Send a message to @${selectedUser}`}
                    value={message}
                    onChange={(event) => {
                      const newValue = event.target.value.slice(0, MAX_MESSAGE_LENGTH);
                      setMessage(newValue);
                    }}
                    onKeyDown={handleInputKeyDown}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className={`flex-1 bg-transparent px-1 text-sm outline-none ${
                        isBlocked
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

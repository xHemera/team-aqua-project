"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import { contact }  from "./index"
import NotificationToast from "@/components/organisms/home/NotificationToast";
import ProfileViewerModal from "@/components/organisms/social/ProfileViewer";
import {type} from "./index"



const formatTime = (date: Date | string) =>
  new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const toSizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [challenge, setChallenge] = useState(false);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [typer, setTyper] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [customUserAvatar, setCustomUserAvatar] = useState<string | null>(null);

  const MAX_MESSAGE_LENGTH = 500;
  const MAX_DISPLAY_LENGTH = 200;

  let timeout: NodeJS.Timeout;
  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;

  // Helper functions for localStorage persistence
  const getConversationKey = (user1: string, user2: string) => {
    const sorted = [user1, user2].sort();
    return `message_read_status_${sorted[0]}_${sorted[1]}`;
  };

  const getStoredReadStatus = (user1: string, user2: string): Record<string, boolean> => {
    if (typeof window === 'undefined') return {};
    try {
      const key = getConversationKey(user1, user2);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveReadStatusToStorage = (status: Record<string, boolean>) => {
    if (!currentUser || !selectedUser || typeof window === 'undefined') return;
    try {
      const key = getConversationKey(currentUser.name, selectedUser);
      localStorage.setItem(key, JSON.stringify(status));
    } catch {
      // Silent fail
    }
  };

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
      else
        router.push("/not-connected");
    };
    getUserData();
  }, []);

  //load custom avatar from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('profileCustomAvatar');
      if (stored) {
        setCustomUserAvatar(stored);
      }
    } catch {
      // Silent fail
    }
    socket.on("online", async () => {
      const u = await contact.getUsers();
      setUsers(u);
    })

    socket.on("offline", async () => {
      const u = await contact.getUsers();
      setUsers(u);
    })
  }, []);

  useEffect(() => {
    if (!userPseudo) return;
    socket.on("ban", (banned) => {
      if (banned === userPseudo)
        handleLogout();
    });
  }, [userPseudo])

  const handleLogout = async () => {
    const response = await fetch("/api/profile", {
        method: "PUT",
      })
      const user: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
        typeof user === "object" && user !== null && "error" in user
          ? String((user as { error: string }).error ?? "Impossible de charger l'utilisateur")
          : "Impossible de charger l'utilisateur";
        throw new Error(errorMessage);
      }
    socket.emit("isdisconnecting");
    socket.disconnect();
    await authClient.signOut();
    router.push("/");
  };

  //fetch users and their inboxes
  useEffect(() => {
    async function fetchUsers() {
      if (!userPseudo) return;
        const [ures, ires] = await Promise.all([
        fetch("/api/social/users", {
          method: "GET",
        }),
        fetch(`/api/social/inbox?username=${userPseudo}`, {
          method: "GET",
        }),
      ]);
      if (!ures.ok || !ires.ok)
          return ;
      const udata = await ures.json();
      const idata = await ires.json();
      const users: type.User[] = udata.users;
      const inboxes: type.Inbox[] = idata.inboxes;
      const cU = users.find(user => user.name === userPseudo);
      if (!cU) return ;
      setCurrentUser(cU);
      setUsers(users);
      setInboxes(inboxes);
    }
    fetchUsers();

    //connect the socket
    if (socket.connected) return;
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
      } : {
      sender: string,
      receiver: string,
      msg: string,
      }) => {

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
  }, [selectedUser, userPseudo, notification, notifSender]);

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
        setRequest(false)
      }
    });

    //sets blocked status dynamically
    socket.on("blocked", async ({user, oUser}) => {
      if (user == selectedUser)
        setIsBlocked(true);
    });

    socket.on("blocking", async () => {
      setHasBlocked(true);
    });

    //resets status dynamically
    socket.on("unblocking", async ({user, oUser}) => {
      if (oUser == selectedUser)
        setIsBlocked(false);
      if (user == userPseudo)
        setHasBlocked(false);
    });;

    //prompt the challenge request
    socket.on("challenge", async({sender, receiver}) => {
      if (receiver == userPseudo)
      {
        setChallenge(true);
        setOpponent(sender);
      }
    });

    //send to the game if duel is accepted
    socket.on("accept", async ({user, oUser}) => {
      if (oUser == userPseudo)
      {
        router.push("game");
      }
    });

    //sets unread to read if message is read
    socket.on("read", async ({user, oUser}) => {
      if (oUser == userPseudo) {
        setUnread(false);
      }
    });
    //reloads inboxes and exits the conversation
    socket.on("deletion", async (sender) => {
      const i = await contact.getInboxes(userPseudo);
      setInboxes(i);
      setSelectedUser("");
    });

  }, [userPseudo, selectedUser]);

  //scroll the conversation to last message
  useEffect(() => {
    if (messageListRef.current)
    {
      messageListRef.current.scrollTo({
		    top: messageListRef.current.scrollHeight,
		    behavior: "smooth",
		  });
    }
	}, [currentMessages.length])

  //sets waiting status
  useEffect(() => {
    async function fetchmessages()
		{
			if (!currentUser || !selectedUser) return;
      const params = new URLSearchParams({
        user: currentUser.name,
        otherUser: selectedUser,
      });
      const mres = await fetch(`/api/social/msg?${params.toString()}`, {
        method: "GET",
      })
      if (!mres.ok)
        return;
      const data = await mres.json();
      const newMessages: type.Messages[] = data.msgs;
			if (!newMessages) return;
    	setCurrentMessages(newMessages);
      const ures = await fetch(`api/social/unread`, {
        method: "PUT",
        body: JSON.stringify({sender: currentUser.name, receiver: selectedUser})
      });
      if (!ures.ok)
        return;
      fetchUnread();
      
      // Load read status from localStorage
      const storedStatus = getStoredReadStatus(currentUser.name, selectedUser);
      const newStatus: Record<string, boolean> = {};
      newMessages.forEach((msg) => {
        if (msg.user_id === currentUser.id) {
          // Use stored status if available, otherwise default to false (unread)
          newStatus[msg.id] = storedStatus[msg.id] ?? false;
        }
      });
      saveReadStatusToStorage(newStatus);
		}
		fetchmessages();
      socket.emit("has_read", {
        user: userPseudo,
        oUser: selectedUser,
      });
    async function isWaiting()
    {
      if (!currentUser || !selectedUser) return;
      const params = new URLSearchParams({
        currentUser: currentUser.name,
        otherUser: selectedUser,
      });
      const res = await fetch(`/api/social/otherFriend?${params.toString()}`, {
        method: "GET",
      });
      if (!res.ok)
        return ;
      const data = await res.json();
      const friend: type.Friend = data.friend;
      if (!friend) {
        setRequest(false);
        setFriendRequestSender(null);
      }
    }
    isWaiting();

    async function isRequesting()
    {
      if (!currentUser || !selectedUser) return;
      const params = new URLSearchParams({
        currentUser: currentUser.name,
        otherUser: selectedUser,
      });
      const res = await fetch(`/api/social/otherFriend?${params.toString()}`, {
        method: "GET",
      });
      if (!res.ok)
        return ;
      const data = await res.json();
      const friend: type.Friend = data.friend;
      if (!friend) {
        setRequest(false);
        setFriendRequestSender(null);
        return;
      }
      if (friend.request_sent == true) 
      {
        setRequest(true);
        setFriendRequestSender(selectedUser);
      } else {
        setRequest(false);
        setFriendRequestSender(null);
      }
      return;
    }
    isRequesting();

    async function isBlockedByMe()
    {
      if (!currentUser || !selectedUser) return;
      const res = await fetch(`api/social/user?username=${selectedUser}`, {
        method: "GET",
      });
      if (!res.ok)
        return;
      const data = await res.json();
      const blockedUser: type.User = data.user;
      if (!blockedUser) return;
      for (const id of currentUser.blockedUsers)
      {
        if (id == blockedUser.id)
          setHasBlocked(true);
      }
      return;
    }
    isBlockedByMe();

    async function amIBlocked()
    {
      if (!currentUser || !selectedUser) return;
      const res = await fetch(`api/social/user?username=${selectedUser}`, {
        method: "GET",
      });
      if (!res.ok)
        return;
      const data = await res.json();
      const blockingUser: type.User = data.user;
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
        const ures = await fetch(`api/social/unread`, {
        method: "PUT",
        body: JSON.stringify({sender: currentUser.name, receiver: selectedUser})
      });
      if (!ures.ok)
        return;
      const data = await ures.json();
      const unr: number = data.unread;
      setUnread(unr > 0);
    }
    fetchSelectedUnread();
  }, [selectedUser])

  async function fetchUnread()
  {
    if (!userPseudo) return;
    const mres = await fetch(`/api/social/unreadMap?user=${userPseudo}`, {
      method: "GET",
    })
    if (!mres.ok)
      return;
    const udata = await mres.json();
    const results: Record<string, number> = udata.results;
    setUnreadMap(results);
  }

	//Loading screen while currentUser is not set
	if (!currentUser)
		return <div>loading</div>;

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
      const params = new URLSearchParams({
        currentUser: currentUser.name,
        addUser: inviteUsername,
      });

      const ares = await fetch(`/api/social/contact?${params.toString()}`, {
        method: "GET",
      })
      if (!ares.ok)
      {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "une discussion a deja ete cree.",
        });
        return;
      }

      //makes a new inbox for both users and updates it
      const cres = await fetch("/api/social/contact", {
        method: "POST",
        body: JSON.stringify({currentUser: currentUser.name, addUser: inviteUsername}),
      })
      if (!cres.ok)
        return;
      const ires = await fetch(`/api/social/inbox?username=${currentUser.name}`, {
        method: "GET",
      });
      if (!ires.ok)
        return ;
      const idata = await ires.json();
      setInboxes(idata.inboxes);
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
    const res = await fetch("api/social/friend", {
      method: "PATCH",
      body: JSON.stringify({currentUser: currentUser.name, otherUser: selectedUser}),
    })
    if (!res.ok)
      return;
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
    const params = new URLSearchParams({
      currentUser: currentUser.name,
      otherUser: selectedUser,
    });
    const res = await fetch(`api/social/friend?${params.toString()}`, {
      method: "DELETE",
    })
    if (!res.ok)
      return;
    socket.emit("friend_denied", {
      user: currentUser.name,
      oUser: friendRequestSender
    });
    setRequest(false);
    setFriendRequestSender(null);
  }

  const handlePickAttachments = () => {
    if (fileInputRef.current)
      fileInputRef.current.click();
  };

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw Error("Images could not be uploaded")
    const data = await response.json();
    const fileName = data.name;

    for (const file of files)
    {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("url", fileName);

      const res = await fetch("/api/social/attachment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok)
        continue;
      const data = await res.json();
      const id: string = data.id;
      const buildAttachmentFromFile = (file: File): type.Attachment => ({
        id: id,
        name: `${Date.now()}-${file.name}`,
        sizeLabel: toSizeLabel(file.size),
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      });
      const nextAttachments = files.map(buildAttachmentFromFile);
      setDraftAttachments((prevAttachments) => [...prevAttachments, ...nextAttachments]);
    }

    event.target.value = "";
  };

  const removeDraftAttachment = async (attachmentId: string) => {

    const res = await fetch(`/api/social/attachment?attachmentId=${attachmentId}`, {
        method: "DELETE",
      })
      if (!res.ok)
        return ;
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
    const draftIds = draftAttachments.map(draft => draft.id);

    const response = await fetch("/api/social/msg", {
        method: "POST",
        body: JSON.stringify({sender: currentUser.name,
          msg: cleanMessage, receiver: selectedUser,
          draftIds: draftIds}),
      });
    const data = await response.json();
    if (!response.ok)
      return ;

    //fetch messages between users
    const params = new URLSearchParams({
      user: currentUser.name,
      otherUser: selectedUser,
    });
    const res = await fetch(`/api/social/msg?${params.toString()}`, {
      method: "GET",
    })
    if (!res.ok)
      return;
    const msg = await res.json();
    const newMessages: type.Messages[] = msg.msgs;

    const mres = await fetch(`/api/social/unreadMap?${params.toString()}`, {
      method: "GET",
    })
    if (!mres.ok)
      return;
    const udata = await mres.json();
    const results: Record<string, number> = udata.results;
    setUnreadMap(results);
		if (!newMessages) return;
    
    setCurrentMessages(newMessages);

    socket.emit("notTyping", {
      sender : currentUser.name,
      receiver: selectedUser,
    });

    //reset unread messages
    const ures = await fetch(`api/social/unread`, {
      method: "PUT",
      body: JSON.stringify({sender: currentUser.name, receiver: selectedUser})
    });
    if (!ures.ok)
      return;
    setUnread(true);

    //sends a signal to the other user's socket
    socket.emit("msg_sent", {
      sender: currentUser.name,
      receiver: selectedUser,
      msg: cleanMessage,
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
    const res = await fetch(`api/social/user?username=${selectedUser}`, {
      method: "GET",
    });
    if (!res.ok)
      return;
    const data = await res.json();
    const targetUser: type.User = data.user;
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
    let typingTimeout;

    if (!selectedUser || !currentUser)
      return ;
    socket.emit("typing", {
      sender : currentUser.name,
      receiver: selectedUser,
    });
    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("notTyping", {
        sender: currentUser.name,
        receiver: selectedUser,
      });
    }, 1000);
  }

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1 flex-col" mainClassName="bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]">
      <style>{`
        .checkered-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          background-repeat: repeat;
        }
        input:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
        div:has(input:focus) {
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
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
          <div className="w-full max-w-md rounded-2xl border border-[#c9a227]/25 bg-[#1b1826] p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">enter a username</h3>
            <p className="mt-1 text-sm text-gray-300">Enter the username of the player to send an invitation.</p>

            <input
              type="text"
              value={inviteUsername}
              onChange={(event) => setInviteUsername(event.target.value)}
              placeholder="Player username"
              className="mt-4 w-full rounded-xl border border-[#c9a227]/30 bg-[#242033] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[var(--accent-color)]"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={closeAddContactModal}
                disabled={isInviting}
                className="rounded-xl border border-[#c9a227]/30 bg-[#242033] px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-[#302a45] disabled:cursor-not-allowed disabled:opacity-50"
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
        <section className="checkered-bg flex h-[calc(100vh-2rem)] w-[calc(100%-14rem)] flex-col overflow-hidden rounded-3xl border border-[#c9a227]/25 bg-black/15 shadow-2xl">
          {/* Header avec contacts et boutons */}
          <header className="flex items-center border-b border-[#c9a227]/30 px-5 py-3">
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
                          if (user.name == notifSender)
                            setShowNotification(false);
                        }
                      }
                      className={`relative flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                        isActive
                          ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                          : "border-[#c9a227]/30 bg-[#242033] text-gray-200 hover:bg-[#302a45]"
                      }`}
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-visible">
                        <Image
                          src={user.name === userPseudo && customUserAvatar ? customUserAvatar : (user.image || (user.avatar?.url ?? DEFAULT_PROFILE_ICON.url))}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-lg border border-[#c9a227]/30 object-cover"
                          unoptimized
                        />
                      </div>
                      {user.online ? <div>🟢</div> : <div>🔴</div>}
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
              <div className="border-b border-[#c9a227]/30 bg-[#1b1826] p-4">
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
              <div className="border-b border-[#c9a227]/30 bg-[#1b1826] p-4">
                <div className="rounded-lg border border-[var(--accent-color)] bg-[#242033] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-300">
                        <span className="text-[var(--accent-color)]">{opponent}</span> wants to du-du-du-du-du-du-duel !
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
                currentMessages.map((msg, index) => {
                  const lastUserMessageIndex = currentMessages.findLastIndex((m) => m.user_id === currentUser.id);
                  const isLastUserMessage = msg.user_id === currentUser.id && index === lastUserMessageIndex;
                  return (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === currentUser.id ? "items-end" : "items-start"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (msg.user_id === currentUser.id) {
                        router.push(`/profile/${currentUser.name}`);
                      } else if (selectedUser) {
                        openProfileViewerForUserName(selectedUser);
                      }
                    }}
                    className="mb-1 flex items-center gap-2 text-xs text-gray-400"
                  >
                    <Image
                      src={
                        msg.user_id === currentUser.id
                          ? customUserAvatar || (currentUser.avatar?.url ?? DEFAULT_PROFILE_ICON.url)
                          : (users.find(u => u.name === selectedUser)?.image || (users.find(u => u.name === selectedUser)?.avatar?.url ?? DEFAULT_PROFILE_ICON.url))
                      }
                      alt="Avatar"
                      width={20}
                      height={20}
                      className="h-4 w-4 rounded transition-transform hover:scale-125"
                      unoptimized
                    />
                    <span className="font-semibold">
                      {msg.user_id === currentUser.id ? currentUser.name : selectedUser}
                    </span>
                    <span className="opacity-75">{formatTime(msg.createdAt)}</span>
                  </button>
                  <div className={`flex items-end ${msg.user_id === currentUser.id ? "flex-row-reverse gap-2" : "gap-2"}`}>
                    <article
                      className={`max-w-[44rem] rounded-2xl px-4 py-2 ${
                        msg.user_id === currentUser.id
                          ? "bg-[var(--accent-color)] text-white"
                          : "border border-[#c9a227]/30 bg-[#242033] text-gray-100"
                      }`}
                    >
                    {msg.message && (
                      <div>
                        <p className="text-l leading-relaxed break-words whitespace-pre-wrap">
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


                    {msg.attachments.length > 0 && (
                      <div className={`mt-2 grid gap-2 ${msg.attachments.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                        {msg.attachments.map((attachment) => {
                          return (
                            <div
                              key={attachment.id}
                              className={`rounded-lg border p-2 ${
                                msg.user_id === currentUser.id
                                  ? "border-white/30 bg-white/10"
                                  : "border-[#c9a227]/30 bg-[#15131d]"
                              }`}
                            >
                              {(
                                <Image
                                  src={`${attachment.previewUrl}`}
                                  alt={attachment.name}
                                  width={320}
                                  height={220}
                                  className="h-28 w-full rounded-md object-cover"
                                  unoptimized
                                />
                              )}
                              <p className="mt-2 truncate text-xs font-semibold">{attachment.name}</p>
                              <p className="text-[11px] opacity-75">{attachment.sizeLabel}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    </article>
                    {isLastUserMessage && (
                      <div>
                        {unread ? (
                          <span className="text-gray-500 text-sm"><i className="fa-solid fa-check"></i></span>
                        ) : (
                          <span className="text-emerald-400 text-sm"><i className="fa-solid fa-check-double"></i></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                );})
              )}
            </div>
            {selectedUser && typer && selectedUser === typer && typing && (
              <div className="px-5 py-3">
                <style>{`
                  @keyframes typing-animation {
                    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
                    30% { opacity: 1; transform: translateY(-8px); }
                  }
                  .typing-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: currentColor;
                    margin: 0 2px;
                    animation: typing-animation 1.4s infinite;
                  }
                  .typing-dot:nth-child(1) { animation-delay: 0s; }
                  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                `}</style>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <span>{typer} is typing</span>
                  <span className="text-[var(--accent-color)]">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </span>
                </div>
              </div>
            )}
            <footer className="sticky bottom-0 border-t border-[#c9a227]/30 bg-[#15131d] p-4">
              {selectedUser && (<div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#242033] px-2 py-2 focus-within:border-[#c9a227]/30 focus-within:ring-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFilesChange}
                    accept="image/*,.pdf,.txt,.doc,.docx,.png"
                  />
                {/*Bouton pour attachments*/}
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
                    className={`flex-1 bg-transparent px-1 text-xl outline-none focus:ring-0 focus:outline-none ${
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
                </div>
                {draftAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draftAttachments.map((attachment, index) => (
                      <div
                        key={`${attachment.id}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#242033] px-3 py-1 text-xs text-gray-200"
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
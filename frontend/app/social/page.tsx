"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import { socket } from "../../socket";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import { useAvatarPreference } from "@/hooks/useAvatarPreference";
import { contact } from "./index";

type DbMessage = {
  id: string;
  user_id: string;
  inbox_id: string;
  message: string | null;
  createdAt: Date | string;
};

type DbInboxUser = {
  id: string;
  inbox_id: string;
  user_id: string;
  unread_messages: number | null;
};

type DbInbox = {
  id: string;
  inboxUser: DbInboxUser[];
};

type DbAvatar = {
  url: string;
};

type DbUser = {
  id: string;
  name: string;
  image: string | null;
  avatar: DbAvatar | null;
  badges?: string[];
};

type Attachment = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  previewUrl: string;
};

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  isFriend: boolean;
  unreadCount: number;
  accentColor?: string;
  badges?: string[];
};

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  isMine: boolean;
  sentAt: number;
  liked?: boolean;
  likedBy?: {
    name: string;
    avatar: string;
  };
  attachments: Attachment[];
};

type InviteNotification = {
  type: "success" | "error";
  message: string;
};

const formatTime = (dateOrTimestamp: Date | number) => {
  const date = dateOrTimestamp instanceof Date ? dateOrTimestamp : new Date(dateOrTimestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const toSizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const buildAttachmentFromFile = (file: File): Attachment => ({
  id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
  name: file.name,
  sizeLabel: toSizeLabel(file.size),
  type: file.type,
  previewUrl: URL.createObjectURL(file),
});

const stableAccentColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 45%)`;
};

export default function SocialPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
  const myAvatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);

  const [myName, setMyName] = useState<string>("You");
  const [myBadges, setMyBadges] = useState<string[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [currentMessages, setCurrentMessages] = useState<DbMessage[]>([]);

  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [likedMessageIds, setLikedMessageIds] = useState<Record<string, boolean>>({});
  const [inviteNotification, setInviteNotification] = useState<InviteNotification | null>(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;

  const fetchUnreadCounts = async (currentName: string, currentId: string) => {
    const inboxes = await contact.getUnread(currentName);
    const results: Record<string, number> = {};

    if (!inboxes) return results;

    for (const inbox of inboxes) {
      let peerId = "";
      let myUnread = 0;

      for (const inboxUser of inbox.inboxUser) {
        if (inboxUser.user_id === currentId) {
          myUnread = inboxUser.unread_messages ?? 0;
        } else {
          peerId = inboxUser.user_id;
        }
      }

      if (peerId) {
        results[peerId] = myUnread;
      }
    }

    return results;
  };

  const fetchMessages = async (currentName: string, partnerName: string) => {
    if (!currentName || !partnerName) return;
    const nextMessages = await contact.getMsg(currentName, partnerName);
    if (nextMessages) {
      setCurrentMessages(nextMessages as DbMessage[]);
    } else {
      setCurrentMessages([]);
    }
  };

  const refreshSocialData = async (currentName: string) => {
    const [allUsers, currentUser, inboxes] = await Promise.all([
      contact.getUsers(),
      contact.getCurrentUser(currentName),
      contact.getInboxes(),
    ]);

    const userMap = new Map<string, DbUser>();
    (allUsers as DbUser[]).forEach((user) => {
      userMap.set(user.id, user);
    });

    const current = currentUser as DbUser;
    setMyId(current.id);

    const unreadMap = await fetchUnreadCounts(current.name, current.id);

    const conversationPeers = new Set<string>();
    (inboxes as DbInbox[]).forEach((inbox) => {
      const ids = inbox.inboxUser.map((item) => item.user_id);
      if (!ids.includes(current.id)) return;
      ids.forEach((id) => {
        if (id !== current.id) conversationPeers.add(id);
      });
    });

    const mappedUsers: ChatUser[] = Array.from(conversationPeers)
      .map((id) => userMap.get(id))
      .filter((user): user is DbUser => Boolean(user))
      .map((user) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar?.url ?? user.image ?? DEFAULT_PROFILE_ICON.url,
        isFriend: true,
        unreadCount: unreadMap[user.id] ?? 0,
        accentColor: stableAccentColor(user.name),
        badges: user.badges ?? [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setUsers(mappedUsers);

    const nextSelected = mappedUsers.some((user) => user.name === selectedUser)
      ? selectedUser
      : mappedUsers[0]?.name ?? "";
    setSelectedUser(nextSelected);

    if (nextSelected) {
      await fetchMessages(current.name, nextSelected);
    } else {
      setCurrentMessages([]);
    }
  };

  useEffect(() => {
    const hydrateIdentity = async () => {
      const [session, profileResponse] = await Promise.all([authClient.getSession(), fetch("/api/profile/")]);

      const sessionName = session.data?.user?.name;
      const profile = (await profileResponse.json()) as {
        id?: string;
        name?: string;
        pseudo?: string;
        badges?: string[];
      };

      const currentName = profile.pseudo || profile.name || sessionName;
      if (!currentName) return;

      setMyName(currentName);
      setMyBadges(Array.isArray(profile.badges) ? profile.badges : []);
      if (profile.id) setMyId(profile.id);

      await refreshSocialData(currentName);
    };

    void hydrateIdentity();
  }, []);

  useEffect(() => {
    if (!inviteNotification) return;

    const timeoutId = setTimeout(() => {
      setInviteNotification(null);
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [inviteNotification]);

  useEffect(() => {
    if (!myName || socket.connected) return;

    socket.connect();
    socket.emit("login", myName);

    const onReceived = async ({ sender, receiver }: { sender: string; receiver: string }) => {
      if (receiver !== myName) return;

      if (selectedUser === sender) {
        await fetchMessages(myName, sender);
      }

      await refreshSocialData(myName);
    };

    socket.on("received", onReceived);

    return () => {
      socket.off("received", onReceived);
    };
  }, [myName, selectedUser]);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "auto",
    });

    previousMessageCountRef.current = currentMessages.length;
    setShowScrollToLatest(false);
  }, [selectedUser]);

  useEffect(() => {
    return () => {
      draftAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    };
  }, [draftAttachments]);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    const previousCount = previousMessageCountRef.current;
    const nextCount = currentMessages.length;
    previousMessageCountRef.current = nextCount;

    if (nextCount <= previousCount) return;

    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    const isNearBottom = distanceFromBottom < 120;

    if (isNearBottom) {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollToLatest(false);
      return;
    }

    setShowScrollToLatest(true);
  }, [currentMessages.length]);

  const currentUser = useMemo(
    () => users.find((user) => user.name === selectedUser) ?? null,
    [users, selectedUser],
  );

  const idToName = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((user) => map.set(user.id, user.name));
    if (myId) map.set(myId, myName);
    return map;
  }, [users, myId, myName]);

  const uiMessages = useMemo<ChatMessage[]>(
    () =>
      currentMessages.map((msg) => ({
        id: msg.id,
        sender: idToName.get(msg.user_id) ?? "Unknown",
        text: msg.message ?? "",
        isMine: myId ? msg.user_id === myId : false,
        sentAt: new Date(msg.createdAt).getTime(),
        liked: likedMessageIds[msg.id] ?? false,
        likedBy: likedMessageIds[msg.id]
          ? {
              name: myName,
              avatar: myAvatar,
            }
          : undefined,
        attachments: [],
      })),
    [currentMessages, idToName, likedMessageIds, myAvatar, myId, myName],
  );

  const handleMessageListScroll = () => {
    const list = messageListRef.current;
    if (!list) return;

    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    setShowScrollToLatest(distanceFromBottom > 120);
  };

  const scrollToLatestMessage = () => {
    const list = messageListRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });
    setShowScrollToLatest(false);
  };

  const renderBadges = (badges?: string[]) => {
    if (!badges?.length) return null;

    return (
      <div className="flex items-center gap-1">
        {badges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center justify-center rounded-md border border-[color:var(--accent-border)] bg-[#242033] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-200"
            title={badge}
            aria-label={badge}
          >
            {badge}
          </span>
        ))}
      </div>
    );
  };

  const selectConversation = async (userName: string) => {
    setSelectedUser(userName);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === userName
          ? {
              ...user,
              unreadCount: 0,
            }
          : user,
      ),
    );

    await contact.selectUser(userName);
    await fetchMessages(myName, userName);
  };

  const requestFriendOrInvite = () => {
    if (!currentUser) return;

    setInviteNotification({
      type: "success",
      message: currentUser.isFriend
        ? `1v1 invitation sent to ${currentUser.name}`
        : `Friend request sent to ${currentUser.name}`,
    });
  };

  const openAttachmentPicker = () => {
    fileInputRef.current?.click();
  };

  const appendDraftAttachments = (files: File[]) => {
    if (files.length === 0) return;
    const nextAttachments = files.map(buildAttachmentFromFile);
    setDraftAttachments((prevAttachments) => [...prevAttachments, ...nextAttachments]);
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    appendDraftAttachments(files);

    event.target.value = "";
  };

  const handleInputPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const filesFromClipboard = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (filesFromClipboard.length === 0) return;

    event.preventDefault();
    appendDraftAttachments(filesFromClipboard);
  };

  const removeDraftAttachment = (attachmentId: string) => {
    setDraftAttachments((prevAttachments) => {
      const target = prevAttachments.find((item) => item.id === attachmentId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prevAttachments.filter((item) => item.id !== attachmentId);
    });
  };

  const toggleMessageLike = (messageId: string) => {
    setLikedMessageIds((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const sendMessage = async () => {
    if (!currentUser) return;
    const cleanMessage = message.trim();
    if (!cleanMessage && draftAttachments.length === 0) return;

    await contact.addMsg(cleanMessage, myName, currentUser.name);
    socket.emit("msg_sent", {
      sender: myName,
      receiver: currentUser.name,
    });

    await fetchMessages(myName, currentUser.name);

    setMessage("");
    setDraftAttachments([]);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void sendMessage();
  };

  const addNewConversation = async () => {
    const username = newUsername.trim();
    if (!username || isSearchingUser) return;

    try {
      setIsSearchingUser(true);

      const response = await fetch("/api/social/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const payload = (await response.json()) as {
        error?: string;
        user?: { name: string; avatarUrl?: string | null; badges?: string[] };
      };

      if (!response.ok || !payload.user) {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "User not found",
        });
        return;
      }

      if (!(await contact.alreadyAdded(myName, payload.user.name))) {
        setSelectedUser(payload.user.name);
        await fetchMessages(myName, payload.user.name);
        setIsAddModalOpen(false);
        setNewUsername("");
        setInviteNotification({
          type: "success",
          message: `Conversation already exists with ${payload.user.name}`,
        });
        return;
      }

      await contact.addContact(myName, payload.user.name);
      await refreshSocialData(myName);
      setSelectedUser(payload.user.name);
      await fetchMessages(myName, payload.user.name);

      setIsAddModalOpen(false);
      setNewUsername("");
      setInviteNotification({
        type: "success",
        message: `Conversation opened with ${payload.user.name}`,
      });
    } catch {
      setInviteNotification({
        type: "error",
        message: "Failed to search user",
      });
    } finally {
      setIsSearchingUser(false);
    }
  };

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1">
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

      {isAddModalOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          onClick={() => {
            if (isSearchingUser) return;
            setIsAddModalOpen(false);
          }}
        >
          <Card className="w-full max-w-md bg-[#1b1826] p-5" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Find a new user</h3>
            <p className="mt-1 text-sm text-gray-300">Type a username to open a new private conversation.</p>

            <Input
              type="text"
              value={newUsername}
              onChange={(event) => setNewUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void addNewConversation();
              }}
              placeholder="Username"
              className="mt-4 py-2 text-sm"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSearchingUser}
                variant="ghost"
                className="h-10 px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void addNewConversation()}
                disabled={isSearchingUser || newUsername.trim().length === 0}
                className="h-10 px-4 py-2 text-sm font-bold"
              >
                {isSearchingUser ? "Searching..." : "Open"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-[88rem]">
        <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#3c3650] px-3 py-3">
            {users.map((user) => {
              const isActive = user.name === selectedUser;

              return (
                <Button
                  key={user.name}
                  onClick={() => void selectConversation(user.name)}
                  variant={isActive ? "primary" : "ghost"}
                  className={`relative h-11 shrink-0 gap-2 rounded-xl px-3 py-2 ${
                    isActive
                      ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                      : "border-[#3c3650] bg-[#242033] text-gray-100 hover:bg-[#302a45]"
                  }`}
                >
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md border border-[#3c3650] object-cover"
                    unoptimized
                  />
                  <span className="max-w-[8rem] truncate text-sm font-semibold">{user.name}</span>
                  {user.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                      {user.unreadCount}
                    </span>
                  )}
                </Button>
              );
            })}

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-auto !h-11 !w-11 shrink-0 rounded-lg !px-0 !py-0 text-lg font-bold"
              aria-label="Search user"
              title="Search user"
            >
              +
            </Button>
          </div>

          {currentUser && (
            <>
              <div className="relative min-h-0 flex-1">
                <div
                  ref={messageListRef}
                  onScroll={handleMessageListScroll}
                  className="h-full overflow-y-auto px-4 py-4"
                >
                  <div className="flex min-h-full flex-col justify-end gap-3">
                    {uiMessages.length === 0 && (
                      <div className="rounded-xl border border-[#3c3650] bg-[#242033]/70 p-4 text-sm text-gray-300">
                        No message yet. Start the conversation with @{currentUser.name}.
                      </div>
                    )}

                    {(() => {
                      const messageGroups: ChatMessage[][] = [];
                      let group: ChatMessage[] = [];

                      for (let i = 0; i < uiMessages.length; i += 1) {
                        const msg = uiMessages[i];
                        const previous = group[group.length - 1];

                        if (previous && previous.sender === msg.sender && msg.sentAt - previous.sentAt < 60000) {
                          group.push(msg);
                        } else {
                          if (group.length > 0) {
                            messageGroups.push(group);
                          }
                          group = [msg];
                        }
                      }

                      if (group.length > 0) {
                        messageGroups.push(group);
                      }

                      return messageGroups.map((grouped) => {
                        const first = grouped[0];

                        return (
                          <div key={`group-${first.id}`} className="w-full">
                            <div
                              className={`flex max-w-[44rem] flex-col gap-3 ${
                                first.isMine ? "ml-auto items-end" : "mr-auto items-start"
                              }`}
                            >
                              {!first.isMine && (
                                <div className="flex items-center gap-2 pl-2">
                                  <Image
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 rounded-md border border-[#3c3650] object-cover"
                                    unoptimized
                                  />
                                  <span className="text-xs font-semibold text-gray-300">{currentUser.name}</span>
                                  {renderBadges(currentUser.badges)}
                                  <span className="text-[11px] text-gray-400">{formatTime(first.sentAt)}</span>
                                </div>
                              )}

                              {first.isMine && (
                                <div className="flex items-center gap-2 justify-end pr-2">
                                  <span className="text-[11px] text-gray-400">{formatTime(first.sentAt)}</span>
                                  <span className="text-xs font-semibold text-gray-300">{myName}</span>
                                  {renderBadges(myBadges)}
                                  <Image
                                    src={myAvatar}
                                    alt={myName}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 rounded-md border border-[#3c3650] object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}

                              <article
                                style={
                                  !first.isMine && currentUser.accentColor
                                    ? { backgroundColor: currentUser.accentColor, color: "white" }
                                    : undefined
                                }
                                className={`w-fit max-w-[44rem] rounded-2xl px-5 py-3 ${
                                  first.isMine
                                    ? "bg-[var(--accent-color)] text-white"
                                    : currentUser.accentColor
                                    ? ""
                                    : "border border-[#3c3650] bg-[#242033] text-gray-100"
                                } ${first.isMine ? "ml-auto" : "mr-auto"}`}
                              >
                                <div className={`flex flex-col gap-2 ${first.isMine ? "text-right" : "text-left"}`}>
                                  {grouped.map((msg) => (
                                    <div
                                      key={msg.id}
                                      onDoubleClick={() => toggleMessageLike(msg.id)}
                                      className="cursor-pointer select-none"
                                      title="Double-click to like"
                                    >
                                      {msg.text && (
                                        <p className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                          {msg.text}
                                        </p>
                                      )}

                                      {msg.liked && (
                                        <div
                                          className={`mt-1 flex items-center gap-1 text-xs ${
                                            msg.isMine ? "justify-end" : "justify-start"
                                          }`}
                                        >
                                          <i className="fa-solid fa-heart text-pink-300" aria-label="Liked message" />
                                          {msg.likedBy?.avatar && (
                                            <Image
                                              src={msg.likedBy.avatar}
                                              alt={msg.likedBy.name}
                                              width={14}
                                              height={14}
                                              className="h-3.5 w-3.5 rounded-full border border-white/30 object-cover"
                                              title={`Liked by ${msg.likedBy.name}`}
                                              unoptimized
                                            />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </article>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {showScrollToLatest && (
                  <Button
                    onClick={scrollToLatestMessage}
                    className="absolute bottom-3 right-3 !h-9 !w-9 rounded-full !px-0 !py-0 shadow-lg"
                    aria-label="Go to latest message"
                    title="Go to latest message"
                  >
                    <i className="fa-solid fa-angles-down" />
                  </Button>
                )}
              </div>

              <footer className="border-t border-[#3c3650] bg-[#15131d] px-3 py-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFilesChange}
                  accept="image/*,.pdf,.txt,.doc,.docx"
                />

                <div className="flex items-center gap-2">
                  <Button
                    onClick={requestFriendOrInvite}
                    variant={currentUser.isFriend ? "primary" : "ghost"}
                    className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                    title={currentUser.isFriend ? "Request duel" : "Add friend"}
                    aria-label={currentUser.isFriend ? "Request duel" : "Add friend"}
                  >
                    <i className={currentUser.isFriend ? "fa-solid fa-bolt" : "fa-solid fa-user-plus"} />
                  </Button>

                  <Button
                    onClick={openAttachmentPicker}
                    variant="ghost"
                    className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                    aria-label="Add attachments"
                  >
                    <i className="fa-solid fa-paperclip" />
                  </Button>

                  <Input
                    type="text"
                    placeholder={`Send a message to @${currentUser.name}`}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onPaste={handleInputPaste}
                    onKeyDown={handleInputKeyDown}
                    className="flex-1 px-3 py-2 text-sm"
                  />

                  <Button
                    onClick={() => void sendMessage()}
                    disabled={!hasDraft}
                    className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                    aria-label="Send"
                  >
                    <i className="fa-solid fa-paper-plane" />
                  </Button>
                </div>

                {draftAttachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draftAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#3c3650] bg-[#242033] px-2 py-1 text-xs text-gray-200"
                      >
                        <span className="max-w-[10rem] truncate">{attachment.name}</span>
                        <Button
                          onClick={() => removeDraftAttachment(attachment.id)}
                          className="h-auto border-0 bg-transparent p-0 text-gray-400 hover:text-white"
                          aria-label={`Remove ${attachment.name}`}
                        >
                          <i className="fa-solid fa-xmark text-xs" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </footer>
            </>
          )}
        </section>
      </div>
    </AppPageShell>
  );
}

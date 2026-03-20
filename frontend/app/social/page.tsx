"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON, PROFILE_ICONS } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";

const esper = PROFILE_ICONS.find((icon) => icon.type === "esper")?.url ?? DEFAULT_PROFILE_ICON.url;
const dragon = PROFILE_ICONS.find((icon) => icon.type === "dragon")?.url ?? DEFAULT_PROFILE_ICON.url;
const mizu = PROFILE_ICONS.find((icon) => icon.type === "mizu")?.url ?? DEFAULT_PROFILE_ICON.url;

type Attachment = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  previewUrl: string;
};

type ChatUser = {
  name: string;
  avatar: string;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  isMine: boolean;
  sentAt: string;
  attachments: Attachment[];
};

type InviteNotification = {
  type: "success" | "error";
  message: string;
};

const SOCIAL_STORAGE_KEY = "social-chat-state";

// HARDCODE: seeded contacts used as temporary mock social graph.
const defaultUsers = [
  { name: "Sauralt", avatar: esper, unreadCount: 0 },
  { name: "Xoco", avatar: dragon, unreadCount: 1 },
  { name: "SunMiaou", avatar: mizu, unreadCount: 0 },
] as ChatUser[];

// HARDCODE: seeded chat history used until message persistence is DB-backed.
const defaultMessagesByUser: Record<string, ChatMessage[]> = {
  SunMiaou: [
    {
      id: "msg-1",
      sender: "SunMiaou",
      text: "Salut ! Tu lances une partie ce soir ?",
      isMine: false,
      sentAt: "20:41",
      attachments: [],
    },
    {
      id: "msg-2",
      sender: "me",
      text: "Oui, je finis mon deck et je t’écris.",
      isMine: true,
      sentAt: "20:43",
      attachments: [],
    },
  ],
  Xoco: [
    {
      id: "msg-3",
      sender: "Xoco",
      text: "Tu peux me renvoyer la liste du deck ?",
      isMine: false,
      sentAt: "18:12",
      attachments: [],
    },
  ],
  Sauralt: [],
};

// HARDCODE: fallback social state when no local persisted data exists.
const fallbackSocialState = {
  users: defaultUsers,
  messagesByUser: defaultMessagesByUser,
  selectedUser: "SunMiaou",
};

/**
 * Objective: hydrate social screen state from localStorage.
 * Usage: called once on mount to restore local conversation state.
 * Input: none.
 * Output: social state object with users/messages/selected user.
 * Special cases: invalid JSON falls back to hardcoded seed state.
 */
const getSocialStateFromStorage = () => {
  const savedState = localStorage.getItem(SOCIAL_STORAGE_KEY);
  if (!savedState) {
    return fallbackSocialState;
  }

  try {
    const parsed = JSON.parse(savedState) as {
      users?: ChatUser[];
      messagesByUser?: Record<string, ChatMessage[]>;
      selectedUser?: string;
    };

    const users = parsed.users && parsed.users.length > 0 ? parsed.users : defaultUsers;
    const messagesByUser = parsed.messagesByUser ?? defaultMessagesByUser;
    const selectedUser =
      parsed.selectedUser && users.some((user) => user.name === parsed.selectedUser)
        ? parsed.selectedUser
        : users[0]?.name ?? "SunMiaou";

    return {
      users,
      messagesByUser,
      selectedUser,
    };
  } catch {
    return fallbackSocialState;
  }
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

/**
 * Objective: convert a browser file into app attachment payload.
 * Usage: used by attachment picker before drafting a message.
 * Input: browser `File` object.
 * Output: attachment metadata + temporary object URL.
 * Special cases: generated ID is client-side and not globally unique.
 */
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

  const [users, setUsers] = useState<ChatUser[]>(fallbackSocialState.users);
  const [selectedUser, setSelectedUser] = useState(fallbackSocialState.selectedUser);
  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [inviteNotification, setInviteNotification] = useState<InviteNotification | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>(
    fallbackSocialState.messagesByUser,
  );

  useEffect(() => {
    const syncSocialStateFromStorage = async () => {
      await Promise.resolve();
      const hydratedSocialState = getSocialStateFromStorage();
      setUsers(hydratedSocialState.users);
      setMessagesByUser(hydratedSocialState.messagesByUser);
      setSelectedUser(hydratedSocialState.selectedUser);
    };

    void syncSocialStateFromStorage();
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => user.name === selectedUser) ?? users[0],
    [selectedUser, users],
  );

  const currentMessages = useMemo(
    () => messagesByUser[selectedUser] ?? [],
    [messagesByUser, selectedUser],
  );

  const filteredUsers = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => user.name.toLowerCase().includes(query));
  }, [contactSearch, users]);

  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedUser, currentMessages.length]);

  useEffect(() => {
    return () => {
      draftAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    };
  }, [draftAttachments]);

  useEffect(() => {
    if (!inviteNotification) return;

    const timeoutId = setTimeout(() => {
      setInviteNotification(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [inviteNotification]);

  useEffect(() => {
    localStorage.setItem(
      SOCIAL_STORAGE_KEY,
      JSON.stringify({
        users,
        messagesByUser,
        selectedUser,
      }),
    );
  }, [messagesByUser, selectedUser, users]);

  useEffect(() => {
    if (users.length === 0) return;
    if (!users.some((user) => user.name === selectedUser)) {
      setSelectedUser(users[0].name);
    }
  }, [selectedUser, users]);

  useEffect(() => {
    const handleEscapeModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isAddFriendModalOpen) {
        if (isInviting) return;
        setIsAddFriendModalOpen(false);
        setInviteUsername("");
      }
    };

    document.addEventListener("keydown", handleEscapeModal);
    return () => {
      document.removeEventListener("keydown", handleEscapeModal);
    };
  }, [isAddFriendModalOpen, isInviting]);

  const selectUser = (userName: string) => {
    setSelectedUser(userName);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === userName ? { ...user, unreadCount: 0 } : user,
      ),
    );
  };

  const openAddFriendModal = () => {
    if (isInviting) return;
    setInviteUsername("");
    setIsAddFriendModalOpen(true);
  };

  const closeAddFriendModal = () => {
    if (isInviting) return;
    setIsAddFriendModalOpen(false);
    setInviteUsername("");
  };

  /**
   * Objective: invite a user by pseudo and initialize local chat context.
   * Usage: called from add-friend modal submit actions.
   * Input: none (uses `inviteUsername` state).
   * Output: none (mutates state and notification banner).
   * Special cases: ignores empty input and prevents concurrent submissions.
   */
  const submitFriendInvite = async () => {
    const username = inviteUsername.trim();
    if (isInviting || !username) return;

    try {
      setIsInviting(true);

      const response = await fetch("/api/social/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const payload = (await response.json()) as {
        error?: string;
        user?: { name: string; avatarUrl?: string | null };
      };

      if (!response.ok || !payload.user) {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "ce joueur n'existe pas",
        });
        return;
      }

      const foundName = payload.user.name;
      const foundAvatar = payload.user.avatarUrl || DEFAULT_PROFILE_ICON.url;

      setUsers((prevUsers) => {
        if (prevUsers.some((user) => user.name === foundName)) {
          return prevUsers;
        }

        return [
          ...prevUsers,
          {
            name: foundName,
            avatar: foundAvatar,
            unreadCount: 0,
          },
        ];
      });

      setMessagesByUser((prevMessages) => {
        if (prevMessages[foundName]) {
          return prevMessages;
        }

        return {
          ...prevMessages,
          [foundName]: [],
        };
      });

      setSelectedUser(foundName);
      setInviteNotification({
        type: "success",
        message: "votre invitation a bien ete envoyer",
      });
      setIsAddFriendModalOpen(false);
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

  /**
   * Objective: append a new message to current conversation.
   * Usage: called on send button and Enter key shortcut.
   * Input: none (uses message and attachment draft states).
   * Output: none (updates message list and resets draft state).
   * Special cases: blocks sending when text and attachment draft are both empty.
   */
  const sendMessage = () => {
    const cleanMessage = message.trim();
    if (!cleanMessage && draftAttachments.length === 0) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: cleanMessage,
      isMine: true,
      sentAt: formatTime(new Date()),
      attachments: draftAttachments,
    };

    setMessagesByUser((prevMessages) => ({
      ...prevMessages,
      [selectedUser]: [...(prevMessages[selectedUser] ?? []), newMessage],
    }));

    setMessage("");
    setDraftAttachments([]);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
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

      {isAddFriendModalOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          onClick={closeAddFriendModal}
        >
          {/* Usage atomique: Card standardise le conteneur modal pour les interactions sociales. */}
          <Card
            className="w-full max-w-md bg-[#1b1826] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">entrez le nom d&apos;utilisateur</h3>
            <p className="mt-1 text-sm text-gray-300">Saisis le pseudo du joueur pour envoyer une invitation.</p>

            <Input
              type="text"
              value={inviteUsername}
              onChange={(event) => setInviteUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitFriendInvite();
                }
              }}
              placeholder="Pseudo du joueur"
              className="mt-4 py-2 text-sm"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                onClick={closeAddFriendModal}
                disabled={isInviting}
                variant="ghost"
                className="h-10 px-4 py-2 text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={submitFriendInvite}
                disabled={isInviting || inviteUsername.trim().length === 0}
                className="h-10 px-4 py-2 text-sm font-bold"
              >
                {isInviting ? "Recherche..." : "Envoyer"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-6xl">
        <section className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md lg:grid-cols-[19rem_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-[#3c3650] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-[#3c3650] px-5 py-4">
              <h1 className="text-2xl font-bold tracking-tight">Social</h1>
            </div>

            <div className="border-b border-[#3c3650] p-3">
              <Input
                type="text"
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                placeholder="Rechercher un contact..."
                className="py-2 text-sm"
              />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {filteredUsers.map((user) => {
                const isActive = selectedUser === user.name;

                return (
                  <Button
                    key={user.name}
                    onClick={() => selectUser(user.name)}
                    variant={isActive ? "primary" : "ghost"}
                    className={`relative flex w-full justify-start items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                        : "border-[#3c3650] bg-[#242033] text-gray-200 hover:bg-[#302a45]"
                    }`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="h-10 w-10 rounded-md border border-[#3c3650] object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="truncate font-semibold">{user.name}</span>
                    {user.unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {user.unreadCount}
                      </span>
                    )}
                  </Button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="rounded-xl border border-[#3c3650] bg-[#242033]/70 p-3 text-sm text-gray-300">
                  Aucun contact trouvé.
                </div>
              )}
            </div>

            <div className="border-t border-[#3c3650] p-3">
              <Button
                onClick={openAddFriendModal}
                disabled={isInviting}
                className="h-10 w-full py-2 font-bold"
              >
                {isInviting ? "Recherche..." : "+ Nouveau contact"}
              </Button>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <header className="flex items-center justify-between border-b border-[#3c3650] bg-[#242033] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    width={64}
                    height={64}
                    className="h-10 w-10 rounded-md border border-[#3c3650] object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentUser.name}</h2>
                  {hasDraft && <p className="text-xs text-[var(--accent-color)]">En train d’écrire...</p>}
                </div>
              </div>

              <div className="rounded-xl border border-[#3c3650] bg-[#302a45] px-3 py-1 text-xs text-gray-200">
                Conversation
              </div>
            </header>

            <div ref={messageListRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {currentMessages.length === 0 && (
                <div className="rounded-xl border border-[#3c3650] bg-[#242033]/70 p-4 text-sm text-gray-300">
                  Aucune conversation pour le moment. Envoie le premier message à @{selectedUser}.
                </div>
              )}

              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <article
                    className={`max-w-[44rem] rounded-2xl px-5 py-3 ${
                      msg.isMine
                        ? "bg-[var(--accent-color)] text-white"
                        : "border border-[#3c3650] bg-[#242033] text-gray-100"
                    }`}
                  >
                    {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                    {msg.attachments.length > 0 && (
                      <div className={`mt-2 grid gap-2 ${msg.attachments.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                        {msg.attachments.map((attachment) => {
                          const isImage = attachment.type.startsWith("image/");

                          return (
                            <div
                              key={attachment.id}
                              className={`rounded-lg border p-2 ${
                                msg.isMine
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
                    )}

                    <p className={`mt-2 text-[11px] ${msg.isMine ? "text-white/80" : "text-gray-400"}`}>
                      {msg.sentAt}
                    </p>
                  </article>
                </div>
              ))}
            </div>

            <footer className="border-t border-[#3c3650] bg-[#15131d] p-4">
              {draftAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {draftAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="inline-flex items-center gap-2 rounded-full border border-[#3c3650] bg-[#242033] px-3 py-1 text-xs text-gray-200"
                    >
                      <i className="fa-regular fa-paperclip" />
                      <span className="max-w-[14rem] truncate">{attachment.name}</span>
                      <Button
                        onClick={() => removeDraftAttachment(attachment.id)}
                        variant="ghost"
                        size="sm"
                        className="h-auto border-0 bg-transparent p-0 text-gray-300 hover:bg-transparent hover:text-white"
                        aria-label={`Supprimer ${attachment.name}`}
                      >
                        <i className="fa-solid fa-xmark" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-full border border-[#3c3650] bg-[#242033] px-2 py-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFilesChange}
                  accept="image/*,.pdf,.txt,.doc,.docx"
                />

                <Button
                  onClick={handlePickAttachments}
                  variant="secondary"
                  className="h-9 w-9 rounded-full border-0 bg-[#302a45] p-0 hover:bg-[#3b3457]"
                  aria-label="Ajouter des pièces jointes"
                >
                  <i className="fa-solid fa-paperclip" />
                </Button>

                <Input
                  type="text"
                  placeholder={`Envoyez un message à @${selectedUser}`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="h-auto flex-1 border-0 bg-transparent px-1 py-0 text-sm focus:border-transparent"
                />

                <Button
                  onClick={sendMessage}
                  disabled={!hasDraft}
                  className="h-9 w-9 rounded-full p-0"
                  aria-label="Envoyer"
                >
                  <i className="fa-solid fa-paper-plane" />
                </Button>
              </div>
            </footer>
          </section>
        </section>
      </div>
    </AppPageShell>
  );
}

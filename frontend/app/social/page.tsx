"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON, PROFILE_ICONS } from "@/lib/profile-icons";
import { contact }  from "./index"

const esper = PROFILE_ICONS.find((icon) => icon.type === "esper")?.url ?? DEFAULT_PROFILE_ICON.url;
const dragon = PROFILE_ICONS.find((icon) => icon.type === "dragon")?.url ?? DEFAULT_PROFILE_ICON.url;
const mizu = PROFILE_ICONS.find((icon) => icon.type === "mizu")?.url ?? DEFAULT_PROFILE_ICON.url;

type Messages = {
  id:         string;
  user_id:    string;
  inbox_id:   string;
  messages:   string | null;
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
  image:        			string | null;
  profileBackground:	string | null;
  profileBanner: 			string | null;
  createdAt:    			Date;
  updatedAt:    			Date;
  avatarId:      			string | null;
  avatar:        			Avatar | null;
  // accounts:      	Account[];
  // decks:        		Decks[];
  // friends:       	Friends[];
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

type ChatMessage = {
  id: 					string;
  sender: 			string;
  text: 				string;
  isMine: 			boolean;
  sentAt: 			string;
  attachments:	Attachment[];
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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [inviteNotification, setInviteNotification] = useState<InviteNotification | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [userPseudo, setUserPseudo] = useState<string | null>(null)
  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({
  });
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inboxes, setInboxes] = useState<Inbox[]>([]);


  const currentMessages = useMemo(
    () => messagesByUser[selectedUser] ?? [],
    [messagesByUser, selectedUser],
  );

  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;

  //recupere le nom d'utilisateur actuel
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
        setUserPseudo(data.user.name);
    };
    getUserData();
  });

  //recupere les utilisateurs de la db
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

  //reconnecte les sockets si refresh
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

	//permet de scroll la conversation
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

	//timer pour les notifications
	useEffect(() => {
		if (!inviteNotification) return;

		const timeoutId = setTimeout(() => {
			setInviteNotification(null);
		}, 3000);

		return () => clearTimeout(timeoutId);
	}, [inviteNotification]);

	//Loading screen pour que currentUser soit cree
	if (!currentUser)
	{
		return <div>Loading...</div>;
	}

  //ouvre une demande de conversation
  const openAddContactModal = () => {
    if (isInviting) return;
    setInviteUsername("");
    setIsAddContactModalOpen(true);
  };

  //ferme la demande de conversation
  const closeAddContactModal = () => {
    if (isInviting) return;
    setIsAddContactModalOpen(false);
    setInviteUsername("");
  };

  //cree une nouvelle conversation
  const submitContactInvite = async () => {
    const username = inviteUsername.trim();
    if (isInviting || !username) return;
    try {
      setIsInviting(true);

      //cree une reponse appropriee et configure des variables
      const response = await fetch("/api/social/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const payload = (await response.json()) as {
        error?: string;
        user?: { name: string; avatarUrl?: string | null };
      };
      //return si on s'invite
      if (payload.error === "vous ne pouvez pas vous inviter")
      {
        setInviteNotification({
          type: "error",
          message: payload.error,
        });
        return ;
      }
      //check si l'inbox existe deja
      if (await contact.alreadyAdded(userPseudo!, inviteUsername) === false)
      {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "une discussion a deja ete cree.",
        });
        return;
      }
      //cree une nouvelle inbox pour les utilisateurs
      contact.addContact(userPseudo!, inviteUsername);

      //renvoit si le joueur n'existe pas
      if (!response.ok || !payload.user) {
        setInviteNotification({
          type: "error",
          message: payload.error ?? "ce joueur n'existe pas.",
        });
        return;
      }

      const foundName = payload.user.name;
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

  //Envoyer un message
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
    <AppPageShell>
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
            <h3 className="text-lg font-bold text-white">entrez le nom d&apos;utilisateur</h3>
            <p className="mt-1 text-sm text-gray-300">Saisis le pseudo du joueur pour envoyer une invitation.</p>

            <input
              type="text"
              value={inviteUsername}
              onChange={(event) => setInviteUsername(event.target.value)}
              placeholder="Pseudo du joueur"
              className="mt-4 w-full rounded-xl border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[var(--accent-color)]"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={closeAddContactModal}
                disabled={isInviting}
                className="rounded-xl border border-[#3c3650] bg-[#242033] px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-[#302a45] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={submitContactInvite}
                disabled={isInviting || inviteUsername.trim().length === 0}
                className="rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isInviting ? "Recherche..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <section className="grid h-[calc(100vh-2rem)] w-full grid-cols-1 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md lg:grid-cols-[19rem_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-[#3c3650] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-[#3c3650] px-5 py-4">
              <h1 className="text-2xl font-bold tracking-tight">Social</h1>
              <button
                onClick={() => router.push("/home")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3c3650] bg-[#242033] text-white transition-colors hover:bg-[#302a45]"
                aria-label="Retour à l'accueil"
              >
                <i className="fa-solid fa-house" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {
                users.map((user) => {
                const isActive = selectedUser === user.name;
                if (user.name === userPseudo)
                  return null;
								const hasConversation = inboxes.some(inbox => {
									const ids = inbox.inboxUser.map(iu => iu.user_id);
									return ids.includes(user.id) && ids.includes(currentUser.id);
								});
                console.log(currentUser.inbox);
								if (!hasConversation) return null;
                return (
                  <button
                    key={user.name}
                    onClick={async () => {
                      const next = await contact.selectUser(user.name);
                      setSelectedUser(next)
                      }
                    }
                    className={`relative flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                        : "border-[#3c3650] bg-[#242033] text-gray-200 hover:bg-[#302a45]"
                    }`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible">
                      <Image
                        src={user.avatar?.url ?? DEFAULT_PROFILE_ICON.url}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="h-12 w-12 rounded-lg border border-[#3c3650] object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="truncate font-semibold">{user.name}</span>
                    {/* {user.unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {user.unreadCount}
                      </span>
                    )} */}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#3c3650] p-3">
              <button
                onClick={openAddContactModal}
                disabled={isInviting}
                className="w-full rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] py-2 font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {isInviting ? "Recherche..." : "+ Nouveau contact"}
              </button>
            </div>
          </aside>
          <section className="flex min-h-0 flex-col">
            <header className="flex items-center justify-between border-b border-[#3c3650] bg-[#242033] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-visible">
                  <Image
                    src={currentUser?.avatar?.url ?? DEFAULT_PROFILE_ICON.url}
                    alt={currentUser?.name ?? "default"}
                    width={64}
                    height={64}
                    className="h-12 w-12 rounded-lg border border-[#3c3650] object-cover"
                    unoptimized
                  />
                </div>
                { <div>
                  { <h2 className="text-xl font-bold">{currentUser?.name ?? "default"}</h2> }
                  {hasDraft && <p className="text-xs text-[#b4a8ff]">En train d’écrire...</p>}
                </div>}
              </div>

              <button
                onClick={() => router.push("/home")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3c3650] bg-[#302a45] text-white transition-colors hover:bg-[#3b3457]"
                aria-label="Fermer"
              >
                ✕
              </button>
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
                      <button
                        onClick={() => removeDraftAttachment(attachment.id)}
                        className="text-gray-300 transition-colors hover:text-white"
                        aria-label={`Supprimer ${attachment.name}`}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
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

                <button
                  onClick={handlePickAttachments}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#302a45] text-white transition-colors hover:bg-[#3b3457]"
                  aria-label="Ajouter des pièces jointes"
                >
                  <i className="fa-solid fa-paperclip" />
                </button>

                <input
                  type="text"
                  placeholder={`Envoyez un message à @${selectedUser}`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="flex-1 bg-transparent px-1 text-sm text-gray-200 outline-none placeholder:text-gray-500"
                />

                <button
                  onClick={sendMessage}
                  disabled={!hasDraft}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-color)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Envoyer"
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </div>
            </footer>
          </section>
        </section>
      </div>
    </AppPageShell>
  );
}

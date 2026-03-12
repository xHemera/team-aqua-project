"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";

const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";
const cynthia = "https://archives.bulbagarden.net/media/upload/8/83/Spr_B2W2_Cynthia.png";
const n = "https://archives.bulbagarden.net/media/upload/2/2c/Spr_B2W2_N.png";

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

  const [users, setUsers] = useState<ChatUser[]>([
    { name: "Sauralt", avatar: alder, unreadCount: 0 },
    { name: "Xoco", avatar: n, unreadCount: 1 },
    { name: "SunMiaou", avatar: cynthia, unreadCount: 0 },
  ]);

  const [selectedUser, setSelectedUser] = useState("SunMiaou");
  const [message, setMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);

  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({
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
  });

  const currentUser = useMemo(
    () => users.find((user) => user.name === selectedUser) ?? users[0],
    [selectedUser, users],
  );

  const currentMessages = useMemo(
    () => messagesByUser[selectedUser] ?? [],
    [messagesByUser, selectedUser],
  );

  const hasDraft = message.trim().length > 0 || draftAttachments.length > 0;


  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
      {
        setUserPseudo(data.user.name);
      };
    };
    getUserData();
  });

  useEffect(() => {
    if (socket.connected || !userPseudo) return;
    socket.connect()
    socket.emit("login", userPseudo);
    socket.on("online_users", (users) => {
      console.log("Users from Redis:", users);
    });
  });

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

  const selectUser = (userName: string) => {
    setSelectedUser(userName);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === userName ? { ...user, unreadCount: 0 } : user,
      ),
    );
  };

  const handleAddContact = () => {
    const nextIndex = users.length + 1;
    const newName = `Nouveau_${nextIndex}`;

    setUsers((prevUsers) => [
      ...prevUsers,
      {
        name: newName,
        avatar: cynthia,
        unreadCount: 0,
      },
    ]);

    setMessagesByUser((prevMessages) => ({
      ...prevMessages,
      [newName]: [],
    }));

    setSelectedUser(newName);
    setMessage("");
    setDraftAttachments([]);
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
    <main className="relative isolate min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] px-4 py-4 sm:px-8 sm:py-6">
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
              {users.map((user) => {
                const isActive = selectedUser === user.name;

                return (
                  <button
                    key={user.name}
                    onClick={() => selectUser(user.name)}
                    className={`relative flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-[#8e82ff]/60 bg-[#8e82ff]/25 text-white"
                        : "border-[#3c3650] bg-[#242033] text-gray-200 hover:bg-[#302a45]"
                    }`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="h-12 w-12 object-contain"
                        style={{ imageRendering: "pixelated" }}
                        unoptimized
                      />
                    </div>
                    <span className="truncate font-semibold">{user.name}</span>
                    {user.unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {user.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#3c3650] p-3">
              <button
                onClick={handleAddContact}
                className="w-full rounded-xl border border-[#b4a8ff]/60 bg-[#8e82ff] py-2 font-bold text-white transition-colors hover:bg-[#7d71ec]"
              >
                + Nouveau contact
              </button>
            </div>
          </aside>
          <section className="flex min-h-0 flex-col">
            <header className="flex items-center justify-between border-b border-[#3c3650] bg-[#242033] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-visible">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    width={64}
                    height={64}
                    className="h-12 w-12 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    unoptimized
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentUser.name}</h2>
                  {hasDraft && <p className="text-xs text-[#b4a8ff]">En train d’écrire...</p>}
                </div>
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
                        ? "bg-[#8e82ff] text-white"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b4a8ff]/60 bg-[#8e82ff] text-white transition-colors hover:bg-[#7d71ec] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Envoyer"
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </div>
            </footer>
          </section>
        </section>
      </div>
    </main>
  );
}

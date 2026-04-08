"use client";

import Image from "next/image";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { DEFAULT_PROFILE_ICON, PROFILE_ICONS } from "@/lib/profile-icons";

const esper = PROFILE_ICONS.find((icon) => icon.type === "esper")?.url ?? DEFAULT_PROFILE_ICON.url;
const dragon = PROFILE_ICONS.find((icon) => icon.type === "dragon")?.url ?? DEFAULT_PROFILE_ICON.url;
const mizu = PROFILE_ICONS.find((icon) => icon.type === "mizu")?.url ?? DEFAULT_PROFILE_ICON.url;

type ChatUser = {
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
  sentAtLabel: string;
  liked?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    sizeLabel: string;
    isImage?: boolean;
  }>;
};

const users: ChatUser[] = [
  { name: "SunMiaou", avatar: mizu, isFriend: true, unreadCount: 0, accentColor: "#3b82f6", badges: [] },
  { name: "Xoco", avatar: dragon, isFriend: false, unreadCount: 1, accentColor: "#a855f7", badges: ["VIP"] },
  { name: "Sauralt", avatar: esper, isFriend: true, unreadCount: 0, accentColor: "#10b981", badges: [] },
];

const currentUser = users[0];
const myName = "You";
const myAvatar = DEFAULT_PROFILE_ICON.url;
const myBadges: string[] = ["DEV"];

const currentMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "SunMiaou",
    text: "Hey, are you free for a game tonight?",
    isMine: false,
    sentAtLabel: "6:01 PM",
  },
  {
    id: "msg-2",
    sender: "me",
    text: "Yes, finishing my deck and then I am ready.",
    isMine: true,
    sentAtLabel: "6:03 PM",
    liked: true,
  },
  {
    id: "msg-3",
    sender: "SunMiaou",
    text: "Perfect. I will be online in 10 minutes.",
    isMine: false,
    sentAtLabel: "6:04 PM",
    attachments: [
      {
        id: "att-1",
        name: "deck-v2.png",
        sizeLabel: "842 KB",
        isImage: true,
      },
    ],
  },
];

const renderBadges = (badges?: string[]) => {
  if (!badges?.length) return null;

  return (
    <div className="flex items-center gap-1">
      {badges.map((badge) => (
        <span key={badge} className="inline-flex items-center justify-center rounded-md border border-[color:var(--accent-border)] bg-[#242033] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-200" title={badge} aria-label={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
};

export default function SocialPage() {
  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1">
      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-[88rem]">
        <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#3c3650] px-3 py-3">
            {users.map((user, index) => {
              const isActive = index === 0;

              return (
				/*Bouton pour selectionner la conversation*/
                <Button
                  key={user.name}
                  variant={isActive ? "primary" : "ghost"}
                  className={`relative h-11 shrink-0 gap-2 rounded-xl px-3 py-2 ${
                    isActive
                      ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                      : "border-[#3c3650] bg-[#242033] text-gray-100"
                  }`}
                >
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md border border-[#3c3650] object-cover"
                  />

                  <span className="max-w-[8rem] truncate text-sm font-semibold">{user.name}</span>

				  {/*Affichage du nombre de messages non lus*/}
                  {user.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                      {user.unreadCount}
                    </span>
                  )}

                </Button>
              );
            })}

            <Button className="ml-auto !h-11 !w-11 shrink-0 rounded-lg !px-0 !py-0 text-lg font-bold" aria-label="Search user" title="Search user">
				+
            </Button>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="h-full overflow-y-auto px-4 py-4">
              <div className="flex min-h-full flex-col justify-end gap-3">
                {currentMessages.map((msg) => {
                  const isMine = msg.isMine;
                  const wrapperClass = isMine ? "ml-auto items-end" : "mr-auto items-start";
                  const messageClass = isMine
                    ? "bg-[var(--accent-color)] text-white"
                    : currentUser.accentColor
                    ? ""
                    : "border border-[#3c3650] bg-[#242033] text-gray-100";
                  const messageStyle =
                    !isMine && currentUser.accentColor
                      ? { backgroundColor: currentUser.accentColor, color: "white" }
                      : undefined;

                  return (
                    <div key={msg.id} className="w-full">
                      <div className={`flex max-w-[44rem] flex-col gap-3 ${wrapperClass}`}>
                        {isMine ? (
                          <div className="flex items-center gap-2 justify-end pr-2">
                            <span className="text-[11px] text-gray-400">{msg.sentAtLabel}</span>
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
                        ) : (
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
                            <span className="text-[11px] text-gray-400">{msg.sentAtLabel}</span>
                          </div>
                        )}

                        <article
                          style={messageStyle}
                          className={`w-fit max-w-[44rem] rounded-2xl px-5 py-3 ${messageClass} ${
                            isMine ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          <p
                            className={`leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                              isMine ? "text-right" : "text-left"
                            }`}
                          >
                            {msg.text}
                          </p>

                          {msg.attachments?.length ? (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {msg.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className={`rounded-lg border p-2 ${
                                    isMine ? "border-white/30 bg-white/10" : "border-white/20 bg-white/10"
                                  }`}
                                >
                                  {attachment.isImage ? (
                                    <div className="mb-2 flex h-24 items-center justify-center rounded-md bg-black/25 text-xs text-gray-200">
                                      image preview
                                    </div>
                                  ) : (
                                    <div className="mb-2 flex h-24 items-center justify-center rounded-md bg-black/25 text-2xl">
                                      <i className="fa-regular fa-file-lines" />
                                    </div>
                                  )}
                                  <p className="truncate text-xs font-semibold">{attachment.name}</p>
                                  <p className="text-[11px] opacity-75">{attachment.sizeLabel}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}

						  {/*Like*/}
                          {msg.liked ? (
                            <div className="mt-1 flex items-center justify-end gap-1 text-xs">
                              <i className="fa-solid fa-heart text-pink-300" aria-label="Liked message" />
                            </div>
                          ) : null}

                        </article>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


			{/*Pop up de nouvelle conversation*/}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4" hidden>
              <div className="w-full max-w-md rounded-2xl border border-[#3c3650] bg-[#1b1826] p-5 shadow-2xl">
                <h3 className="text-lg font-bold text-white">New conversation</h3>

                <Input
                  type="text"
                  value=""
                  readOnly
                  placeholder="Username"
                  className="mt-4 py-2 text-sm"
                />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="ghost" className="h-10 px-4 py-2 text-sm" disabled>
                    Cancel
                  </Button>
                  <Button className="h-10 px-4 py-2 text-sm font-bold" disabled>
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-[#3c3650] bg-[#15131d] px-3 py-2">
			{/*Affichage d'une notification de duel request*/}
            <div className="mb-2 rounded-lg border border-dashed border-[#4a4361] bg-[#1f1b2b] px-3 py-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-bolt text-yellow-300" />
                <span className="font-semibold">@{currentUser.name} sent a duel request</span>
        		<Button className="ml-auto !h-7 !px-2 !py-0 text-xs leading-none" aria-label="Accept duel request" title="Accept duel request">
				  Accept
				</Button>
        		<Button variant="ghost" className="!h-7 !px-2 !py-0 text-xs leading-none" aria-label="Decline duel request" title="Decline duel request">
				  Decline
				</Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
			{/*Bouton pour envoyer une demande de duel ou ajouter en ami*/}
			<Button
                variant={currentUser.isFriend ? "primary" : "ghost"}
                className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                title={currentUser.isFriend ? "Request duel" : "Add friend"}
                aria-label={currentUser.isFriend ? "Request duel" : "Add friend"}
              >
                <i className={currentUser.isFriend ? "fa-solid fa-bolt" : "fa-solid fa-user-plus"} />
              </Button>

			{/*Bouton piece jointe*/}
              <Button
                variant="ghost"
                className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                aria-label="Add attachments"
              >
                <i className="fa-solid fa-paperclip" />
              </Button>

              <Input
                type="text"
                placeholder={`Send a message to @${currentUser.name}`}
                value=""
                readOnly
                className="flex-1 px-3 py-2 text-sm"
              />

			{/*Text input*/}
              <Button
                className="!h-9 !w-9 shrink-0 rounded-lg !px-0 !py-0 text-base"
                aria-label="Send">
                <i className="fa-solid fa-paper-plane" />
              </Button>
            </div>

			{/*Affichage des fichiers attachés*/}
            <div className="mt-2 flex flex-wrap gap-2">
				{/*Item*/}
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#3c3650] bg-[#242033] px-2 py-1 text-xs text-gray-200">
                <span className="max-w-[10rem] truncate">profile-card.jpg</span>
                <span className="text-[11px] text-gray-400">2.1 MB</span>
                <i className="fa-solid fa-xmark text-xs text-gray-400" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#3c3650] bg-[#242033] px-2 py-1 text-xs text-gray-200">
                <span className="max-w-[10rem] truncate">notes.txt</span>
                <span className="text-[11px] text-gray-400">4 KB</span>
                <i className="fa-solid fa-xmark text-xs text-gray-400" />
              </div>
            </div>
          </footer>
        </section>
      </div>
    </AppPageShell>
  );
}
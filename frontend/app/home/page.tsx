"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import DeckSelector from "@/components/organisms/home/DeckSelector";
import MatchmakingModal from "@/components/organisms/home/MatchmakingModal";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import PlayCta from "@/components/organisms/home/PlayCta";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import { DEFAULT_DECKS, DECK_ICONS, useDeckPreferences } from "@/hooks/useDeckPreferences";
import { useAvatarPreference } from "@/hooks/useAvatarPreference";

export default function Home() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);

  const avatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);
  const { selectedDeck, setSelectedDeck, availableDecks } = useDeckPreferences(DEFAULT_DECKS);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setUserPseudo(data.user.name);
      }
    };

    void getUserData();
  }, []);

  const handleProfileClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      router.push(`/profile/${data.user.name}`);
      return;
    }

    router.push("/not-connected");
  };

  return (
    <AppPageShell containerClassName="w-full max-w-[92rem] flex-col px-0 py-0">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {showNotification && <NotificationToast onClose={() => setShowNotification(false)} />}

        <header className="relative z-20 flex items-start justify-between px-6 pt-6 sm:px-10">
          <div className="flex items-center gap-3">
            <Link
              href="/decks"
              className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg transition-colors hover:bg-[#302a45]"
            >
              <i className="fa-solid fa-box-archive text-2xl text-white" />
            </Link>

            <Link
              href="/social"
              className="relative flex h-16 w-16 items-center justify-center rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg transition-colors hover:bg-[#302a45]"
            >
              <i className="fa-regular fa-comment-dots text-2xl text-white" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                1
              </span>
            </Link>

            <a
              href="#"
              onClick={handleProfileClick}
              className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg transition-colors hover:bg-[#302a45]"
            >
              <i className="fa-solid fa-user-gear text-2xl text-white" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image
              src={avatar}
              alt="Avatar"
              width={220}
              height={220}
              className="h-auto w-[170px] rounded-3xl border-2 border-[color:var(--accent-border)] object-cover shadow-2xl sm:w-[220px]"
              priority
              unoptimized
            />
            <a
              href="#"
              onClick={handleProfileClick}
              className="rounded-lg border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-6 py-2 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              {userPseudo || "Pseudo"}
            </a>
          </div>
        </header>

        <div className="relative z-20 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10">
          <PlayCta onPlay={() => setShowPopup(true)} />

          <div className="w-full max-w-[22rem]">
            <DeckSelector
              selectedDeck={selectedDeck}
              availableDecks={availableDecks}
              deckIcons={DECK_ICONS}
              onSelectDeck={setSelectedDeck}
            />
          </div>
        </div>
      </div>

      <MatchmakingModal open={showPopup} onClose={() => setShowPopup(false)} />
    </AppPageShell>
  );
}


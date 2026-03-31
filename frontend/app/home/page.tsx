"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import DeckSelector from "@/components/organisms/home/DeckSelector";
import MatchmakingModal from "@/components/organisms/home/MatchmakingModal";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import PlayCta from "@/components/organisms/home/PlayCta";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import { DEFAULT_DECKS, DECK_ICONS, useDeckPreferences } from "@/hooks/useDeckPreferences";
import Button from "@/components/atoms/Button";
import { useAvatarPreference } from "@/hooks/useAvatarPreference";

// Page principale: navigation rapide, lancement de partie et sélection de deck
export default function Home() {

  const router = useRouter();
  // États UI de la page
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

  useEffect(() => {
    if (selectedDeck) {
      localStorage.setItem("selectedDeck", selectedDeck);
    }
  }, [selectedDeck]);

  // Gère la fermeture du menu deck au clic extérieur / touche Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deckMenuRef.current && !deckMenuRef.current.contains(event.target as Node)) {
        setShowDeckDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDeckDropdown(false);
      }
    };

    document.addEventListener("keydown", handleEscapeModal);
    return () => {
      document.removeEventListener("keydown", handleEscapeModal);
    };
  }, []);
  
  // Redirige vers la page profil réelle de l'utilisateur connecté
  const handleProfileClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      router.push(`/profile/${data.user.name}`);
    } else {
      router.push("/not-connected");
    }
  };
  return (
    <AppPageShell containerClassName="w-full max-w-[92rem] flex-col px-0 py-0">
      {/* Animations locales de notification et loader */}
      <style jsx>{`
        @keyframes dot-pulse {
          0%, 20% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .dot-1 {
          animation: dot-pulse 1.4s infinite 0s;
        }
        .dot-2 {
          animation: dot-pulse 1.4s infinite 0.2s;
        }
        .dot-3 {
          animation: dot-pulse 1.4s infinite 0.4s;
        }
      `}</style>

  const handleProfileClick = async () => {
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      router.push(`/profile/${data.user.name}`);
    } else {
      router.push("/not-connected");
    }
  };

          {/* Decks Icon */}
          <Link href="/decks" className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg">
            <i className="fa-solid fa-box-archive text-white text-2xl"></i>
          </Link>
          
          {/* Social/Chat Icon with notification */}
          <Link href="/social" className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg relative">
            <i className="fa-regular fa-comment-dots text-white text-2xl"></i>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
          </Link>
          
          {/* Settings Icon */}
          <a href="#" onClick={handleProfileClick} className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg">
            <i className="fa-solid fa-user-gear text-white text-2xl"></i>
          </a>
        </div>
      </header>

          </div>
          {/* Right Side */}
          <div className="flex-1 min-h-full flex items-center left-30 justify-end relative pointer-events-auto">
            <div className="relative z-10 flex flex-col items-center gap-4 mr-8">
              <Image
                src={avatar}
                alt="Avatar"
                width={360}
                height={360}
                className="h-auto w-[240px] max-w-[58%] rounded-3xl border-2 border-[color:var(--accent-border)] object-cover drop-shadow-2xl"
                priority
                unoptimized
              />
              <div className="bg-[var(--accent-color)] bg-opacity-75 bg-gradient-to-r px-8 py-3 border-3 border-[color:var(--accent-border)] rounded-lg shadow-lg hover:scale-110 transition-all cursor-pointer">
                <a href="#" onClick={handleProfileClick} className="text-white font-bold text-lg hover:text-gray-200">{userPseudo || "Pseudo"}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Play Button */}
        <div className="relative z-20 flex flex-col items-center justify-center gap-6">
          <div
            className="bg-black p-0.5 shadow-2xl transform-gpu transition-transform origin-center hover:scale-105"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <div
              className="bg-[#ffdb4c] p-2"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <button
                onClick={() => setShowPopup(true)}
                className="w-80 h-90 bg-[#ffdb4c] text-[#fff46d] font-black text-7xl italic uppercase tracking-wide flex items-center justify-center"
                style={{ 
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  WebkitTextStroke: '1px black'
                }}
              >
                Play
              </button>
            </div>
          </div>
          
          {/* Sélecteur de deck utilisé pour la prochaine partie */}
          <div ref={deckMenuRef} className="relative w-[18rem]">
            <button
              onClick={() => setShowDeckDropdown(!showDeckDropdown)}
              className="flex h-16 w-full items-center gap-3 rounded-2xl border border-[#3c3650] bg-[#15131d]/90 px-3 text-white shadow-xl transition-colors hover:bg-[#211d2e]"
              aria-haspopup="listbox"
              aria-expanded={showDeckDropdown}
            >
              {userPseudo || "Username"}
            </Button>
          </div>
        </div>
      </div>

      <MatchmakingModal open={showPopup} onClose={() => setShowPopup(false)} />
    </AppPageShell>
  );
}


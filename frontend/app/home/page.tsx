"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";

const deckpublic: Record<string, string> = {
  "Flygon": "/decks/flygon-icon.png",
  "Ceruledge": "/decks/ceruledge-icon.png",
  "Toxtricity": "/decks/toxtricity-icon.png",
  "Zacian": "/decks/zacian-icon.png",
};

const defaultDecks = ["Flygon", "Ceruledge", "Toxtricity", "Zacian"];

const getInitialDeckState = () => {
  if (typeof window === "undefined") {
    return { availableDecks: defaultDecks, selectedDeck: "Flygon" };
  }

  const savedDecksRaw = localStorage.getItem("decks");
  const savedSelectedDeck = localStorage.getItem("selectedDeck");

  if (!savedDecksRaw) {
    return {
      availableDecks: defaultDecks,
      selectedDeck: savedSelectedDeck && defaultDecks.includes(savedSelectedDeck) ? savedSelectedDeck : "Flygon",
    };
  }

  const parsedDecks = JSON.parse(savedDecksRaw) as Record<string, { cards: Array<unknown> }>;
  const deckNames = Object.keys(parsedDecks);

  if (deckNames.length === 0) {
    return { availableDecks: [], selectedDeck: "" };
  }

  if (savedSelectedDeck && deckNames.includes(savedSelectedDeck)) {
    return { availableDecks: deckNames, selectedDeck: savedSelectedDeck };
  }

  return { availableDecks: deckNames, selectedDeck: deckNames[0] };
};

// Page principale: navigation rapide, lancement de partie et sélection de deck
export default function Home() {
  const router = useRouter();
  // États UI de la page
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState("Flygon");
  const [availableDecks, setAvailableDecks] = useState<string[]>(defaultDecks);
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(DEFAULT_PROFILE_ICON.url);
  const deckMenuRef = useRef<HTMLDivElement | null>(null);

  // Récupère le pseudo de la session pour l'afficher sur la home
  useEffect(() => {
    // Sync avatar and deck state from localStorage after hydration
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) setAvatar(savedAvatar);

    const nextState = getInitialDeckState();
    setAvailableDecks(nextState.availableDecks);
    setSelectedDeck(nextState.selectedDeck);

    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setUserPseudo(data.user.name);
      }
    };
    getUserData();

    // Écoute les changements de localStorage (entre onglets ou après modification)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "avatar" && event.newValue) {
        setAvatar(event.newValue);
      }

      if (event.key === "decks" || event.key === "selectedDeck") {
        const nextState = getInitialDeckState();
        setAvailableDecks(nextState.availableDecks);
        setSelectedDeck(nextState.selectedDeck);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const handleEscapeModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowPopup(false);
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
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1 flex-col">
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
            transform: translateX(100%);
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

      {/* Notification */}
      {showNotification && (
        <div className="absolute right-4 top-4 z-30 animate-slide-in">
          <div className="w-[min(380px,92vw)] overflow-hidden rounded-2xl border-2 border-[color:var(--accent-border)] shadow-2xl">
            {/* Top part - Violet */}
            <div className="bg-[var(--accent-color)] px-3  flex items-center justify-between">
              <div className="text-white font-bold text-base">@sunmiaou</div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white hover:text-gray-200 transition-colors text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            {/* Separator line */}
            <div className="w-full h-[2px] bg-black"></div>
            {/* Bottom part - Black */}
            <div className="bg-black px-4 py-4">
              <div className="text-white text-sm leading-tight">Viens sur mon ile, j&apos;ai pleins de petites filles a te donner</div>
            </div>
          </div>
        </div>
      )}

      {/* Zone centrale (CTA Play + sélecteur deck) */}
      <div className="relative z-10 flex min-h-0 flex-1 w-full items-center justify-center">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-2 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden lg:block" />

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
                className="flex h-80 w-72 items-center justify-center bg-[#ffdb4c] text-6xl font-black italic uppercase tracking-wide text-[#fff46d] sm:h-96 sm:w-80 sm:text-7xl"
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
              <div className="flex h-12 w-12 items-center justify-center">
                <Image
                  src={deckpublic[selectedDeck] || deckpublic.Flygon}
                  alt={selectedDeck}
                  width={52}
                  height={52}
                  className="h-12 w-12 object-contain transition-all"
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'brightness(1) contrast(1.5) saturate(1)'
                  }}
                  priority
                />
              </div>
              <div className="flex flex-1 flex-col items-start leading-tight">
                <span className="text-xs uppercase tracking-[0.14em] text-gray-400">Deck sélectionné</span>
                <span className="text-lg font-bold text-white">{selectedDeck || "Aucun deck"}</span>
              </div>
              <svg
                className={`h-5 w-5 text-gray-300 transition-transform ${showDeckDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDeckDropdown && (
              <div className="absolute top-[calc(100%+0.55rem)] z-30 w-full rounded-2xl border border-[#3c3650] bg-[#15131d] p-2 shadow-2xl">
                {availableDecks.map((deck) => (
                  <button
                    key={deck}
                    onClick={() => {
                      setSelectedDeck(deck);
                      setShowDeckDropdown(false);
                    }}
                    role="option"
                    aria-selected={selectedDeck === deck}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      selectedDeck === deck
                        ? "bg-[var(--accent-soft)] text-white"
                        : "text-gray-200 hover:bg-[#242033]"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center">
                      <Image
                        src={deckpublic[deck] || deckpublic.Flygon}
                        alt={deck}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <span className="flex-1 font-semibold text-base">{deck}</span>
                    {selectedDeck === deck && <i className="fa-solid fa-check text-[var(--accent-color)]"></i>}
                  </button>
                ))}
                {availableDecks.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">Aucun deck disponible</div>
                )}
              </div>
            )}
          </div>

          </div>

          <div className="relative z-20 flex flex-col items-center justify-center gap-4 lg:items-end">
            <Image
              src={avatar}
              alt="Avatar"
              width={320}
              height={320}
              className="h-auto w-[220px] rounded-3xl border-2 border-[color:var(--accent-border)] object-cover drop-shadow-2xl sm:w-[240px]"
              priority
              unoptimized
            />
            <div className="cursor-pointer rounded-lg border-2 border-[color:var(--accent-border)] bg-[var(--accent-color)] px-8 py-3 shadow-lg transition-all hover:scale-105">
              <a href="#" onClick={handleProfileClick} className="text-lg font-bold text-white hover:text-gray-200">
                {userPseudo || "Pseudo"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-300 to-gray-200 p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
                En recherche de joueur
                <span className="dot-1">.</span>
                <span className="dot-2">.</span>
                <span className="dot-3">.</span>
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-500 text-gray-800 font-bold text-lg py-3 px-4 rounded-lg hover:scale-105 transition-transform uppercase"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </AppPageShell>
  );
}


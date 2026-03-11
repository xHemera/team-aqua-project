"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";


const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";

const deckpublic: Record<string, string> = {
  "Flygon": "/decks/flygon-icon.png",
  "Ceruledge": "/decks/ceruledge-icon.png",
  "Toxtricity": "/decks/toxtricity-icon.png",
  "Zacian": "/decks/zacian-icon.png",
};

const defaultDecks = ["Flygon", "Ceruledge", "Toxtricity", "Zacian"];

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
  const [avatar, setAvatar] = useState(alder);
  const deckMenuRef = useRef<HTMLDivElement | null>(null);

  const loadDecksFromStorage = () => {
    const savedDecksRaw = localStorage.getItem("decks");
    const savedSelectedDeck = localStorage.getItem("selectedDeck");

    if (!savedDecksRaw) {
      setAvailableDecks(defaultDecks);
      setSelectedDeck(savedSelectedDeck && defaultDecks.includes(savedSelectedDeck) ? savedSelectedDeck : "Flygon");
      return;
    }

    const parsedDecks = JSON.parse(savedDecksRaw) as Record<string, { cards: Array<unknown> }>;
    const deckNames = Object.keys(parsedDecks);

    if (deckNames.length === 0) {
      setAvailableDecks([]);
      setSelectedDeck("");
      return;
    }

    setAvailableDecks(deckNames);

    if (savedSelectedDeck && deckNames.includes(savedSelectedDeck)) {
      setSelectedDeck(savedSelectedDeck);
      return;
    }

    setSelectedDeck(deckNames[0]);
  };
  
  // Récupère le pseudo de la session pour l'afficher sur la home
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setUserPseudo(data.user.name);
      }
    };
    getUserData();

    // Charge l'avatar depuis localStorage
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }

    loadDecksFromStorage();

    // Écoute les changements de localStorage (entre onglets ou après modification)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "avatar" && event.newValue) {
        setAvatar(event.newValue);
      }

      if (event.key === "decks" || event.key === "selectedDeck") {
        loadDecksFromStorage();
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
    <div className="relative isolate min-h-screen overflow-hidden text-white">
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
      
      {/* Fond global */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "var(--site-bg-image)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px)",
            transform: "scale(1.08)",
          }}
        />
        <div className="absolute inset-0 z-[1] bg-black/25" />
      </div>

      {/* Notification Bar - Top Left */}
      {showNotification && (
        <div className="fixed top-4 left-4 z-50 animate-slide-in">
          <div className="rounded-2xl shadow-2xl border-2 border-[#a99bff] overflow-hidden w-[380px] max-w-[90vw]">
            {/* Top part - Violet */}
            <div className="bg-[#8e82ff] px-3  flex items-center justify-between">
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
              <div className="text-white text-sm leading-tight">Je viens faire 15h de logtime</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-[92rem] items-center justify-end px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex gap-4 rounded-2xl border border-[#3c3650] bg-[#15131d]/85 px-4 py-3 shadow-2xl backdrop-blur-md">
          {/* Decks Icon */}
          <a href="/decks" className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg">
            <i className="fa-solid fa-box-archive text-white text-2xl"></i>
          </a>
          
          {/* Social/Chat Icon with notification */}
          <a href="/social" className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg relative">
            <i className="fa-regular fa-comment-dots text-white text-2xl"></i>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
          </a>
          
          {/* Settings Icon */}
          <a href="#" onClick={handleProfileClick} className="w-16 h-16 bg-[#242033] rounded-xl flex items-center justify-center border border-[#3c3650] hover:bg-[#302a45] transition-colors shadow-lg">
            <i className="fa-solid fa-user-gear text-white text-2xl"></i>
          </a>
        </div>
      </header>

      {/* Zone centrale (CTA Play + sélecteur deck) */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-116px)] w-full max-w-[92rem] flex-1 items-center justify-center px-4 pb-4 sm:px-8 sm:pb-6">
        
        <div className="absolute inset-0 flex pointer-events-none">
          {/* Left Side - Illustration */}
          <div className="flex-1 min-h-full flex items-center justify-center p-8 relative">
          </div>

          {/* Right Side */}
          <div className="flex-1 min-h-full flex items-center left-30 justify-end relative pointer-events-auto">
            <div className="relative z-10 flex flex-col items-center gap-4 mr-8">
              <Image
                src={avatar}
                alt="Avatar"
                width={360}
                height={360}
                className="w-250 max-w-[60%] h-auto drop-shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
                priority
              />
              <div className="bg-[#8e82ff] bg-opacity-75 bg-gradient-to-r px-8 py-3 border-3 border-[#a99bff] rounded-lg shadow-lg hover:bg-opacity-90 hover:scale-110 transition-all cursor-pointer">
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
              <div className="absolute bottom-[calc(100%+0.55rem)] z-30 w-full rounded-2xl border border-[#3c3650] bg-[#15131d] p-2 shadow-2xl">
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
                        ? "bg-[#8e82ff]/25 text-white"
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
                    {selectedDeck === deck && <i className="fa-solid fa-check text-[#b4a8ff]"></i>}
                  </button>
                ))}
                {availableDecks.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">Aucun deck disponible</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}


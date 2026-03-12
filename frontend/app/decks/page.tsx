"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";

const deckImages: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

type Card = {
  id: string;
  name: string;
  count: number;
  imageExists?: boolean;
};

type DeckData = {
  cards: Card[];
};

const cardFileBases = [
  "absol",
  "alcremie",
  "brock's_scouting",
  "ceruledge",
  "charcadet",
  "darkness_energy",
  "dawn",
  "drayton",
  "dusk_ball",
  "energy_recycler",
  "energy_retrieval",
  "fighting_energy",
  "fighting_gong",
  "fire_energy",
  "firebreather",
  "flygon",
  "gligar",
  "gliscor",
  "grimsley's_move",
  "hilda",
  "iris's_fighting_spirit",
  "krokorok",
  "krookodile",
  "lillie's_determination",
  "milcery",
  "mimikyu",
  "moltres",
  "premium_power_pro",
  "psychic_energy",
  "rare_candy",
  "sandile",
  "switch",
  "toxel",
  "toxtricity",
  "trapinch",
  "ultra_ball",
  "vibrava",
  "wondrous_patch",
  "zacian",
] as const;

// Fonction pour normaliser le nom de la carte en nom de fichier
const normalizeCardName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\.png$/i, "") // Supprimer .png s'il est présent
    .replace(/\s+/g, "_");
};

const canonicalizeCardName = (name: string): string => {
  return normalizeCardName(name)
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9_]/g, "");
};

const cardNameMap: Record<string, string> = Object.fromEntries(
  cardFileBases.map((base) => [canonicalizeCardName(base), base])
);

const resolveCardFilename = (name: string): string => {
  return cardNameMap[canonicalizeCardName(name)] || normalizeCardName(name);
};

const isValidCardName = (name: string): boolean => {
  return Boolean(cardNameMap[canonicalizeCardName(name)]);
};

// Page des decks
export default function DecksPage() {
  const router = useRouter();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<{ name: string; filename: string } | null>(null);
  const [decks, setDecks] = useState<Record<string, DeckData>>({});
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [deckList, setDeckList] = useState<Array<{ name: string; icon: string }>>([
    { name: "Flygon", icon: deckImages.Flygon },
    { name: "Ceruledge", icon: deckImages.Ceruledge },
    { name: "Toxtricity", icon: deckImages.Toxtricity },
    { name: "Zacian", icon: deckImages.Zacian },
  ]);
  const [newCardName, setNewCardName] = useState("");
  const [cardError, setCardError] = useState("");
  const [invalidCards, setInvalidCards] = useState<Set<string>>(new Set());
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [deckNameDraft, setDeckNameDraft] = useState("");
  const [deckNameError, setDeckNameError] = useState("");

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
    if (socket.connected) return;
    socket.connect()
    socket.emit("login", userPseudo);
    socket.on("online_users", (users) => {
      console.log("Users from Redis:", users);
    });
  });

  const getDeckIcon = (deckName: string) => {
    return deckImages[deckName] || deckImages.Flygon;
  };

  // Charger les decks depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("decks");
    if (saved) {
      const parsedDecks: Record<string, DeckData> = JSON.parse(saved);
      setDecks(parsedDecks);

      const savedDeckNames = Object.keys(parsedDecks);
      if (savedDeckNames.length > 0) {
        setDeckList(
          savedDeckNames.map((name) => ({
            name,
            icon: getDeckIcon(name),
          }))
        );
      }
    } else {
      // Initialiser les decks vides
      const newDecks: Record<string, DeckData> = {};
      deckList.forEach((deck) => {
        newDecks[deck.name] = { cards: [] };
      });
      setDecks(newDecks);
    }
  }, []);

  // Sauvegarder les decks dans localStorage
  const saveDeck = (deckName: string, data: DeckData) => {
    const updated = { ...decks, [deckName]: data };
    setDecks(updated);
    localStorage.setItem("decks", JSON.stringify(updated));
  };

  const getTotalCards = (deckName: string) => {
    return decks[deckName]?.cards.reduce((sum, card) => sum + card.count, 0) || 0;
  };

  const addCard = (deckName: string) => {
    if (!newCardName.trim()) return;

    if (!isValidCardName(newCardName)) {
      setCardError("Cette carte n'existe pas");
      return;
    }

    setCardError("");

    const currentDeck = decks[deckName] || { cards: [] };
    const total = getTotalCards(deckName);

    if (total >= 60) {
      alert("Deck is full! Maximum 60 cards.");
      return;
    }

    const existingCard = currentDeck.cards.find(
      (card) => card.name.toLowerCase() === newCardName.toLowerCase()
    );

    if (existingCard) {
      if (total + 1 > 60) {
        alert("Cannot exceed 60 cards!");
        return;
      }
      existingCard.count += 1;
    } else {
      currentDeck.cards.push({
        id: `${Date.now()}-${Math.random()}`,
        name: newCardName,
        count: 1,
      });
    }

    saveDeck(deckName, currentDeck);
    setNewCardName("");
  };

  const removeCard = (deckName: string, cardId: string) => {
    const currentDeck = decks[deckName];
    const cardIndex = currentDeck.cards.findIndex((card) => card.id === cardId);

    if (cardIndex !== -1) {
      if (currentDeck.cards[cardIndex].count > 1) {
        currentDeck.cards[cardIndex].count -= 1;
      } else {
        currentDeck.cards.splice(cardIndex, 1);
      }
      saveDeck(deckName, currentDeck);
    }
  };

  const incrementCard = (deckName: string, cardId: string) => {
    const currentDeck = decks[deckName];
    if (!currentDeck) return;

    const total = getTotalCards(deckName);
    if (total >= 60) {
      alert("Deck is full! Maximum 60 cards.");
      return;
    }

    const card = currentDeck.cards.find((item) => item.id === cardId);
    if (!card) return;

    card.count += 1;
    saveDeck(deckName, currentDeck);
  };

  const addNewDeck = () => {
    let index = 1;
    let deckName = `New Deck ${index}`;

    while (decks[deckName]) {
      index += 1;
      deckName = `New Deck ${index}`;
    }

    const updatedDecks = { ...decks, [deckName]: { cards: [] } };
    setDecks(updatedDecks);
    localStorage.setItem("decks", JSON.stringify(updatedDecks));

    setDeckList((prev) => [...prev, { name: deckName, icon: deckImages.Flygon }]);
  };

  const openDeckPopup = (deckName: string) => {
    setSelectedDeck(deckName);
    setIsRenamingDeck(false);
    setDeckNameDraft(deckName);
    setDeckNameError("");
  };

  const closeDeckPopup = () => {
    setSelectedDeck(null);
    setIsRenamingDeck(false);
    setDeckNameDraft("");
    setDeckNameError("");
  };

  const renameSelectedDeck = () => {
    if (!selectedDeck) return;

    const nextName = deckNameDraft.trim();
    if (!nextName) {
      setDeckNameError("Le nom du deck ne peut pas être vide");
      return;
    }

    if (nextName === selectedDeck) {
      setIsRenamingDeck(false);
      setDeckNameError("");
      return;
    }

    if (decks[nextName]) {
      setDeckNameError("Un deck avec ce nom existe déjà");
      return;
    }

    const previousName = selectedDeck;
    const updatedDecks = { ...decks };
    updatedDecks[nextName] = updatedDecks[previousName];
    delete updatedDecks[previousName];

    setDecks(updatedDecks);
    localStorage.setItem("decks", JSON.stringify(updatedDecks));

    setDeckList((prev) =>
      prev.map((deck) =>
        deck.name === previousName
          ? {
              ...deck,
              name: nextName,
            }
          : deck
      )
    );

    setSelectedDeck(nextName);
    setIsRenamingDeck(false);
    setDeckNameError("");
  };

  const deleteSelectedDeck = () => {
    if (!selectedDeck) return;

    const shouldDelete = window.confirm(`Supprimer le deck \"${selectedDeck}\" ?`);
    if (!shouldDelete) return;

    const updatedDecks = { ...decks };
    delete updatedDecks[selectedDeck];

    setDecks(updatedDecks);
    localStorage.setItem("decks", JSON.stringify(updatedDecks));

    setDeckList((prev) => prev.filter((deck) => deck.name !== selectedDeck));
    closeDeckPopup();
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Fond global */}
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/home")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-500/80 bg-gray-700/80 text-white shadow-lg transition-colors hover:bg-gray-600"
              aria-label="Retour à l'accueil"
            >
              <i className="fa-solid fa-house"></i>
            </button>
            <button
              onClick={() => router.push("/social")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#b4a8ff]/60 bg-[#1f1b2d]/90 text-white shadow-lg transition-colors hover:bg-[#2b2540]"
              aria-label="Aller au social"
            >
              <i className="fa-regular fa-comment-dots"></i>
            </button>
          </div>
        </header>

        <section className="flex-1 rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">My Decks</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {deckList.map((deck) => (
                <button
                  key={deck.name}
                  onClick={() => openDeckPopup(deck.name)}
                  className="group relative overflow-hidden rounded-2xl border border-[#3c3650] bg-[#242033] p-6 transition-all hover:border-[#8e82ff]/60 hover:bg-[#302a45]"
                >
                  <div className="mb-4 flex items-center justify-center">
                    <Image
                      src={deck.icon}
                      alt={deck.name}
                      width={90}
                      height={90}
                      className="h-25 w-25 object-contain group-hover:scale-110 transition-transform"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <p className="text-center text-lg font-semibold text-white group-hover:text-[#b4a8ff]">
                    {deck.name}
                  </p>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    {getTotalCards(deck.name)}/60
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <button
          onClick={addNewDeck}
          className="fixed bottom-6 right-4 z-20 inline-flex h-14 items-center gap-3 rounded-full border border-[#b4a8ff]/60 bg-[#8e82ff] px-5 text-base font-semibold text-white shadow-2xl transition-colors hover:bg-[#7d71ec] sm:bottom-8 sm:right-8"
        >
          <i className="fa-solid fa-plus text-lg"></i>
          New
        </button>
      </div>

      {/* Popup du deck */}
      {selectedDeck && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeDeckPopup}
        >
          <div
            className="w-full max-w-7xl rounded-3xl border border-[#3c3650] bg-[#15131d] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3c3650] px-6 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {isRenamingDeck ? (
                  <div className="flex w-full max-w-md items-center gap-2">
                    <input
                      type="text"
                      value={deckNameDraft}
                      onChange={(e) => {
                        setDeckNameDraft(e.target.value);
                        if (deckNameError) setDeckNameError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameSelectedDeck();
                        if (e.key === "Escape") {
                          setIsRenamingDeck(false);
                          setDeckNameDraft(selectedDeck);
                          setDeckNameError("");
                        }
                      }}
                      placeholder="Nom du deck"
                      className="w-full rounded-lg border border-[#8e82ff]/60 bg-[#242033] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#b4a8ff] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={renameSelectedDeck}
                      className="rounded-lg border border-emerald-400/70 bg-emerald-500/90 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenamingDeck(false);
                        setDeckNameDraft(selectedDeck);
                        setDeckNameError("");
                      }}
                      className="rounded-lg border border-gray-500/70 bg-gray-700/90 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="truncate text-2xl font-bold text-white">{selectedDeck}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenamingDeck(true);
                        setDeckNameDraft(selectedDeck);
                        setDeckNameError("");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#b4a8ff]/60 bg-[#242033] text-white transition-colors hover:bg-[#302a45]"
                      aria-label="Renommer le deck"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      type="button"
                      onClick={deleteSelectedDeck}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/70 bg-red-500/20 text-red-300 transition-colors hover:bg-red-500/35"
                      aria-label="Supprimer le deck"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={closeDeckPopup}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-4xl font-bold leading-none text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isRenamingDeck && deckNameError && (
              <p className="px-6 pt-3 text-sm text-red-500">{deckNameError}</p>
            )}

            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="mb-6">
                <div className="mb-2 text-sm text-gray-400">
                  Cards: {getTotalCards(selectedDeck)}/60
                </div>
              </div>

              {/* Affichage en grille des cartes */}
              {decks[selectedDeck]?.cards.length > 0 ? (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {decks[selectedDeck]?.cards.map((card) => {
                      const normalized = resolveCardFilename(card.name);
                      const hasError = invalidCards.has(card.id);
                      return (
                        <div
                          key={card.id}
                          className="relative group"
                        >
                          <div className="relative overflow-hidden rounded-lg border border-[#3c3650] bg-[#242033] aspect-[2.5/3.5] hover:border-[#8e82ff]/60 transition-all">
                            {/* Image de la carte */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasError) {
                                  setPreviewCard({ name: card.name, filename: normalized });
                                }
                              }}
                              className="w-full h-full bg-gradient-to-br from-[#8e82ff]/20 to-[#3c3650] flex items-center justify-center relative overflow-hidden"
                            >
                              {hasError ? (
                                <p className="text-xs text-red-500 text-center p-2">Cette carte n'existe pas</p>
                              ) : (
                                <img
                                  src={`/cards/${encodeURIComponent(normalized)}.png`}
                                  alt={card.name}
                                  className="w-full h-full object-cover"
                                  onError={() => {
                                    setInvalidCards(prev => new Set([...prev, card.id]));
                                  }}
                                />
                              )}
                            </button>
                            
                            {/* Badge de quantité (polygone bas-centre) */}
                            <div
                              className="absolute bottom-1 left-1/2 z-20 flex h-10 w-14 -translate-x-1/2 items-center justify-center border border-[#b4a8ff]/80 bg-gradient-to-br from-[#8e82ff] to-[#5e54d6] text-base font-bold text-white shadow-lg"
                              style={{ clipPath: "polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)" }}
                            >
                              {card.count}
                            </div>

                            {/* Contrôles + / - */}
                            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => removeCard(selectedDeck, card.id)}
                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/70 bg-red-500/90 text-3xl font-black leading-none text-white transition-colors hover:bg-red-600"
                                aria-label={`Retirer une copie de ${card.name}`}
                              >
                                −
                              </button>
                              <button
                                type="button"
                                onClick={() => incrementCard(selectedDeck, card.id)}
                                disabled={getTotalCards(selectedDeck) >= 60}
                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/70 bg-emerald-500/90 text-3xl font-black leading-none text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Ajouter une copie de ${card.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucune carte dans ce deck</p>
                </div>
              )}

              {/* Ajouter une carte */}
              <div className="border-t border-[#3c3650] pt-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => {
                      setNewCardName(e.target.value);
                      if (cardError) setCardError("");
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addCard(selectedDeck);
                      }
                    }}
                    placeholder="Nom de la carte..."
                    className="flex-1 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#8e82ff] focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => addCard(selectedDeck)}
                    disabled={getTotalCards(selectedDeck) >= 60}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#8e82ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#7d71ec] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-plus"></i>
                    Add
                  </button>
                </div>
                {cardError && <p className="text-xs text-red-500 mt-1">{cardError}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewCard && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewCard(null)}
        >
          <img
            src={`/cards/${encodeURIComponent(previewCard.filename)}.png`}
            alt={previewCard.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
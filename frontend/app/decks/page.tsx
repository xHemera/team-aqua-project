"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import AppPageShell from "@/components/AppPageShell";

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
  id: string;
  title: string;
  image?: string | null;
  cards: Card[];
};

type DecksResponse = {
  decks: DeckData[];
};

const cardFileBases = [
  "absol",
  "alcremie",
  "brock_scouting",
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
  "grimsley_move",
  "hilda",
  "iris_fighting_spirit",
  "krokorok",
  "krookodile",
  "lillie_determination",
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
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<{ name: string; filename: string } | null>(null);
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [newCardName, setNewCardName] = useState("");
  const [cardError, setCardError] = useState("");
  const [invalidCards, setInvalidCards] = useState<Set<string>>(new Set());
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [deckNameDraft, setDeckNameDraft] = useState("");
  const [deckNameError, setDeckNameError] = useState("");
  const [userPseudo, setUserPseudo] = useState<string | null>(null);

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? null;

  const fetchDecks = async () => {
    const response = await fetch("/api/decks", {
      method: "GET",
      cache: "no-store",
    });

    const data: unknown = await response.json();
    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error?: string }).error ?? "Impossible de charger les decks")
          : "Impossible de charger les decks";
      throw new Error(errorMessage);
    }

    const parsed = data as DecksResponse;
    setDecks(parsed.decks);
  };

  useEffect(() => {
    if (!previewCard) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewCard(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewCard]);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
      {
        setUserPseudo(data.user.name);
      };
    };
    void getUserData();
  }, []);

  useEffect(() => {
    const loadDecks = async () => {
      try {
        await fetchDecks();
      } catch (error) {
        console.error("Error loading decks:", error);
      }
    };

    void loadDecks();
  }, []);

  useEffect(() => {
    if (!userPseudo) return;
    if (!socket.connected) {
      socket.connect();
    }

    const handleOnlineUsers = (users: string[]) => {
      console.log("Users from Redis:", users);
    };

    socket.emit("login", userPseudo);
    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("online_users", handleOnlineUsers);
    };
  }, [userPseudo]);

  const getTotalCards = (deckId: string) => {
    const deck = decks.find((item) => item.id === deckId);
    return deck?.cards.reduce((sum, card) => sum + card.count, 0) || 0;
  };

  const addCard = async (deckId: string) => {
    if (!newCardName.trim()) return;

    if (!isValidCardName(newCardName)) {
      setCardError("Cette carte n'existe pas");
      return;
    }

    setCardError("");

    try {
      const response = await fetch("/api/decks/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          cardName: newCardName,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || "Impossible d'ajouter la carte");
        return;
      }

      setNewCardName("");
      await fetchDecks();
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Impossible d'ajouter la carte");
    }
  };

  const removeCard = async (deckId: string, cardId: string) => {
    try {
      const response = await fetch("/api/decks/cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          cardId,
          action: "decrement",
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || "Impossible de retirer la carte");
        return;
      }

      await fetchDecks();
    } catch (error) {
      console.error("Error removing card:", error);
      alert("Impossible de retirer la carte");
    }
  };

  const incrementCard = async (deckId: string, cardId: string) => {
    try {
      const response = await fetch("/api/decks/cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          cardId,
          action: "increment",
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || "Impossible d'ajouter la carte");
        return;
      }

      await fetchDecks();
    } catch (error) {
      console.error("Error incrementing card:", error);
      alert("Impossible d'ajouter la carte");
    }
  };

  const addNewDeck = async () => {
    let index = 1;
    let deckName = `New Deck ${index}`;

    const existingNames = new Set(decks.map((deck) => deck.title));

    while (existingNames.has(deckName)) {
      index += 1;
      deckName = `New Deck ${index}`;
    }

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: deckName }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || "Impossible de créer le deck");
        return;
      }

      await fetchDecks();
    } catch (error) {
      console.error("Error creating deck:", error);
      alert("Impossible de créer le deck");
    }
  };

  const openDeckPopup = (deck: DeckData) => {
    setSelectedDeckId(deck.id);
    setIsRenamingDeck(false);
    setDeckNameDraft(deck.title);
    setDeckNameError("");
  };

  const closeDeckPopup = () => {
    setSelectedDeckId(null);
    setIsRenamingDeck(false);
    setDeckNameDraft("");
    setDeckNameError("");
  };

  const renameSelectedDeck = async () => {
    if (!selectedDeck) return;

    const nextName = deckNameDraft.trim();
    if (!nextName) {
      setDeckNameError("Le nom du deck ne peut pas être vide");
      return;
    }

    if (nextName === selectedDeck.title) {
      setIsRenamingDeck(false);
      setDeckNameError("");
      return;
    }

    const nameAlreadyUsed = decks.some((deck) => deck.title === nextName);
    if (nameAlreadyUsed) {
      setDeckNameError("Un deck avec ce nom existe déjà");
      return;
    }

    try {
      const response = await fetch("/api/decks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId: selectedDeck.id,
          name: nextName,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setDeckNameError(data.error || "Impossible de renommer le deck");
        return;
      }

      await fetchDecks();
      setIsRenamingDeck(false);
      setDeckNameError("");
    } catch (error) {
      console.error("Error renaming deck:", error);
      setDeckNameError("Impossible de renommer le deck");
    }
  };

  const deleteSelectedDeck = async () => {
    if (!selectedDeck) return;

    const shouldDelete = window.confirm(`Supprimer le deck \"${selectedDeck.title}\" ?`);
    if (!shouldDelete) return;

    try {
      const response = await fetch("/api/decks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId: selectedDeck.id,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || "Impossible de supprimer le deck");
        return;
      }

      await fetchDecks();
      closeDeckPopup();
    } catch (error) {
      console.error("Error deleting deck:", error);
      alert("Impossible de supprimer le deck");
    }
  };

  return (
    <AppPageShell containerClassName="max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8">
      <div className="w-full">
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
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--accent-border)] bg-[#1f1b2d]/90 text-white shadow-lg transition-colors hover:bg-[#2b2540]"
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
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => openDeckPopup(deck)}
                  className="group relative overflow-hidden rounded-2xl border border-[#3c3650] bg-[#242033] p-6 transition-all hover:border-[color:var(--accent-border)] hover:bg-[#302a45]"
                >
                  <div className="mb-4 flex items-center justify-center">
                    <Image
                      src={deck.image || deckImages[deck.title] || deckImages.Flygon}
                      alt={deck.title}
                      width={90}
                      height={90}
                      className="h-25 w-25 object-contain group-hover:scale-110 transition-transform"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <p className="text-center text-lg font-semibold text-white group-hover:text-[var(--accent-color)]">
                    {deck.title}
                  </p>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    {getTotalCards(deck.id)}/60
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <button
          onClick={addNewDeck}
          className="fixed bottom-6 right-4 z-20 inline-flex h-14 items-center gap-3 rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-5 text-base font-semibold text-white shadow-2xl transition-colors hover:bg-[var(--accent-hover)] sm:bottom-8 sm:right-8"
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
                          setDeckNameDraft(selectedDeck.title);
                          setDeckNameError("");
                        }
                      }}
                      placeholder="Nom du deck"
                      className="w-full rounded-lg border border-[color:var(--accent-border)] bg-[#242033] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[var(--accent-color)] focus:outline-none"
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
                        setDeckNameDraft(selectedDeck.title);
                        setDeckNameError("");
                      }}
                      className="rounded-lg border border-gray-500/70 bg-gray-700/90 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="truncate text-2xl font-bold text-white">{selectedDeck.title}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenamingDeck(true);
                        setDeckNameDraft(selectedDeck.title);
                        setDeckNameError("");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--accent-border)] bg-[#242033] text-white transition-colors hover:bg-[#302a45]"
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
                  Cards: {getTotalCards(selectedDeck.id)}/60
                </div>
              </div>

              {/* Affichage en grille des cartes */}
              {selectedDeck.cards.length > 0 ? (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {selectedDeck.cards.map((card) => {
                      const normalized = resolveCardFilename(card.name);
                      const hasError = invalidCards.has(card.id);
                      return (
                        <div
                          key={card.id}
                          className="relative group"
                        >
                          <div className="relative overflow-hidden rounded-lg border border-[#3c3650] bg-[#242033] aspect-[2.5/3.5] hover:border-[color:var(--accent-border)] transition-all">
                            {/* Image de la carte */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasError) {
                                  setPreviewCard({ name: card.name, filename: normalized });
                                }
                              }}
                              className="w-full h-full bg-gradient-to-br from-[var(--accent-soft)] to-[#3c3650] flex items-center justify-center relative overflow-hidden"
                            >
                              {hasError ? (
                                <p className="text-xs text-red-500 text-center p-2">Cette carte n&apos;existe pas</p>
                              ) : (
                                <Image
                                  src={`/cards/${encodeURIComponent(normalized)}.png`}
                                  alt={card.name}
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    setInvalidCards((prev) => new Set([...prev, card.id]));
                                  }}
                                />
                              )}
                            </button>
                            
                            {/* Badge de quantité (polygone bas-centre) */}
                            <div
                              className="absolute bottom-1 left-1/2 z-20 flex h-10 w-14 -translate-x-1/2 items-center justify-center border border-[color:var(--accent-border)] bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] text-base font-bold text-white shadow-lg"
                              style={{ clipPath: "polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)" }}
                            >
                              {card.count}
                            </div>

                            {/* Contrôles + / - */}
                            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => removeCard(selectedDeck.id, card.id)}
                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/70 bg-red-500/90 text-3xl font-black leading-none text-white transition-colors hover:bg-red-600"
                                aria-label={`Retirer une copie de ${card.name}`}
                              >
                                −
                              </button>
                              <button
                                type="button"
                                onClick={() => incrementCard(selectedDeck.id, card.id)}
                                disabled={getTotalCards(selectedDeck.id) >= 60}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void addCard(selectedDeck.id);
                      }
                    }}
                    placeholder="Nom de la carte..."
                    className="flex-1 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[var(--accent-color)] focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => void addCard(selectedDeck.id)}
                    disabled={getTotalCards(selectedDeck.id) >= 60}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[var(--accent-color)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewCard(null);
            }
          }}
        >
          <Image
            src={`/cards/${encodeURIComponent(previewCard.filename)}.png`}
            alt={previewCard.name}
            width={1000}
            height={1400}
            className="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </AppPageShell>
  );
}
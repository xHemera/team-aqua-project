"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";

// HARDCODE: default deck icon assets until deck metadata is provided by backend.
const deckImages: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

const BLANK_DECK_ICON = "__blank__";

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

const deckIconChoices = [BLANK_DECK_ICON, ...Object.values(deckImages)];
const MAX_NON_ENERGY_COPIES = 4;

/**
 * Objective: normalize card labels into file-friendly identifiers.
 * Usage: shared by card filename resolution and lookup helpers.
 * Input: user-facing card name.
 * Output: normalized lowercase string with underscores.
 * Special cases: strips optional `.png` suffix.
 */
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
  const [availableCardQuery, setAvailableCardQuery] = useState("");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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
    const syncDecksFromStorage = async () => {
      await Promise.resolve();
      const hydratedDeckData = getDeckDataFromStorage();
      setDecks(hydratedDeckData.decks);
      setDeckList(hydratedDeckData.deckList);
      setDeckIcons(hydratedDeckData.deckIcons);
    };

    void syncDecksFromStorage();
  }, []);

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

    const nextDeckIcons = {
      ...deckIcons,
      [deckName]: iconValue,
    };
    persistDeckIcons(nextDeckIcons);
  };

  const getCardCountInDeck = (deckName: string, cardBase: string) => {
    const currentDeck = decks[deckName];
    if (!currentDeck) return 0;

    const card = currentDeck.cards.find((item) => resolveCardFilename(item.name) === cardBase);
    return card?.count || 0;
  };

  /**
   * Objective: add one card copy in a deck while enforcing game limits.
   * Usage: triggered from available-card grid interactions.
   * Input: deck name and user-selected card name.
   * Output: none (state/storage mutation or validation error message).
   * Special cases: validates card existence, 60-card limit, and non-energy copy cap.
   */
  const addCardByName = (deckName: string, cardName: string) => {
    const name = cardName.trim();
    if (!name) return;

    if (!isValidCardName(name)) {
      setCardError("This card does not exist");
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
    setAvailableCardQuery("");
    setIsIconPickerOpen(false);
    setCardError("");
  };

  const closeDeckPopup = () => {
    setSelectedDeckId(null);
    setIsRenamingDeck(false);
    setDeckNameDraft("");
    setDeckNameError("");
    setAvailableCardQuery("");
    setIsIconPickerOpen(false);
    setCardError("");
  };

  const renameSelectedDeck = async () => {
    if (!selectedDeck) return;

    const nextName = deckNameDraft.trim();
    if (!nextName) {
      setDeckNameError("Deck name cannot be empty");
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

  useEffect(() => {
    const handleEscapeModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (previewCard) {
        setPreviewCard(null);
        return;
      }

      if (selectedDeck) {
        closeDeckPopup();
      }
    };

    document.addEventListener("keydown", handleEscapeModal);
    return () => {
      document.removeEventListener("keydown", handleEscapeModal);
    };
  }, [previewCard, selectedDeck]);

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1">
      <div className="relative mx-auto flex h-full w-full max-w-[88rem] flex-col overflow-y-auto pr-1">
        <header className="mb-6 flex items-center justify-between">
        </header>

        <section className="flex-1 rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">My Decks</h2>
            {/* Usage atomique: Button uniforme pour les cartes deck et leurs etats hover/active. */}
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
                </Button>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky bottom-4 z-20 mt-6 flex justify-end pr-1">
          <Button
            onClick={addNewDeck}
            className="h-14 rounded-full px-5 text-base font-semibold shadow-2xl"
          >
            <i className="fa-solid fa-plus text-lg"></i>
            New
          </Button>
        </div>
      </div>

      {/* Deck popup */}
      {selectedDeck && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeDeckPopup}
        >
          <Card
            className="w-full max-w-[96rem] rounded-3xl bg-[#15131d]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3c3650] px-6 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {isRenamingDeck ? (
                  <div className="flex w-full max-w-md items-center gap-2">
                    <Input
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
                      placeholder="Deck name"
                      className="rounded-lg py-2"
                    />
                    <Button
                      type="button"
                      onClick={renameSelectedDeck}
                      className="h-10 rounded-lg border-emerald-400/70 bg-emerald-500/90 px-3 py-2 text-sm font-medium hover:bg-emerald-600"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsRenamingDeck(false);
                        setDeckNameDraft(selectedDeck.title);
                        setDeckNameError("");
                      }}
                      className="h-10 rounded-lg border-gray-500/70 bg-gray-700/90 px-3 py-2 text-sm font-medium hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
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
                      variant="ghost"
                      className="h-9 w-9 rounded-lg bg-[#242033] p-0"
                      aria-label="Rename deck"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Button>
                    <Button
                      type="button"
                      onClick={deleteSelectedDeck}
                      variant="ghost"
                      className="h-9 w-9 rounded-lg border-red-400/70 bg-red-500/20 p-0 text-red-300 hover:bg-red-500/35"
                      aria-label="Delete deck"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </>
                )}
              </div>
              <Button
                onClick={closeDeckPopup}
                variant="ghost"
                className="h-12 w-12 rounded-xl p-0 text-4xl font-bold leading-none text-gray-400 hover:bg-white/5 hover:text-white"
              >
                ✕
              </Button>
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
                                  src={iconPath}
                                  alt="Icon"
                                  fill
                                  className="scale-[1.75] object-contain"
                                  style={{ imageRendering: "pixelated" }}
                                />
                              </span>
                            )}
                            {selectedDeckIcon === iconPath && (
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#2d2740] bg-[var(--accent-color)] text-[10px] text-white">
                                ✓
                              </span>
                            )}
                          </Button>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-b border-[#3c3650] px-4 py-3 text-sm text-gray-300">
                  Cards: {getTotalCards(selectedDeck!)}/60
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  {decks[selectedDeck!]?.cards.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {decks[selectedDeck!]?.cards.map((card) => {
                        const normalized = resolveCardFilename(card.name);
                        const hasError = invalidCards.has(card.id);
                        const isLimitedCard = !isEnergyCardName(card.name);
                        const isAtCopyLimit = isLimitedCard && card.count >= MAX_NON_ENERGY_COPIES;
                        const isOverCopyLimit = isLimitedCard && card.count > MAX_NON_ENERGY_COPIES;
                        return (
                          <div key={card.id} className="relative group">
                            <div
                              className={`relative aspect-[2.5/3.5] overflow-hidden rounded-lg border bg-[#242033] transition-all ${
                                isOverCopyLimit
                                  ? "border-red-400/90 ring-1 ring-red-500/60"
                                  : "border-[#3c3650] hover:border-[color:var(--accent-border)]"
                              }`}
                            >
                              <Button
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
                                {card.count}
                              </div>

                              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                                <Button
                                  type="button"
                                  onClick={() => removeCard(selectedDeck!, card.id)}
                                  className="h-8 w-8 rounded-md border-red-400/70 bg-red-500/90 p-0 text-xl font-black leading-none hover:bg-red-600"
                                  aria-label={`Remove one copy of ${card.name}`}
                                >
                                  −
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => incrementCard(selectedDeck!, card.id)}
                                  disabled={getTotalCards(selectedDeck!) >= 60 || isAtCopyLimit}
                                  className="h-8 w-8 rounded-md border-emerald-400/70 bg-emerald-500/90 p-0 text-xl font-black leading-none hover:bg-emerald-600"
                                  aria-label={`Add one copy of ${card.name}`}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-400">No cards in this deck</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3c3650] bg-[#181524]">
                <div className="border-b border-[#3c3650] px-4 py-3">
                  <h4 className="text-lg font-semibold text-white">Available cards</h4>
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="text"
                      value={availableCardQuery}
                      onChange={(e) => {
                        setAvailableCardQuery(e.target.value);
                        if (cardError) setCardError("");
                      }}
                      placeholder="Search a card..."
                      className="flex-1 rounded-lg py-2"
                    />
                  </div>
                  {cardError && <p className="mt-2 text-xs text-red-500">{cardError}</p>}
                </div>

                <div className="min-h-0 flex-1 overflow-y-scroll p-4 overscroll-contain">
                  <div className="mb-3 text-sm text-gray-400">{filteredAvailableCards.length} cards found</div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {filteredAvailableCards.map((cardBase) => {
                      const displayName = formatCardDisplayName(cardBase);
                      const countInDeck = getCardCountInDeck(selectedDeck!, cardBase);
                      const isAtCopyLimit = !isEnergyCardName(displayName) && countInDeck >= MAX_NON_ENERGY_COPIES;
                      const isOverCopyLimit = !isEnergyCardName(displayName) && countInDeck > MAX_NON_ENERGY_COPIES;
                      return (
                        <Button
                          key={cardBase}
                          type="button"
                          onClick={() => addCardByName(selectedDeck!, displayName)}
                          disabled={getTotalCards(selectedDeck!) >= 60 || isAtCopyLimit}
                          variant="ghost"
                          className={`group !h-auto w-full flex-col items-stretch overflow-hidden rounded-lg border bg-[#242033] p-0 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            isOverCopyLimit
                              ? "border-red-400/80"
                              : "border-[#3c3650] hover:border-[color:var(--accent-border)] hover:bg-[#302a45]"
                          }`}
                        >
                          <div className="relative aspect-[2.5/3.5] bg-black/20">
                            <Image
                              src={`/cards/${encodeURIComponent(cardBase)}.png`}
                              alt={displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-1.5">
                            <p className="truncate text-[11px] font-semibold text-white">{displayName}</p>
                            <p className="text-[10px] text-gray-400">
                              Dans le deck: {countInDeck}
                            </p>
                          </div>
                        </Button>
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
          </Card>
        </div>
      )}

      {previewCard && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewCard(null)}
        >
          <Image
            src={`/cards/${encodeURIComponent(previewCard!.filename)}.png`}
            alt={previewCard!.name}
            width={1000}
            height={1400}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </AppPageShell>
  );
}
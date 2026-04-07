"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";
import NotificationToast from "@/components/organisms/home/NotificationToast";


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
  cards: Card[];
};

type DeckIcons = Record<string, string>;

// HARDCODE: allowed card pool displayed in deck builder until DB-backed catalog is integrated.
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

const formatCardDisplayName = (fileBase: string) =>
  fileBase
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isImageIcon = (icon: string) => icon.startsWith("/");
const normalizeDeckIcon = (icon: string | undefined) => {
  if (!icon) return deckImages.Flygon;
  if (icon === BLANK_DECK_ICON) return BLANK_DECK_ICON;
  if (isImageIcon(icon)) return icon;
  return BLANK_DECK_ICON;
};

const isEnergyCardName = (name: string) => resolveCardFilename(name).endsWith("_energy");

// HARDCODE: temporary fallback deck definitions when localStorage is empty.
const fallbackDeckList = [
  { name: "Flygon", icon: deckImages.Flygon },
  { name: "Ceruledge", icon: deckImages.Ceruledge },
  { name: "Toxtricity", icon: deckImages.Toxtricity },
  { name: "Zacian", icon: deckImages.Zacian },
];

const fallbackDecks: Record<string, DeckData> = {
  Flygon: { cards: [] },
  Ceruledge: { cards: [] },
  Toxtricity: { cards: [] },
  Zacian: { cards: [] },
};

const fallbackDeckIcons: DeckIcons = Object.fromEntries(
  fallbackDeckList.map((deck) => [deck.name, deck.icon])
);

const fallbackDeckData = {
  decks: fallbackDecks,
  deckList: fallbackDeckList.map((deck) => ({ name: deck.name })),
  deckIcons: fallbackDeckIcons,
};

/**
 * Objective: hydrate deck builder state from browser storage.
 * Usage: called on page initialization.
 * Input: none.
 * Output: normalized decks, deck list, and deck icons.
 * Special cases: returns fallback hardcoded deck data when storage is empty.
 */
const getDeckDataFromStorage = () => {
  const saved = localStorage.getItem("decks");
  if (!saved) {
    return fallbackDeckData;
  }

  const parsedDecks = JSON.parse(saved) as Record<string, DeckData>;
  const savedIcons = localStorage.getItem("deckIcons");
  const parsedIcons = savedIcons ? (JSON.parse(savedIcons) as DeckIcons) : {};
  const savedDeckNames = Object.keys(parsedDecks);

  if (savedDeckNames.length === 0) {
    return fallbackDeckData;
  }

  const deckIcons: DeckIcons = Object.fromEntries(
    savedDeckNames.map((name) => [name, normalizeDeckIcon(parsedIcons[name] || deckImages[name] || deckImages.Flygon)])
  );

  return {
    decks: parsedDecks,
    deckList: savedDeckNames.map((name) => ({ name })),
    deckIcons,
  };
};

// Page des decks
export default function DecksPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<{ name: string; filename: string } | null>(null);
  const [decks, setDecks] = useState<Record<string, DeckData>>(fallbackDeckData.decks);
  const [deckList, setDeckList] = useState<Array<{ name: string }>>(fallbackDeckData.deckList);
  const [deckIcons, setDeckIcons] = useState<DeckIcons>(fallbackDeckData.deckIcons);
  const [cardError, setCardError] = useState("");
  const [invalidCards, setInvalidCards] = useState<Set<string>>(new Set());
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [deckNameDraft, setDeckNameDraft] = useState("");
  const [deckNameError, setDeckNameError] = useState("");
  const [availableCardQuery, setAvailableCardQuery] = useState("");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);

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

  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
        setUserPseudo(data.user.name);
    };
    getUserData();
  });

  //reconnect socket in case of a page refresh
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
  
  //render messages sent by other users
  useEffect(() => {
    if (!userPseudo) return;
    socket.on("received", async ({sender, receiver, msg}) => {
      setNotifSender(sender);
      setNotification(msg);
    })
  }, [userPseudo])

  const selectedDeckIcon = selectedDeck ? deckIcons[selectedDeck] || deckImages.Flygon : deckImages.Flygon;

  const filteredAvailableCards = useMemo(() => {
    const query = availableCardQuery.trim().toLowerCase();
    if (!query) return cardFileBases;

    return cardFileBases.filter((base) => {
      const displayName = formatCardDisplayName(base).toLowerCase();
      return displayName.includes(query) || base.includes(query);
    });
  }, [availableCardQuery]);

  /**
   * Objective: persist a single deck update and keep React state in sync.
   * Usage: called by all card/deck mutation handlers.
   * Input: target deck name + next deck data.
   * Output: none (state + localStorage side effects).
   * Special cases: clones card entries to avoid accidental shared references.
   */
  const saveDeck = (deckName: string, data: DeckData) => {
    const normalizedData: DeckData = {
      cards: data.cards.map((card) => ({ ...card })),
    };
    const updated = { ...decks, [deckName]: normalizedData };
    setDecks(updated);
    localStorage.setItem("decks", JSON.stringify(updated));
  };

  const getTotalCards = (deckName: string) => {
    return decks[deckName]?.cards.reduce((sum, card) => sum + card.count, 0) || 0;
  };

  const persistDeckIcons = (nextDeckIcons: DeckIcons) => {
    setDeckIcons(nextDeckIcons);
    localStorage.setItem("deckIcons", JSON.stringify(nextDeckIcons));
  };

  const setDeckIcon = (deckName: string, icon: string) => {
    const iconValue = normalizeDeckIcon(icon.trim());
    if (!iconValue) return;

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
      setCardError("Cette carte n'existe pas");
      return;
    }

    setCardError("");

    const currentDeck = decks[deckName] || { cards: [] };
    const nextCards = currentDeck.cards.map((card) => ({ ...card }));
    const total = getTotalCards(deckName);

    if (total >= 60) {
      alert("Deck is full! Maximum 60 cards.");
      return;
    }

    const existingCard = nextCards.find(
      (card) => canonicalizeCardName(card.name) === canonicalizeCardName(name)
    );

    if (existingCard) {
      if (!isEnergyCardName(name) && existingCard.count >= MAX_NON_ENERGY_COPIES) {
        setCardError(`Maximum ${MAX_NON_ENERGY_COPIES} exemplaires pour cette carte (hors énergies).`);
        return;
      }

      if (total + 1 > 60) {
        alert("Cannot exceed 60 cards!");
        return;
      }
      existingCard.count += 1;
    } else {
      nextCards.push({
        id: crypto.randomUUID(),
        name,
        count: 1,
      });
    }

    saveDeck(deckName, { cards: nextCards });
  };

  const removeCard = (deckName: string, cardId: string) => {
    const currentDeck = decks[deckName];
    if (!currentDeck) return;

    const nextCards = currentDeck.cards.map((card) => ({ ...card }));
    const cardIndex = nextCards.findIndex((card) => card.id === cardId);

    if (cardIndex !== -1) {
      if (nextCards[cardIndex].count > 1) {
        nextCards[cardIndex].count -= 1;
      } else {
        nextCards.splice(cardIndex, 1);
      }
      saveDeck(deckName, { cards: nextCards });
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

    const nextCards = currentDeck.cards.map((item) => ({ ...item }));
    const card = nextCards.find((item) => item.id === cardId);
    if (!card) return;

    if (!isEnergyCardName(card.name) && card.count >= MAX_NON_ENERGY_COPIES) {
      setCardError(`Maximum ${MAX_NON_ENERGY_COPIES} exemplaires pour cette carte (hors énergies).`);
      return;
    }

    card.count += 1;
    saveDeck(deckName, { cards: nextCards });
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

    const nextDeckIcons = {
      ...deckIcons,
      [deckName]: deckImages.Flygon,
    };
    persistDeckIcons(nextDeckIcons);

    setDeckList((prev) => [...prev, { name: deckName }]);
    openDeckPopup(deckName);
  };

  const openDeckPopup = (deckName: string) => {
    setSelectedDeck(deckName);
    setIsRenamingDeck(false);
    setDeckNameDraft(deckName);
    setDeckNameError("");
    setAvailableCardQuery("");
    setIsIconPickerOpen(false);
    setCardError("");
  };

  const closeDeckPopup = () => {
    setSelectedDeck(null);
    setIsRenamingDeck(false);
    setDeckNameDraft("");
    setDeckNameError("");
    setAvailableCardQuery("");
    setIsIconPickerOpen(false);
    setCardError("");
  };

  /**
   * Objective: rename selected deck with uniqueness and empty-value guards.
   * Usage: called from rename action in deck modal header.
   * Input: none (reads current draft and selected deck state).
   * Output: none (state/storage mutation or UI validation error).
   * Special cases: no-op when name is unchanged; updates associated deck icon key.
   */
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

    const nextDeckIcons: DeckIcons = { ...deckIcons };
    nextDeckIcons[nextName] = nextDeckIcons[previousName] || deckImages.Flygon;
    delete nextDeckIcons[previousName];
    persistDeckIcons(nextDeckIcons);

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

    const nextDeckIcons = { ...deckIcons };
    delete nextDeckIcons[selectedDeck];
    persistDeckIcons(nextDeckIcons);

    setDeckList((prev) => prev.filter((deck) => deck.name !== selectedDeck));
    closeDeckPopup();
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
    {showNotification && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification!} sender={notifSender!} />)}  
      <div className="relative mx-auto flex h-full w-full max-w-[88rem] flex-col overflow-y-auto pr-1">
        <header className="mb-6 flex items-center justify-between">
        </header>

        <section className="flex-1 rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">My Decks</h2>
            {/* Usage atomique: Button uniforme pour les cartes deck et leurs etats hover/active. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {deckList.map((deck) => (
                <Button
                  key={deck.name}
                  onClick={() => openDeckPopup(deck.name)}
                  variant="ghost"
                  className="group relative !h-auto min-h-[11.5rem] w-full flex-col overflow-hidden rounded-2xl border border-[#3c3650] bg-[#242033] p-6 transition-all hover:border-[color:var(--accent-border)] hover:bg-[#302a45]"
                >
                  <div className="mb-4 flex items-center justify-center">
                    {(deckIcons[deck.name] || deckImages.Flygon) === BLANK_DECK_ICON ? (
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#4a455e] bg-[#1b1828]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#6c6788] bg-[#242033] text-gray-300">
                          <i className="fa-regular fa-image text-2xl" />
                        </div>
                      </div>
                    ) : isImageIcon(deckIcons[deck.name] || deckImages.Flygon) ? (
                      <Image
                        src={deckIcons[deck.name] || deckImages.Flygon}
                        alt={deck.name}
                        width={90}
                        height={90}
                        className="h-25 w-25 object-contain transition-transform group-hover:scale-110"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#4a455e] bg-[#1b1828]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#6c6788] bg-[#242033] text-gray-300">
                          <i className="fa-regular fa-image text-2xl" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-lg font-semibold text-white group-hover:text-[var(--accent-color)]">
                    {deck.name}
                  </p>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    {getTotalCards(deck.name)}/60
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

      {/* Popup du deck */}
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
                          setDeckNameDraft(selectedDeck ?? "");
                          setDeckNameError("");
                        }
                      }}
                      placeholder="Nom du deck"
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
                        setDeckNameDraft(selectedDeck ?? "");
                        setDeckNameError("");
                      }}
                      className="h-10 rounded-lg border-gray-500/70 bg-gray-700/90 px-3 py-2 text-sm font-medium hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="truncate text-2xl font-bold text-white">{selectedDeck}</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsRenamingDeck(true);
                        setDeckNameDraft(selectedDeck ?? "");
                        setDeckNameError("");
                      }}
                      variant="ghost"
                      className="h-9 w-9 rounded-lg bg-[#242033] p-0"
                      aria-label="Renommer le deck"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Button>
                    <Button
                      type="button"
                      onClick={deleteSelectedDeck}
                      variant="ghost"
                      className="h-9 w-9 rounded-lg border-red-400/70 bg-red-500/20 p-0 text-red-300 hover:bg-red-500/35"
                      aria-label="Supprimer le deck"
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

            <div className="grid h-[86vh] grid-cols-1 gap-5 overflow-hidden p-5 lg:grid-cols-[1.35fr_1fr]">
              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3c3650] bg-[#181524]">
                <div className="border-b border-[#3c3650] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-300">Deck icon:</span>
                    <Button
                      type="button"
                      onClick={() => setIsIconPickerOpen((prev) => !prev)}
                      variant="ghost"
                      className="relative h-14 w-14 overflow-hidden rounded-xl border-[#4a4363] bg-[#242033] p-0 hover:bg-[#302a45]"
                      aria-label="Choisir l'icône du deck"
                      aria-expanded={isIconPickerOpen}
                    >
                      {selectedDeckIcon === BLANK_DECK_ICON ? (
                        <span className="text-gray-300">
                          <i className="fa-regular fa-image text-xl" />
                        </span>
                      ) : isImageIcon(selectedDeckIcon) ? (
                        <span className="relative h-full w-full overflow-hidden rounded-[inherit]">
                          <Image
                            src={selectedDeckIcon}
                            alt="Deck icon"
                            fill
                            className="scale-[1.7] object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </span>
                      ) : (
                        <span className="text-gray-300">
                          <i className="fa-regular fa-image text-xl" />
                        </span>
                      )}
                    </Button>
                    <span className="text-xs text-gray-400">Choisis une icone pour identifier rapidement ton deck.</span>

                    {isIconPickerOpen && (
                      <div className="w-full rounded-xl border border-[#3c3650] bg-[#1f1a2d] p-3">
                        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 md:grid-cols-8">
                        {deckIconChoices.map((iconPath) => (
                          <Button
                            key={iconPath}
                            type="button"
                            onClick={() => {
                              setDeckIcon(selectedDeck!, iconPath);
                              setIsIconPickerOpen(false);
                            }}
                            variant="ghost"
                            aria-pressed={selectedDeckIcon === iconPath}
                            className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border p-0 transition-colors ${
                              selectedDeckIcon === iconPath
                                ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent-border)]"
                                : "border-[#3c3650] bg-[#242033] hover:bg-[#302a45]"
                            }`}
                            title={iconPath === BLANK_DECK_ICON ? "Sans icone" : "Selectionner cette icone"}
                          >
                            {iconPath === BLANK_DECK_ICON ? (
                              <span className="text-gray-300">
                                <i className="fa-regular fa-image text-lg" />
                              </span>
                            ) : (
                              <span className="relative h-full w-full overflow-hidden rounded-[inherit]">
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
                                onClick={() => {
                                  if (!hasError) {
                                    setPreviewCard({ name: card.name, filename: normalized });
                                  }
                                }}
                                variant="ghost"
                                className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--accent-soft)] to-[#3c3650]"
                              >
                                {hasError ? (
                                  <p className="p-2 text-center text-xs text-red-500">Cette carte n&apos;existe pas</p>
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
                              </Button>

                              <div
                                className="absolute bottom-1.5 left-1/2 z-20 flex h-7 w-10 -translate-x-1/2 items-center justify-center rounded-md border border-gray-500 bg-gradient-to-br from-gray-500 to-gray-600 text-sm font-bold text-white shadow-lg"
                                style={{ clipPath: "polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)" }}
                              >
                                {card.count}
                              </div>

                              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                                <Button
                                  type="button"
                                  onClick={() => removeCard(selectedDeck!, card.id)}
                                  className="h-8 w-8 rounded-md border-red-400/70 bg-red-500/90 p-0 text-xl font-black leading-none hover:bg-red-600"
                                  aria-label={`Retirer une copie de ${card.name}`}
                                >
                                  −
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => incrementCard(selectedDeck!, card.id)}
                                  disabled={getTotalCards(selectedDeck!) >= 60 || isAtCopyLimit}
                                  className="h-8 w-8 rounded-md border-emerald-400/70 bg-emerald-500/90 p-0 text-xl font-black leading-none hover:bg-emerald-600"
                                  aria-label={`Ajouter une copie de ${card.name}`}
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
                      <p className="text-gray-400">Aucune carte dans ce deck</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3c3650] bg-[#181524]">
                <div className="border-b border-[#3c3650] px-4 py-3">
                  <h4 className="text-lg font-semibold text-white">Cartes disponibles</h4>
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="text"
                      value={availableCardQuery}
                      onChange={(e) => {
                        setAvailableCardQuery(e.target.value);
                        if (cardError) setCardError("");
                      }}
                      placeholder="Rechercher une carte..."
                      className="flex-1 rounded-lg py-2"
                    />
                  </div>
                  {cardError && <p className="mt-2 text-xs text-red-500">{cardError}</p>}
                </div>

                <div className="min-h-0 flex-1 overflow-y-scroll p-4 overscroll-contain">
                  <div className="mb-3 text-sm text-gray-400">{filteredAvailableCards.length} cartes trouvées</div>
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
              </section>
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
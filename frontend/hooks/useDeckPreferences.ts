"use client";

import { useEffect, useState } from "react";

// HARDCODE: temporary deck icon registry until deck metadata is sourced from backend.
export const DECK_ICONS: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

// HARDCODE: default deck list used when storage is empty.
export const DEFAULT_DECKS = ["Flygon", "Ceruledge", "Toxtricity", "Zacian"];

type DeckState = {
  availableDecks: string[];
  selectedDeck: string;
};

/**
 * Objective: derive a hydration-safe deck state from browser storage.
 * Usage: called by `useDeckPreferences` during initialization and storage updates.
 * Input: fallback deck names.
 * Output: normalized available decks + selected deck.
 * Special cases: returns fallback data for SSR and invalid JSON payloads.
 */
const getInitialDeckState = (defaultDecks: string[]): DeckState => {
  if (typeof window === "undefined") {
    return { availableDecks: defaultDecks, selectedDeck: defaultDecks[0] ?? "" };
  }

  const savedDecksRaw = localStorage.getItem("decks");
  const savedSelectedDeck = localStorage.getItem("selectedDeck");

  if (!savedDecksRaw) {
    return {
      availableDecks: defaultDecks,
      selectedDeck:
        savedSelectedDeck && defaultDecks.includes(savedSelectedDeck)
          ? savedSelectedDeck
          : (defaultDecks[0] ?? ""),
    };
  }

  try {
    const parsedDecks = JSON.parse(savedDecksRaw) as Record<string, { cards: Array<unknown> }>;
    const deckNames = Object.keys(parsedDecks);

    if (deckNames.length === 0) {
      return { availableDecks: [], selectedDeck: "" };
    }

    if (savedSelectedDeck && deckNames.includes(savedSelectedDeck)) {
      return { availableDecks: deckNames, selectedDeck: savedSelectedDeck };
    }

    return { availableDecks: deckNames, selectedDeck: deckNames[0] };
  } catch {
    return { availableDecks: defaultDecks, selectedDeck: defaultDecks[0] ?? "" };
  }
};

/**
 * Objective: expose deck preference state synchronized with localStorage.
 * Usage: consumed by pages/components that let users pick and persist a deck.
 * Input: optional fallback deck list.
 * Output: `selectedDeck`, `setSelectedDeck`, and `availableDecks`.
 * Special cases: reacts to cross-tab storage changes for `decks` and `selectedDeck`.
 */
export function useDeckPreferences(defaultDecks: string[] = DEFAULT_DECKS) {
  const fallbackDeck = defaultDecks[0] ?? "";
  const [selectedDeck, setSelectedDeck] = useState(fallbackDeck);
  const [availableDecks, setAvailableDecks] = useState<string[]>(defaultDecks);

  useEffect(() => {
    const syncFromStorage = async () => {
      await Promise.resolve();
      const hydratedState = getInitialDeckState(defaultDecks);
      setAvailableDecks(hydratedState.availableDecks);
      setSelectedDeck(hydratedState.selectedDeck);
    };

    void syncFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "decks" && event.key !== "selectedDeck") {
        return;
      }

      const updatedState = getInitialDeckState(defaultDecks);
      setAvailableDecks(updatedState.availableDecks);
      setSelectedDeck(updatedState.selectedDeck);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [defaultDecks]);

  useEffect(() => {
    if (selectedDeck) {
      localStorage.setItem("selectedDeck", selectedDeck);
    }
  }, [selectedDeck]);

  return {
    selectedDeck,
    setSelectedDeck,
    availableDecks,
  };
}

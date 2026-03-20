"use client";

import { useEffect, useState } from "react";

export const DECK_ICONS: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

export const DEFAULT_DECKS = ["Flygon", "Ceruledge", "Toxtricity", "Zacian"];

type DeckState = {
  availableDecks: string[];
  selectedDeck: string;
};

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

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/atoms/Button";
import DeckOptionItem from "@/components/molecules/home/DeckOptionItem";

type DeckSelectorProps = {
  selectedDeck: string;
  availableDecks: string[];
  deckIcons: Record<string, string>;
  onSelectDeck: (deck: string) => void;
};

// Organism: selecteur complet de deck (trigger + liste) compose a partir d'atoms et molecules.
export default function DeckSelector({
  selectedDeck,
  availableDecks,
  deckIcons,
  onSelectDeck,
}: DeckSelectorProps) {
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const deckMenuRef = useRef<HTMLDivElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const normalizedAvailableDecks = useMemo(
    () => Array.from(new Set(availableDecks.filter(Boolean))),
    [availableDecks],
  );

  const hasDecks = normalizedAvailableDecks.length > 0;
  const safeSelectedDeck =
    selectedDeck && normalizedAvailableDecks.includes(selectedDeck)
      ? selectedDeck
      : (normalizedAvailableDecks[0] ?? "");

  useEffect(() => {
    if (!hasDecks || selectedDeck === safeSelectedDeck) {
      return;
    }

    // Keep selector state coherent when selected deck no longer exists.
    onSelectDeck(safeSelectedDeck);
  }, [hasDecks, onSelectDeck, safeSelectedDeck, selectedDeck]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deckMenuRef.current && !deckMenuRef.current.contains(event.target as Node)) {
        setShowDeckDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDeckDropdown(false);
        triggerButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openDropdown = () => {
    const currentIndex = normalizedAvailableDecks.findIndex((deck) => deck === safeSelectedDeck);
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    setShowDeckDropdown(true);
  };

  const toggleDropdown = () => {
    if (showDeckDropdown) {
      setShowDeckDropdown(false);
      return;
    }

    openDropdown();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!hasDecks) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    }
  };

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasDecks) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % normalizedAvailableDecks.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + normalizedAvailableDecks.length) % normalizedAvailableDecks.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const highlightedDeck = normalizedAvailableDecks[highlightedIndex];
      if (!highlightedDeck) {
        return;
      }

      onSelectDeck(highlightedDeck);
      setShowDeckDropdown(false);
      triggerButtonRef.current?.focus();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setShowDeckDropdown(false);
      triggerButtonRef.current?.focus();
    }
  };

  const selectedDeckIcon =
    deckIcons[safeSelectedDeck] ?? deckIcons[normalizedAvailableDecks[0] ?? ""] ?? "/decks/flygon-icon.png";

  return (
    <div ref={deckMenuRef} className="relative w-full max-w-[22rem]">
      <Button
        ref={triggerButtonRef}
        type="button"
        onClick={() => hasDecks && toggleDropdown()}
        onKeyDown={handleTriggerKeyDown}
        variant="ghost"
        className={`h-16 w-full justify-start gap-3 rounded-2xl bg-[#15131d]/90 px-3 shadow-xl ${
          hasDecks ? "hover:bg-[#211d2e]" : "cursor-not-allowed opacity-75"
        }`}
        aria-haspopup="listbox"
        aria-expanded={showDeckDropdown}
        aria-controls="home-deck-selector-listbox"
        disabled={!hasDecks}
      >
        <div className="flex h-12 w-12 items-center justify-center">
          <Image
            src={selectedDeckIcon}
            alt={safeSelectedDeck || "Deck"}
            width={52}
            height={52}
            className="h-12 w-12 object-contain transition-all"
            style={{
              imageRendering: "pixelated",
              filter: "brightness(1) contrast(1.5) saturate(1)",
            }}
            priority
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start leading-tight">
          <span className="text-xs uppercase tracking-[0.14em] text-gray-400">Deck selectionne</span>
          <span className="w-full truncate text-lg font-bold text-white">
            {safeSelectedDeck || "Aucun deck"}
          </span>
        </div>
        <span className="hidden text-xs text-gray-400 sm:inline">{normalizedAvailableDecks.length} decks</span>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-300 transition-transform ${showDeckDropdown ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {showDeckDropdown && (
        <div
          id="home-deck-selector-listbox"
          className="absolute top-[calc(100%+0.55rem)] z-30 max-h-[min(55vh,22rem)] w-full overflow-y-auto rounded-2xl border border-[#3c3650] bg-[#15131d] p-2 shadow-2xl"
          role="listbox"
          aria-label="Selection du deck"
          tabIndex={-1}
          onKeyDown={handleListboxKeyDown}
        >
          {normalizedAvailableDecks.map((deck, index) => (
            <DeckOptionItem
              key={deck}
              deck={deck}
              selected={safeSelectedDeck === deck}
              highlighted={highlightedIndex === index}
              icon={deckIcons[deck] || "/decks/flygon-icon.png"}
              onSelect={() => {
                onSelectDeck(deck);
                setShowDeckDropdown(false);
                triggerButtonRef.current?.focus();
              }}
            />
          ))}

          {!hasDecks && (
            <div className="px-3 py-2 text-sm text-gray-400">Aucun deck disponible</div>
          )}
        </div>
      )}
    </div>
  );
}

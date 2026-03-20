"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/atoms/Button";

type DeckSelectorProps = {
  selectedDeck: string;
  availableDecks: string[];
  deckIcons: Record<string, string>;
  onSelectDeck: (deck: string) => void;
};

export default function DeckSelector({
  selectedDeck,
  availableDecks,
  deckIcons,
  onSelectDeck,
}: DeckSelectorProps) {
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const deckMenuRef = useRef<HTMLDivElement | null>(null);

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

  const selectedDeckIcon =
    deckIcons[selectedDeck] ?? deckIcons[availableDecks[0] ?? ""] ?? "/decks/flygon-icon.png";

  return (
    <div ref={deckMenuRef} className="relative w-[18rem]">
      {/* Usage atomique: Button sert de declencheur commun pour les interactions de selection. */}
      <Button
        type="button"
        onClick={() => setShowDeckDropdown((prev) => !prev)}
        variant="ghost"
        className="h-16 w-full justify-start gap-3 rounded-2xl bg-[#15131d]/90 px-3 shadow-xl hover:bg-[#211d2e]"
        aria-haspopup="listbox"
        aria-expanded={showDeckDropdown}
      >
        <div className="flex h-12 w-12 items-center justify-center">
          <Image
            src={selectedDeckIcon}
            alt={selectedDeck || "Deck"}
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
        <div className="flex flex-1 flex-col items-start leading-tight">
          <span className="text-xs uppercase tracking-[0.14em] text-gray-400">Deck selectionne</span>
          <span className="text-lg font-bold text-white">{selectedDeck || "Aucun deck"}</span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-300 transition-transform ${showDeckDropdown ? "rotate-180" : ""}`}
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
          className="absolute top-[calc(100%+0.55rem)] z-30 w-full rounded-2xl border border-[#3c3650] bg-[#15131d] p-2 shadow-2xl"
          role="listbox"
          aria-label="Selection du deck"
        >
          {availableDecks.map((deck) => (
            <Button
              key={deck}
              type="button"
              onClick={() => {
                onSelectDeck(deck);
                setShowDeckDropdown(false);
              }}
              role="option"
              aria-selected={selectedDeck === deck}
              variant={selectedDeck === deck ? "primary" : "ghost"}
              className={`h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left ${
                selectedDeck === deck
                  ? "bg-[var(--accent-soft)]"
                  : "text-gray-200 hover:bg-[#242033]"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src={deckIcons[deck] || "/decks/flygon-icon.png"}
                  alt={deck}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <span className="flex-1 text-base font-semibold">{deck}</span>
              {selectedDeck === deck && <i className="fa-solid fa-check text-[var(--accent-color)]"></i>}
            </Button>
          ))}

          {availableDecks.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">Aucun deck disponible</div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import flygon from "../public/decks/flygon-icon.png";
import ceruledge from "../public/decks/ceruledge-icon.png";
import toxtricity from "../public/decks/toxtricity-icon.png";
import zacian from "../public/decks/zacian-icon.png";

const deckImages: Record<string, string> = {
  Flygon: flygon.src,
  Ceruledge: ceruledge.src,
  Toxtricity: toxtricity.src,
  Zacian: zacian.src,
};

type Card = {
  id: string;
  name: string;
  count: number;
};

type DeckData = {
  cards: Card[];
};

// Page des decks
export default function DecksPage() {
  const router = useRouter();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [decks, setDecks] = useState<Record<string, DeckData>>({});
  const [newCardName, setNewCardName] = useState("");

  const deckList = [
    { name: "Flygon", icon: deckImages.Flygon },
    { name: "Ceruledge", icon: deckImages.Ceruledge },
    { name: "Toxtricity", icon: deckImages.Toxtricity },
    { name: "Zacian", icon: deckImages.Zacian },
  ];

  // Charger les decks depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("decks");
    if (saved) {
      setDecks(JSON.parse(saved));
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
          <button
            className="mb-6 inline-flex h-10 items-center gap-2 rounded-lg border border-[#b4a8ff]/60 bg-[#8e82ff] px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#7d71ec]"
          >
            <i className="fa-solid fa-plus"></i>
            New
          </button>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">My Decks</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {deckList.map((deck) => (
                <button
                  key={deck.name}
                  onClick={() => setSelectedDeck(deck.name)}
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
      </div>

      {/* Popup du deck */}
      {selectedDeck && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDeck(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-[#3c3650] bg-[#15131d] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3c3650] px-6 py-4">
              <h3 className="text-2xl font-bold text-white">{selectedDeck} Deck</h3>
              <button
                onClick={() => setSelectedDeck(null)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <div className="mb-2 text-sm text-gray-400">
                  Cards: {getTotalCards(selectedDeck)}/60
                </div>
                <div className="w-full bg-[#242033] rounded-full h-2 border border-[#3c3650]">
                  <div
                    className="bg-[#8e82ff] h-2 rounded-full transition-all"
                    style={{ width: `${(getTotalCards(selectedDeck) / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Affichage en grille des cartes */}
              {decks[selectedDeck]?.cards.length > 0 ? (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {decks[selectedDeck]?.cards.map((card) => (
                      <div
                        key={card.id}
                        className="relative group cursor-pointer"
                        onClick={() => removeCard(selectedDeck, card.id)}
                      >
                        <div className="relative overflow-hidden rounded-lg border border-[#3c3650] bg-[#242033] aspect-[2.5/3.5] hover:border-[#8e82ff]/60 transition-all">
                          {/* Image de la carte */}
                          <div className="w-full h-full bg-gradient-to-br from-[#8e82ff]/20 to-[#3c3650] flex items-center justify-center relative">
                            <div className="text-center p-2">
                              <p className="text-xs text-white font-semibold truncate">{card.name}</p>
                              <p className="text-[10px] text-gray-400 mt-1">Click to remove</p>
                            </div>
                          </div>
                          
                          {/* Badge de quantité */}
                          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg border border-red-400">
                            {card.count}
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-trash text-red-400 text-lg"></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucune carte dans ce deck</p>
                </div>
              )}

              {/* Ajouter une carte */}
              <div className="border-t border-[#3c3650] pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
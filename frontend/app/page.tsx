"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const cards = useMemo(
    () => [
      { id: "standard", title: "STANDARD", icon: "🔥", border: "border-orange-500" },
      { id: "trainer", title: "TRAINER TRIALS", icon: "⚡", border: "border-amber-500" },
      { id: "expanded", title: "EXPANDED BETA", icon: "💧", border: "border-blue-500" },
    ],
    []
  );
  const [activeIndex, setActiveIndex] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  const visibleCards = [
    cards[(activeIndex + 2) % cards.length],
    cards[activeIndex],
    cards[(activeIndex + 1) % cards.length],
  ];

  const handlePrev = () => {
    if (isSliding) return;
    setSlideDir("left");
    setIsSliding(true);
    setActiveIndex((i) => (i - 1 + cards.length) % cards.length);
    setTimeout(() => setIsSliding(false), 220);
  };
  const handleNext = () => {
    if (isSliding) return;
    setSlideDir("right");
    setIsSliding(true);
    setActiveIndex((i) => (i + 1) % cards.length);
    setTimeout(() => setIsSliding(false), 220);
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-400 via-blue-300 to-purple-400">
      {/* Header */}
      <header className="flex items-center px-8 py-2 bg-gradient-to-r from-black to-yellow-500/90 shadow-lg">
        <nav className="flex gap-6 text-white font-black text-xl uppercase tracking-wider italic" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <a href="/" className="hover:text-yellow-200 transition-colors relative">
            HOME
            <div className="absolute top-7 bottom-1 left-0 right-0 h-1 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/60"></div>
          </a>
          <a href="/decks" className="hover:text-yellow-200 transition-colors">
            DECKS
          </a>
          <a href="/profile" className="hover:text-yellow-200 transition-colors">
            PROFILE
          </a>
        </nav>
      </header>
      
      {/* Separator Line */}
      <div className="h-0.5 bg-gradient-to-r from-yellow-400 via-yellow-400 to-yellow-600 shadow-md"></div>

      {/* Main Content */}
      <main className="flex-1 flex">
        <div className="flex flex-1 items-stretch">
          {/* Left Side - Illustration */}
          <div className="flex-1 min-h-full bg-gradient-to-br from-cyan-300 via-pink-200 to-purple-300 flex items-center justify-center p-8">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-9xl">🎮</div>
            </div>
          </div>

          {/* Right Side - Game Modes */}
          <div className="flex-1 min-h-full bg-gradient-to-br from-gray-300 to-gray-200 flex flex-col items-center justify-center gap-8 p-8">
            {/* Game Mode Cards */}
            <div className="flex gap-4 items-end justify-center w-full">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border-2 border-white/80 text-white flex items-center justify-center text-2xl shadow-md bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous mode"
              >
                ‹
              </button>
              
              <div
                className="flex gap-6 items-end transition-transform duration-200 ease-out"
                style={{ transform: isSliding ? `translateX(${slideDir === "right" ? "-8px" : "8px"})` : "translateX(0)" }}
              >
                {visibleCards.map((card, index) => {
                  const isActive = index === 1;
                  return (
                    <div
                      key={card.id}
                      className={`transform-gpu transition-all duration-200 ease-out ${isActive ? "scale-110" : "scale-100"}`}
                    >
                      <div
                        className={`w-36 h-44 ${isActive ? "w-40 h-56" : ""} ${card.border.replace("border-", "bg-")} p-1 shadow-2xl`}
                        style={{ clipPath: "polygon(50% 0, 88% 8%, 100% 30%, 100% 70%, 88% 92%, 50% 100%, 12% 92%, 0 70%, 0 30%, 12% 8%)" }}
                      >
                        <div
                          className="w-full h-full bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col items-center justify-center p-4"
                          style={{ clipPath: "polygon(50% 0, 88% 8%, 100% 30%, 100% 70%, 88% 92%, 50% 100%, 12% 92%, 0 70%, 0 30%, 12% 8%)" }}
                        >
                          <div className={`${isActive ? "text-6xl" : "text-5xl"} mb-3`}>{card.icon}</div>
                          <div className={`${isActive ? "text-sm" : "text-xs"} text-white font-bold text-center uppercase`}>
                            {card.title.split(" ").map((word, idx) => (
                              <div key={`${card.id}-${idx}`}>{word}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full border-2 border-white/80 text-white flex items-center justify-center text-2xl shadow-md bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next mode"
              >
                ›
              </button>
            </div>

            {/* Play Button */}
            <div
              className="w-full max-w-lg bg-amber-600 p-1 shadow-2xl transform-gpu transition-transform origin-center hover:scale-105"
              style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)' }}
            >
              <button
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-red-900 font-black text-4xl py-5 px-8 uppercase tracking-wide"
                style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)' }}
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

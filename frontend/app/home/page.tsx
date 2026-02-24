"use client";

import Image from "next/image";
import { useState } from "react";
import absol from "../images/absol.png";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a, #333333, #666666, #999999, #cccccc, #e0e0e0)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes dot-pulse {
          0%, 20% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }
        .dot-1 {
          animation: dot-pulse 1.4s infinite 0s;
        }
        .dot-2 {
          animation: dot-pulse 1.4s infinite 0.2s;
        }
        .dot-3 {
          animation: dot-pulse 1.4s infinite 0.4s;
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center px-8 py-2 bg-gradient-to-r from-black to-gray-400 shadow-lg">
        <nav className="flex gap-6 text-white font-black text-xl uppercase tracking-wider italic" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <a href="/home" className="hover:text-gray-400 transition-colors relative">
            HOME
            <div className="absolute top-8.5 bottom-1 left-0 right-0 h-1 bg-gray-400 rounded-full shadow-lg shadow-yellow-400/60"></div>
          </a>
          <a href="/decks" className="hover:text-gray-400 transition-colors">
            DECKS
          </a>
          <a href="/profile" className="hover:text-gray-400 transition-colors">
            PROFILE
          </a>
          <a href="/social" className="hover:text-gray-400 transition-colors">
            SOCIAL
          </a>
        </nav>
      </header>
      
      {/* Separator Line */}
      <div className="h-0.5 bg-gradient-to-r from-gray-400 via-white to-gray-400 shadow-md"></div>

      {/* Main Content */}
      <main className="flex-1 flex">
        <div className="flex flex-1 items-stretch relative overflow-hidden">
          {/* Left Side - Illustration */}
          <div className="flex-1 min-h-full flex items-center justify-center p-8 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(45deg, #000000, #1a1a1a, #333333, #4d4d4d, #333333, #1a1a1a, #000000)",
                backgroundSize: "400% 400%",
                animation: "gradient-shift 15s ease infinite",
              }}
            />
            <div className="w-full h-full flex items-center justify-center relative z-10">
              <Image
                src={absol}
                alt="Absol"
                width={360}
                height={360}
                className="w-72 max-w-[60%] h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Angled Divider */}
          <div
            className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-full w-24 bg-gradient-to-br from-gray-700 via-gray-350 to-white transform -skew-x-6 shadow-xl pointer-events-none"
            aria-hidden="true"
          ></div>

          {/* Right Side - Game Modes */}
          <div className="flex-1 min-h-full bg-gradient-to-br from-gray-300 to-gray-200 flex flex-col items-center justify-center gap-8 p-8">
            {/* Play Button */}
            <div
              className="w-full max-w-lg bg-gray-500 p-1 shadow-2xl transform-gpu transition-transform origin-center hover:scale-105"
              style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)' }}
            >
              <button
                onClick={() => setShowPopup(true)}
                className="w-full bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 text-gray-800 font-black text-4xl py-5 px-8 uppercase tracking-wide"
                style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)' }}
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-300 to-gray-200 p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
                En recherche de joueur
                <span className="dot-1">.</span>
                <span className="dot-2">.</span>
                <span className="dot-3">.</span>
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-500 text-gray-800 font-bold text-lg py-3 px-4 rounded-lg hover:scale-105 transition-transform uppercase"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


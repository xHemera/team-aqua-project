"use client";

import Image from "next/image";
import { useState } from "react";
import flygon from "../images/flygon.png";

const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState("Flygoon");
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  
  const decks = ["Flygoon", "Ceruledge", "Toxtricity", "Zacian"];

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
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
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
      
      {/* Background sections that fill entire screen including header */}
      <div className="absolute inset-0 flex">
        {/* Left Side Background */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/images/ectoplasme.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(14px)',
              transform: 'scale(1.08)',
            }}
          />
          {/* Left fade to hide clip edge */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(110deg, transparent 0%, transparent 85%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </div>

        {/* Right Side Background */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "#2a2a2a",
            }}
          />
        </div>

        {/* Smooth Blend Between Sides */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[37%] w-[32vw]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #2a2a2a 50%, #2a2a2a 100%)',
            transform: 'skewX(-6deg)',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* Notification Bar - Top Left */}
      {showNotification && (
        <div className="fixed top-4 left-4 z-50 animate-slide-in">
          <div className="rounded-2xl shadow-2xl border-2 border-[#a99bff] overflow-hidden w-[380px] max-w-[90vw]">
            {/* Top part - Violet */}
            <div className="bg-[#8e82ff] px-3  flex items-center justify-between">
              <div className="text-white font-bold text-base">@sunmiaou</div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white hover:text-gray-200 transition-colors text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            {/* Separator line */}
            <div className="w-full h-[2px] bg-black"></div>
            {/* Bottom part - Black */}
            <div className="bg-black px-4 py-4">
              <div className="text-white text-sm leading-tight">Viens sur mon ile, j'ai pleins de petites filles a te donner</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-end px-8 py-4 bg-transparent relative z-10">
        <div className="flex gap-4 px-4 py-3 rounded-2xl border-2 border-[#363242] bg-gray-900/30 backdrop-blur-sm shadow-xl">
          {/* Decks Icon */}
          <a href="/decks" className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center border-2 border-gray-500 hover:bg-gray-500 transition-colors shadow-lg">
            <i className="fa-solid fa-box-archive text-white text-2xl"></i>
          </a>
          
          {/* Social/Chat Icon with notification */}
          <a href="/social" className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center border-2 border-gray-500 hover:bg-gray-500 transition-colors shadow-lg relative">
            <i className="fa-regular fa-comment-dots text-white text-2xl"></i>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
          </a>
          
          {/* Settings Icon */}
          <a href="/profile" className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center border-2 border-gray-500 hover:bg-gray-500 transition-colors shadow-lg">
            <i className="fa-solid fa-user-gear text-white text-2xl"></i>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        
        <div className="absolute inset-0 flex pointer-events-none">
          {/* Left Side - Illustration */}
          <div className="flex-1 min-h-full flex items-center justify-center p-8 relative">
          </div>

          {/* Right Side */}
          <div className="flex-1 min-h-full flex items-center left-30 justify-end relative pointer-events-auto">
            <div className="relative z-10 flex flex-col items-center gap-4 mr-8">
              <Image
                src={alder}
                alt="Alder"
                width={360}
                height={360}
                className="w-250 max-w-[60%] h-auto drop-shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
                priority
              />
              <div className="bg-[#8e82ff] bg-opacity-75 bg-gradient-to-r px-8 py-3 border-3 border-[#a99bff] rounded-lg shadow-lg">
                <span className="text-white font-bold text-lg">Pseudo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Play Button */}
        <div className="relative z-20 flex flex-col items-center justify-center gap-6">
          <div
            className="bg-black p-0.5 shadow-2xl transform-gpu transition-transform origin-center hover:scale-105"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <div
              className="bg-[#ffdb4c] p-2"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <button
                onClick={() => setShowPopup(true)}
                className="w-80 h-90 bg-[#ffdb4c] text-[#fff46d] font-black text-7xl italic uppercase tracking-wide flex items-center justify-center"
                style={{ 
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  WebkitTextStroke: '1px black'
                }}
              >
                Play
              </button>
            </div>
          </div>
          
          {/* Deck Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDeckDropdown(!showDeckDropdown)}
              className="flex items-center bg-gray-600 text-white pl-1 pr-2 py-0.5 rounded-lg border-2 border-gray-800 shadow-lg hover:bg-gray-500 transition-colors min-w-[220px] h-18"
            >
              <div className="w-35 h-35 flex items-center justify-start overflow-visible -ml-8 mr-1 relative z-10 -translate-y-5">
                <Image
                  src={flygon}
                  alt="Flygon"
                  width={800}
                  height={800}
                  className="w-30 h-30 object-contain"
                  style={{ 
                    imageRendering: 'pixelated',
                    filter: 'brightness(1) contrast(1.5) saturate(1)'
                  }}
                  priority
                />
              </div>
              <span className="flex-1 text-center font-bold text-3xl mx-1 -translate-x-4">{selectedDeck}</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${showDeckDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDeckDropdown && (
              <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl overflow-hidden z-30">
                {decks.map((deck) => (
                  <button
                    key={deck}
                    onClick={() => {
                      setSelectedDeck(deck);
                      setShowDeckDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      🐉
                    </div>
                    <span className="font-bold text-lg">{deck}</span>
                  </button>
                ))}
              </div>
            )}
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


"use client";

import { useState } from "react";
import Image from "next/image";

export default function SocialPage() {
  const [selectedUser, setSelectedUser] = useState("SunMiaou");
  const [message, setMessage] = useState("");

  const users = [
    { name: "Sauralt", avatar: "🦎", hasNotification: false },
    { name: "Xoco", avatar: "🦇", hasNotification: true },
    { name: "SunMiaou", avatar: "👩‍🦰", hasNotification: false },
  ];

  const messages = [
    { id: 1, sender: "SunMiaou", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sagittis eu ex vel fermentum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.", isMine: false },
    { id: 2, sender: "me", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sagittis eu ex vel fermentum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.", isMine: true },
    { id: 3, sender: "SunMiaou", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sagittis eu ex vel fermentum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Pellentesque sodales risus sed interstittor, ut imperdiet orci elementum. Donec ipsum diam, sollicitudin eu dui at, venenatis sollicitudin turpis. Nulla aliquet venenatis faucibus. Aenean ut lobortis nibh, a hendrerit felis. Praesent placerat, nulla a rhoncus cursus, dolor risus venenatis tortor, vel mollis quam nisi finibus est. Mauris scelerisque luctus tempus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in lorem vitae erat lobortis consequat.", isMine: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-8">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(45deg, #000000, #1a1a1a, #333333, #4d4d4d, #333333, #1a1a1a, #000000)',
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
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-7xl h-[90vh] flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b bg-[#0d0c10] flex flex-col shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 bg-[#0d0c10">
          <h1 className="text-white text-4xl  font-bold">Social</h1>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-200 p-4 space-y-1">
          {users.map((user) => (
            <button
              key={user.name}
              onClick={() => setSelectedUser(user.name)}
              className={`w-full flex rounded-lg items-center bg-[#545359] gap-3 border-1 border-gray-700 px-10 py-2 transition-colors relative ${
                selectedUser === user.name
                  ? "bg-[#6c87b0] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
              <span className="font-semibold text-lg">{user.name}</span>
              {user.hasNotification && (
                <div className="absolute top-3 right-6 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <div className="p-4">
          <button className="w-full bg-[#82b06c] hover:bg-green-500 text-white rounded-xl py-4 text-3xl font-bold transition-colors">
            +
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-700 border-1 border-[#9a6fbf] px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1b1921] flex items-center justify-center text-3xl">
              👩‍🦰
            </div>
            <h2 className="text-white text-2xl font-bold">{selectedUser}</h2>
          </div>
          <a href="/home">
            <button className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-xl flex items-center justify-center text-white text-2xl transition-colors">
              ✕
            </button>
          </a>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1b1921] space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  msg.isMine
                    ? "bg-[#8dd9ff] text-gray-900"
                    : "bg-white text-gray-900"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-[#1b1921]">
          <div className="flex items-center gap-3 bg-gray-700 rounded-full px-4 py-3">
            <button className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-gray-500 transition-colors">
              <span className="text-xl">⊕</span>
            </button>
            <input
              type="text"
              placeholder={`Envoyez un message à @${selectedUser}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";
const cynthia = "https://archives.bulbagarden.net/media/upload/8/83/Spr_B2W2_Cynthia.png";
const n = "https://archives.bulbagarden.net/media/upload/2/2c/Spr_B2W2_N.png";

export default function SocialPage() {
  const [selectedUser, setSelectedUser] = useState("SunMiaou");
  const [message, setMessage] = useState("");

  const users = [
    { name: "Sauralt", avatar: alder, hasNotification: false, isImage: true, height: 56, width: 56 },
    { name: "Xoco", avatar: n, hasNotification: true, isImage: true, height: 84, width: 64 },
    { name: "SunMiaou", avatar: cynthia, hasNotification: false, isImage: true, height: 50, width: 59 },
  ];

  const messages = [
    { id: 1, sender: "SunMiaou", text: "J'aime les gosses.", isMine: false },
    { id: 2, sender: "me", text: "Moi aussi gros.", isMine: true },
    { id: 3, sender: "SunMiaou", text: "Wsh dinguerie vient sur mon ile tu verras", isMine: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-8">

      {/* Main Container */}
      <div className="w-full max-w-7xl h-[90vh] flex rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b bg-[#0d0c10] flex flex-col shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 bg-[#0d0c10]">
          <h1 className="text-white text-5xl text-center justify-center font-bold">Social</h1>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {users.map((user) => (
            <button
              key={user.name}
              onClick={() => setSelectedUser(user.name)}
              className={`w-full flex rounded-2xl items-center bg-[#545359] gap-3 border-2 border-gray-400 px-6 py-1.5 h-12 transition-colors relative overflow-visible ${
                selectedUser === user.name
                  ? "bg-[#6c87b0] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="w-14 h-14 flex items-center justify-center text-4xl absolute left-1 -top-3">
                {user.isImage ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={user.width}
                    height={user.height}
                    className="w-13 h-13 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    unoptimized
                  />
                ) : (
                  user.avatar
                )}
              </div>
              <span className="font-semibold text-base ml-10">{user.name}</span>
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
          <button className="w-full bg-[#82b06c] hover:bg-green-500 text-white rounded-lg py-2 text-2xl font-bold transition-colors">
            +
          </button>
        </div>
      </div>

      <div className="w-[2px] bg-gray-800"></div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-between shadow-lg rounded-tr-3xl">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center relative overflow-visible">
              {users.find(u => u.name === selectedUser)?.isImage ? (
                <Image
                  src={users.find(u => u.name === selectedUser)?.avatar || ""}
                  alt={selectedUser}
                  width={120}
                  height={120}
                  className="w-30 h-30 object-contain absolute"
                  style={{ imageRendering: 'pixelated' }}
                  unoptimized
                />
              ) : (
                <div className="text-4xl">{users.find(u => u.name === selectedUser)?.avatar}</div>
              )}
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
          <div className="flex items-center gap-3 bg-gray-700 rounded-full px-3 py-2">
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

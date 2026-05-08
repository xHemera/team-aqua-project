"use client";

import { useState, useEffect } from "react";
import { CHARACTERS, PLAYER_RESOURCES, MAX_CHARACTER_LEVEL, MAX_SKILL_LEVEL } from "./characters-data";
import CharacterViewer from "@/components/organisms/characters/CharacterViewer";
import Sidebar from "@/components/Sidebar";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import { socket } from "../../socket"
import { authClient } from "@/lib/auth-client";

export default function CharactersPage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(CHARACTERS[0]?.id ?? "");

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedCharacterId) ?? CHARACTERS[0];
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name)
        setUserPseudo(data.user.name);
    };

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!userPseudo || socket.connected) return;

    const timeoutId = window.setTimeout(() => {
      socket.connect();
      socket.emit("login", userPseudo);

      socket.on("online_users", (users) => {
        console.log("Users from Redis:", users);
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      socket.off("online_users");
    };
  }, []);

  useEffect(() => {
    if (!userPseudo) return;
    socket.on("received", async ({sender, receiver, msg}) => {
      setNotification(msg);
      setNotifSender(sender);
      setShowNotification(true);
    })
  }, [userPseudo])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0c0a0f] font-serif">
      {showNotification && notification && notifSender && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification} sender={notifSender} />)}
      {/* Sidebar */}
      <div className="shrink-0 p-3">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-3 pl-0">
        {selectedCharacter && (
          <CharacterViewer
            characters={CHARACTERS}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacterId}
            resources={PLAYER_RESOURCES}
            maxCharacterLevel={MAX_CHARACTER_LEVEL}
            maxSkillLevel={MAX_SKILL_LEVEL}
          />
        )}
      </main>
    </div>
  );
}

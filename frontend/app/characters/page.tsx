"use client";

import { useState } from "react";
import { CHARACTERS, PLAYER_RESOURCES, MAX_CHARACTER_LEVEL, MAX_SKILL_LEVEL } from "./characters-data";
import CharacterViewer from "@/components/organisms/characters/CharacterViewer";
import Sidebar from "@/components/Sidebar";

export default function CharactersPage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(CHARACTERS[0]?.id ?? "");

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedCharacterId) ?? CHARACTERS[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0c0a0f] font-serif">
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

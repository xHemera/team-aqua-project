"use client";

import { useMemo, useState } from "react";
import type { CharacterData, CharacterSkill, PlayerResources } from "./types";
import { calculatePower, formatCompactPower } from "./character-utils";
import { CHARACTER_ROLES } from "./character-config";
import CharacterSelectionPanel from "./CharacterSelectionPanel";
import CharacterDisplayPanel from "./CharacterDisplayPanel";
import CharacterDetailsPanel from "./CharacterDetailsPanel";

interface CharacterViewerProps {
  characters: CharacterData[];
  selectedCharacter: CharacterData;
  onSelectCharacter: (id: string) => void;
  resources: PlayerResources;
  maxCharacterLevel: number;
  maxSkillLevel: number;
}

export default function CharacterViewer({
  characters,
  selectedCharacter,
  onSelectCharacter,
  resources,
  maxCharacterLevel,
  maxSkillLevel,
}: CharacterViewerProps) {
  const [selectedSkill, setSelectedSkill] = useState<CharacterSkill | null>(null);
  const [upgradeAnimating, setUpgradeAnimating] = useState<string | null>(null);

  const power = useMemo(() => calculatePower(selectedCharacter.stats), [selectedCharacter.stats]);
  const characterRole = CHARACTER_ROLES[selectedCharacter.name] ?? {
    title: "Adventurer",
    color: "#c9a227",
    icon: "fa-user",
  };

  const canUpgradeSkill = (skill: CharacterSkill) => {
    return skill.level < maxSkillLevel && resources.ruby >= skill.cost;
  };

  const handleUpgradeSkill = (skillId: string) => {
    setUpgradeAnimating(skillId);
    setTimeout(() => setUpgradeAnimating(null), 600);
  };

  return (
    <div className="relative flex h-full overflow-hidden bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <CharacterSelectionPanel
        characters={characters}
        selectedCharacterId={selectedCharacter.id}
        onSelectCharacter={onSelectCharacter}
      />

      <CharacterDisplayPanel
        selectedCharacter={selectedCharacter}
        characterRoleTitle={characterRole.title}
        characterRoleColor={characterRole.color}
        powerLabel={formatCompactPower(power)}
      />

      <CharacterDetailsPanel
        selectedCharacter={selectedCharacter}
        selectedSkill={selectedSkill}
        resources={resources}
        maxSkillLevel={maxSkillLevel}
        upgradeAnimatingSkillId={upgradeAnimating}
        onToggleSkill={(skill) => setSelectedSkill(selectedSkill?.id === skill.id ? null : skill)}
        onUpgradeSkill={handleUpgradeSkill}
        canUpgradeSkill={canUpgradeSkill}
      />
    </div>
  );
}

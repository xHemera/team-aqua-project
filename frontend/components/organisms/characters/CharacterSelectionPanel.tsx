import type { CharacterData } from "./types";
import { CHARACTER_ROLES } from "./character-config";
import CharacterPortraitOption from "@/components/molecules/characters/CharacterPortraitOption";

type CharacterSelectionPanelProps = {
  characters: CharacterData[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
};

// Organism: panneau gauche de selection des personnages.
export default function CharacterSelectionPanel({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}: CharacterSelectionPanelProps) {
  return (
    <div className="z-20 flex w-24 flex-col gap-2 border-r border-[#c9a227]/20 bg-[#0c0a0f]/95 p-3">
      {characters.map((character) => {
        const isSelected = character.id === selectedCharacterId;
        const role = CHARACTER_ROLES[character.name];

        return (
          <CharacterPortraitOption
            key={character.id}
            character={character}
            isSelected={isSelected}
            accentColor={role?.color || "#c9a227"}
            onSelect={onSelectCharacter}
          />
        );
      })}
    </div>
  );
}

import Image from "next/image";
import type { CharacterData } from "@/components/organisms/characters/types";

type CharacterPortraitOptionProps = {
  character: CharacterData;
  isSelected: boolean;
  accentColor: string;
  onSelect: (id: string) => void;
};

// Molecule: vignette de selection de personnage.
export default function CharacterPortraitOption({
  character,
  isSelected,
  accentColor,
  onSelect,
}: CharacterPortraitOptionProps) {
  return (
    <button
      onClick={() => onSelect(character.id)}
      className={`group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all duration-300 ${
        isSelected
          ? "border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.4)]"
          : "border-[#2a2638]/50 opacity-70 hover:opacity-100"
      }`}
    >
      <Image
        src={character.portrait}
        alt={character.name}
        fill
        className="object-cover"
        style={{ transform: isSelected ? "scale(1.05)" : "scale(1)" }}
      />
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isSelected ? "bg-transparent" : "bg-black/30"
        }`}
      />
      {isSelected && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: accentColor }}
        />
      )}
    </button>
  );
}

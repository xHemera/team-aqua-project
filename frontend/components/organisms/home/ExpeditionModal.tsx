import Image from "next/image";
import Button from "@/components/atoms/Button";
import FeatureModalFrame from "@/components/molecules/home/FeatureModalFrame";

type ExpeditionCharacter = {
  id: string;
  name: string;
  portrait: string;
};

type ExpeditionDuration = {
  id: string;
  label: string;
  seconds: number;
  xp: number;
  gold: number;
};

type ExpeditionModalProps = {
  open: boolean;
  characters: ExpeditionCharacter[];
  durations: ExpeditionDuration[];
  selectedCharacterId: string | null;
  selectedDurationId: string;
  expeditionActive: boolean;
  onClose: () => void;
  onSelectCharacter: (id: string) => void;
  onSelectDuration: (id: string) => void;
  onStart: () => void;
};

// Organism: modal d'expedition avec choix perso + duree.
export default function ExpeditionModal({
  open,
  characters,
  durations,
  selectedCharacterId,
  selectedDurationId,
  expeditionActive,
  onClose,
  onSelectCharacter,
  onSelectDuration,
  onStart,
}: ExpeditionModalProps) {
  return (
    <FeatureModalFrame open={open} title="Expedition" icon="fa-compass" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {characters.map((character) => {
            const selected = character.id === selectedCharacterId;
            return (
              <button
                key={character.id}
                type="button"
                onClick={() => onSelectCharacter(character.id)}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  selected
                    ? "border-[#e6c55a] shadow-[0_0_0_1px_rgba(230,197,90,0.4)]"
                    : "border-[#3b304d] hover:border-[#6e5a8b]"
                }`}
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image src={character.portrait} alt={character.name} fill className="object-cover" />
                </div>
                <div className="bg-[#1a1422] px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#ead9aa]">
                  {character.name}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {durations.map((duration) => {
            const selected = duration.id === selectedDurationId;
            return (
              <button
                key={duration.id}
                type="button"
                onClick={() => onSelectDuration(duration.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  selected
                    ? "border-[#e6c55a] bg-[#2b2138] text-[#f5e6c8]"
                    : "border-[#433556] bg-[#171220] text-[#cdbd90]"
                }`}
              >
                {duration.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#c9a227]/25 bg-[#171220] p-3 text-xs uppercase tracking-wide text-[#d8c79d]">
          {expeditionActive ? "Expedition already active" : "Select hero and duration"}
        </div>

        <Button
          type="button"
          onClick={onStart}
          disabled={!selectedCharacterId || expeditionActive}
          className="w-full font-bold uppercase tracking-[0.08em]"
        >
          Send
        </Button>
      </div>
    </FeatureModalFrame>
  );
}

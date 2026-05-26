"use client";

import { spells } from "@/app/game";
import SpellSelector from "@/components/molecules/game/SpellSelector";
import ProfileInfo from "@/components/atoms/game/ProfileInfo";
import ManaBar from "@/components/atoms/game/ManaBar";
import type { CharacterData } from "@/components/organisms/characters/types";
import { CHARACTERS } from "@/public/gameResources/heroes";
import { useRouter } from "next/navigation";

type BottomBarProps = {
  isYourTurn: boolean;
  activeMp: number;
  confirmForfeit: boolean;
  setConfirmForfeit: (v: boolean) => void;
  selectedHeroCard: (typeof CHARACTERS)[number];
  selectedCharacter: CharacterData | null;
  handleCastSpell: (type: "basic" | "skill", skillId?: string) => void;
  handleSkipTurn: () => void;
  userPseudo: string;
  userAvatar: string | null;
};

export default function BottomBar({
  isYourTurn,
  activeMp,
  confirmForfeit,
  setConfirmForfeit,
  selectedHeroCard,
  selectedCharacter,
  handleCastSpell,
  handleSkipTurn,
  userPseudo,
  userAvatar,
}: BottomBarProps) {
  const router = useRouter();

  const forfeitBtn = confirmForfeit ? (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => { spells.forfeit(); setConfirmForfeit(false); router.push("/home"); }}
        className="group relative w-full overflow-hidden rounded-md border-2 border-red-700 bg-gradient-to-b from-[#2a0a0a] to-[#1a0505] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-red-300 transition-all duration-150 hover:border-red-500 hover:text-red-100 hover:shadow-[0_0_14px_rgba(200,0,0,0.2)] md:w-auto"
      >
        <span className="relative z-10">Confirm forfeit?</span>
      </button>
      <button
        type="button"
        onClick={() => setConfirmForfeit(false)}
        className="group relative w-full overflow-hidden rounded-md border-2 border-[#3a3a3a] bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-[#8a8a8a] transition-all duration-150 hover:border-[#6a6a6a] hover:text-[#b0b0b0] md:w-auto"
      >
        <span className="relative z-10">Cancel</span>
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setConfirmForfeit(true)}
      className="group relative w-full overflow-hidden rounded-md border-2 border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-[#c9b896] transition-all duration-150 hover:border-[#c9a84c] hover:text-[#e8dcc8] hover:shadow-[0_0_14px_rgba(201,168,76,0.12)] md:w-auto"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c9a84c]/5 to-transparent" />
      </div>
      <span className="relative z-10">Forfeit</span>
    </button>
  );

  const manaBar = (
    <div className="flex flex-col items-end gap-3">
      <ManaBar currentMana={activeMp} />
    </div>
  );

  const userInfo = (
    <ProfileInfo
      account={{ pseudo: userPseudo, profilePhoto: userAvatar }}
      className="self-end"
    />
  );

  return isYourTurn ? (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] gap-3 sm:gap-4 md:grid-cols-[minmax(0,7fr)_minmax(240px,280px)] md:items-stretch">
      <div className="min-w-0 flex flex-col gap-2">
        <SpellSelector
          hero={selectedHeroCard}
          character={selectedCharacter}
          activeMp={activeMp}
          onCastSpell={handleCastSpell}
          className="w-full"
        />
        <button
          type="button"
          onClick={handleSkipTurn}
          className="group relative w-full overflow-hidden rounded-md border border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-3 py-1.5 font-serif text-xs tracking-wide text-[#6a5a4a] transition-all duration-150 hover:border-[#5a4a3a] hover:text-[#8a7a5a]"
        >
          Skip Turn
        </button>
      </div>
      <div className="flex flex-col items-end gap-3 md:h-full md:justify-between">
        {manaBar}
        {forfeitBtn}
        {userInfo}
      </div>
    </div>
  ) : (
    <div className="flex w-full justify-end">
      <div className="flex flex-col items-end gap-3">
        {manaBar}
        {forfeitBtn}
        {userInfo}
      </div>
    </div>
  );
}

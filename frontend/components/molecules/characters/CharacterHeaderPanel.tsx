import UpgradeActionButton from "@/components/atoms/characters/UpgradeActionButton";
import {
  calculatePower,
  formatCompactPower,
  getLevelUpState,
} from "@/components/organisms/characters/character-utils";
import type { CharacterData } from "@/components/organisms/characters/types";

type CharacterHeaderPanelProps = {
  character: CharacterData;
  maxCharacterLevel: number;
  availableCoin: number;
};

export default function CharacterHeaderPanel({
  character,
  maxCharacterLevel,
  availableCoin,
}: CharacterHeaderPanelProps) {
  const xpWidth = `${Math.min(100, Math.max(0, character.xpPercent))}%`;
  const calculatedPower = calculatePower(character.stats);
  const compactPower = formatCompactPower(calculatedPower);
  const isCharacterXpFull = character.xpPercent >= 100;
  const characterLevelUp = getLevelUpState(
    character.level,
    maxCharacterLevel,
    character.levelUpCost,
    availableCoin,
  );

  return (
    <div className="relative rounded-2xl border border-[#3c3650] bg-[#120f1a] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[4px] border-[#2e2743] bg-[#171320] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)] sm:h-28 sm:w-28">
          <img src={character.portrait} alt={character.name} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-3xl font-extrabold leading-none text-white sm:text-4xl">
              {character.name}
            </h2>
            <span className="shrink-0 rounded-full border border-[#99e0a6] bg-[#aef0b9] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#17331f] sm:text-sm">
              Lv. {character.level}
            </span>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-[#5e4d25] bg-gradient-to-r from-[#2b2412] via-[#3a2f14] to-[#2a2411] px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,229,160,0.18)]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8d18f] sm:text-xs">
                <i className="fa-solid fa-bolt text-[#ffd36f]" aria-hidden="true" />
              </div>
              <p
                className="min-w-0 flex-1 truncate text-right text-xl font-extrabold tracking-wide text-[#fff2cc] sm:text-2xl"
                title={calculatedPower.toLocaleString("fr-FR")}
              >
                {compactPower}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="shrink-0 text-base text-gray-400" title="Experience" aria-label="Experience">
          <i className="fa-solid fa-chart-line" aria-hidden="true" />
        </span>
        <div className="h-6 flex-1 overflow-hidden rounded-md border-[3px] border-[#110d18] bg-[#ececec]">
          <div className="h-full bg-gradient-to-r from-[#6bcf98] to-[#95e2b4]" style={{ width: xpWidth }} />
        </div>
        {isCharacterXpFull && (
          <UpgradeActionButton
            canLevelUp={characterLevelUp.canLevelUp}
            disabled={!characterLevelUp.canLevelUp}
            variant="ghost"
            className="h-8 shrink-0 px-3 text-xs sm:h-9 sm:text-sm"
            title="Ameliorer le personnage"
            ariaLabel="Ameliorer le personnage"
            iconOnly
          />
        )}
      </div>
    </div>
  );
}

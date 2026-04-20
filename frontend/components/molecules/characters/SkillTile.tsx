import UpgradeActionButton from "@/components/atoms/characters/UpgradeActionButton";
import {
  getLevelUpState,
  getSkillTooltipPositionClassName,
  resolveSkillEffect,
} from "@/components/organisms/characters/character-utils";
import type { CharacterSkill, CharacterStats } from "@/components/organisms/characters/types";

type SkillTileProps = {
  skill: CharacterSkill;
  stats: CharacterStats;
  skillIndex: number;
  maxSkillLevel: number;
  availableRuby: number;
};

export default function SkillTile({
  skill,
  stats,
  skillIndex,
  maxSkillLevel,
  availableRuby,
}: SkillTileProps) {
  const skillLevelUp = getLevelUpState(skill.level, maxSkillLevel, skill.cost, availableRuby);
  const skillEffect = resolveSkillEffect(skill, stats);

  return (
    <div className="relative z-0 text-center hover:z-50">
      <div className="group relative mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-[#4a4266] bg-transparent sm:h-16 sm:w-16">
        <span className="absolute -left-2 -top-2 rounded-full border border-[#4a4266] bg-[#171320] px-1.5 py-0.5 text-[10px] font-bold leading-none text-gray-100 shadow-md">
          Lv {skill.level}
        </span>
        <img src={skill.image} alt={skill.name} className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
        {skillEffect && (
          <div
            className={`pointer-events-none absolute top-full z-[999] mt-3 hidden w-[min(18rem,calc(100vw-1rem))] rounded-xl border border-[#4b4264] bg-[#120f1a] px-3 py-2 text-left text-xs text-gray-100 shadow-2xl group-hover:block ${getSkillTooltipPositionClassName(skillIndex)}`}
          >
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#e8d18f]">
              <img src={skill.image} alt={skill.name} className="h-5 w-5 shrink-0 object-contain" />
              {skillEffect.title}
            </p>
            <p className="mt-1 whitespace-pre-line break-words leading-snug text-gray-200">
              {skillEffect.segments.map((segment, segmentIndex) => (
                <span
                  key={`${skill.id}-effect-${segmentIndex}`}
                  className={segment.highlight ? "font-extrabold text-[#a78bfa]" : undefined}
                >
                  {segment.text}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2">
        <UpgradeActionButton
          canLevelUp={skillLevelUp.canLevelUp}
          disabled={!skillLevelUp.canLevelUp}
          variant="secondary"
          className="h-8 w-full text-xs sm:text-sm"
          title={`Ameliorer ${skill.name}`}
          ariaLabel={`Ameliorer ${skill.name}`}
        />
      </div>
    </div>
  );
}

import Image from "next/image";
import type { CharacterSkill, CharacterStats } from "@/components/organisms/characters/types";
import { resolveSkillDescription } from "@/components/organisms/characters/character-utils";
import { SKILL_TYPE_CONFIG, getSkillType } from "@/components/organisms/characters/character-config";

type SkillCardProps = {
  skill: CharacterSkill;
  stats: CharacterStats;
  maxSkillLevel: number;
  selectedSkillId: string | null;
  canUpgrade: boolean;
  isAnimating: boolean;
  onToggleDetails: (skill: CharacterSkill) => void;
  onUpgrade: (skillId: string) => void;
};

// Molecule: carte de competence interactive avec details et progression.
export default function SkillCard({
  skill,
  stats,
  maxSkillLevel,
  selectedSkillId,
  canUpgrade,
  isAnimating,
  onToggleDetails,
  onUpgrade,
}: SkillCardProps) {
  const skillType = getSkillType(skill, maxSkillLevel);
  const config = SKILL_TYPE_CONFIG[skillType];
  const isMaxLevel = skill.level >= maxSkillLevel;
  const resolved = resolveSkillDescription(skill.description, stats, skill);

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
        selectedSkillId === skill.id
          ? "border-[#c9a227]/50 bg-[#1e1a24]"
          : "border-[#c9a227]/10 bg-[#15121a]/60 hover:border-[#c9a227]/30"
      }`}
      onClick={() => onToggleDetails(skill)}
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: config.color }}
      />

      <div className="p-3 pl-4">
        <div className="flex items-start gap-3">
          <div
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2"
            style={{
              borderColor: isMaxLevel ? "#c9a227" : config.borderColor,
              boxShadow: isMaxLevel ? "0 0 10px rgba(201,162,39,0.3)" : "none",
            }}
          >
            <Image
              src={skill.image}
              alt={skill.name}
              fill
              className="object-cover"
            />
            <div
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: isMaxLevel ? "#c9a227" : "#0c0a0f",
                color: isMaxLevel ? "#1a1510" : "#f5e6c8",
                border: `1px solid ${isMaxLevel ? "#c9a227" : config.color}`,
                fontFamily: "var(--font-display), serif",
              }}
            >
              {skill.level}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-[#f5e6c8]"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {skill.name}
              </span>
              {isMaxLevel && (
                <span className="flex items-center gap-1 rounded bg-[#c9a227]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9a227]">
                  <i className="fa-solid fa-crown text-[8px]" />
                  Max
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </span>

            {selectedSkillId === skill.id && (
              <div className="mt-2 text-sm leading-relaxed text-[#c9b896]">
                {resolved.segments.map((segment, idx) =>
                  segment.highlight ? (
                    <span
                      key={idx}
                      className="font-bold"
                      style={{ color: config.color }}
                    >
                      {segment.text}
                    </span>
                  ) : (
                    <span key={idx}>{segment.text}</span>
                  ),
                )}
              </div>
            )}
          </div>

          {!isMaxLevel && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onUpgrade(skill.id);
              }}
              disabled={!canUpgrade}
              className={`shrink-0 rounded border px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                canUpgrade
                  ? "border-[#c9a227]/50 bg-[#c9a227]/10 text-[#f5e6c8] hover:bg-[#c9a227]/20 hover:border-[#c9a227]"
                  : "cursor-not-allowed border-[#2a2638] bg-black/30 text-[#5a5668]"
              }`}
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {isAnimating ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-arrow-up text-[10px]" />
                  <span>{skill.cost}</span>
                  <i className="fa-solid fa-gem text-[#cd5c5c] text-[10px]" />
                </div>
              )}
            </button>
          )}
        </div>

        {!isMaxLevel ? (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(skill.level / maxSkillLevel) * 100}%`,
                backgroundColor: config.color,
                opacity: 0.7,
              }}
            />
          </div>
        ) : (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#c9a227]/20">
            <div className="h-full w-full rounded-full bg-[#c9a227]" />
          </div>
        )}
      </div>
    </div>
  );
}

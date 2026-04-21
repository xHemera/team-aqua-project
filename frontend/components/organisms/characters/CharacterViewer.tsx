"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { CharacterData, CharacterSkill, CharacterStats, PlayerResources } from "./types";
import { formatCompactPower, calculatePower, getLevelUpState, resolveSkillDescription } from "./character-utils";

const CHARACTER_ROLES: Record<string, { title: string; color: string; icon: string }> = {
  Archer: { title: "Wind Ranger", color: "#4fc3f7", icon: "fa-wind" },
  Assassin: { title: "Shadowblade", color: "#ff5252", icon: "fa-skull" },
  Healer: { title: "Divine Oracle", color: "#69f0ae", icon: "fa-hands-praying" },
  Knight: { title: "Iron Guardian", color: "#ffd740", icon: "fa-shield-halved" },
  Mage: { title: "Arcane Weaver", color: "#e040fb", icon: "fa-hat-wizard" },
};

const SKILL_TYPE_CONFIG: Record<string, { color: string; icon: string; label: string; borderColor: string }> = {
  attack: { color: "#cd5c5c", icon: "fa-fire", label: "Offensive", borderColor: "rgba(205, 92, 92, 0.5)" },
  heal: { color: "#8fbc8f", icon: "fa-heart-pulse", label: "Healing", borderColor: "rgba(143, 188, 143, 0.5)" },
  buff: { color: "#daa520", icon: "fa-shield-halved", label: "Buff", borderColor: "rgba(218, 165, 32, 0.5)" },
  debuff: { color: "#9370db", icon: "fa-skull", label: "Debuff", borderColor: "rgba(147, 112, 219, 0.5)" },
  ultimate: { color: "#ffd700", icon: "fa-meteor", label: "Ultimate", borderColor: "rgba(255, 215, 0, 0.6)" },
};

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

  const getSkillType = (skill: CharacterSkill): keyof typeof SKILL_TYPE_CONFIG => {
    const name = skill.name.toLowerCase();
    if (skill.level >= maxSkillLevel) return "ultimate";
    if (name.includes("meteor") || name.includes("sanctuary") || name.includes("last stand") || name.includes("divine protection")) return "ultimate";
    if (name.includes("heal") || name.includes("restoration")) return "heal";
    if (name.includes("boost") || name.includes("fortify") || name.includes("amplify") || name.includes("focus") || name.includes("will")) return "buff";
    if (name.includes("silence") || name.includes("stun") || name.includes("venom") || name.includes("poison") || name.includes("bash")) return "debuff";
    return "attack";
  };

  const canUpgradeSkill = (skill: CharacterSkill) => {
    return skill.level < maxSkillLevel && resources.ruby >= skill.cost;
  };

  const handleUpgradeSkill = (skillId: string) => {
    setUpgradeAnimating(skillId);
    setTimeout(() => setUpgradeAnimating(null), 600);
  };

  const offenseStats = [
    { key: "physicalDamage", label: "Physical ATK", icon: "fa-hand-fist", shortLabel: "P.ATK" },
    { key: "magicalDamage", label: "Magical ATK", icon: "fa-wand-magic-sparkles", shortLabel: "M.ATK" },
    { key: "critChance", label: "Critical Rate", icon: "fa-crosshairs", suffix: "%", shortLabel: "Crit%" },
    { key: "critDamage", label: "Critical Damage", icon: "fa-burst", suffix: "%", shortLabel: "Crit DMG" },
  ];

  const defenseStats = [
    { key: "hp", label: "Health Points", icon: "fa-heart", shortLabel: "HP" },
    { key: "mp", label: "Mana Points", icon: "fa-droplet", shortLabel: "MP" },
    { key: "physicalResistance", label: "Physical Resistance", icon: "fa-shield", shortLabel: "P.RES", suffix: "%" },
    { key: "magicalResistance", label: "Magical Resistance", icon: "fa-wand-magic-sparkles", shortLabel: "M.RES", suffix: "%" },
  ];

  const utilityStats = [
    { key: "speed", label: "Speed", icon: "fa-bolt", shortLabel: "SPD" },
  ];

  return (
    <div className="relative flex h-full overflow-hidden bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Left Panel - Character Selection */}
      <div className="z-20 flex w-24 flex-col gap-2 border-r border-[#c9a227]/20 bg-[#0c0a0f]/95 p-3">
        {characters.map((char) => {
          const isSelected = char.id === selectedCharacter.id;
          const role = CHARACTER_ROLES[char.name];
          return (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                isSelected
                  ? "border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.4)]"
                  : "border-[#2a2638]/50 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={char.portrait}
                alt={char.name}
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
                  style={{ background: role?.color || "#c9a227" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Center - Character Display */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${characterRole.color}, transparent 60%)`,
          }}
        />

        {/* Character Header */}
        <div className="absolute left-6 top-6 z-10">
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {characterRole.title}
            </span>
            <h1
              className="text-5xl font-black text-[#f5e6c8]"
              style={{
                fontFamily: "var(--font-display), serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 40px rgba(201,162,39,0.3)",
              }}
            >
              {selectedCharacter.name}
            </h1>
          </div>

          {/* Level Badge */}
          <div className="mt-4 flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#c9a227] bg-gradient-to-br from-[#c9a227] to-[#8b6914] text-sm font-bold text-[#1a1510] shadow-lg"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {selectedCharacter.level}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 overflow-hidden rounded-full border border-[#c9a227]/30 bg-black/50">
                <div
                  className="h-full bg-gradient-to-r from-[#c9a227] to-[#f4e4a6]"
                  style={{ width: `${selectedCharacter.xpPercent}%` }}
                />
              </div>
              <span className="text-xs text-[#8a7a5a]">{selectedCharacter.xpPercent}%</span>
            </div>
          </div>

          {/* Power Rating */}
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#c9a227]/30 bg-black/40 px-4 py-2 backdrop-blur-sm">
            <i className="fa-solid fa-gem text-[#c9a227]" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#8a7a5a]">Power Rating</div>
              <div
                className="text-xl font-bold text-[#f5e6c8]"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {formatCompactPower(power)}
              </div>
            </div>
          </div>
        </div>

        {/* Character Full Body - Large centered display */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative h-[130%] w-full">
            <Image
              src={selectedCharacter.body}
              alt={selectedCharacter.name}
              fill
              className="object-contain object-center"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0c0a0f] via-[#0c0a0f]/80 to-transparent" />
          </div>
        </div>

        {/* Class Badge at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div
            className="text-5xl font-black uppercase tracking-[0.3em] text-[#f5e6c8]/[0.04]"
            style={{
              textShadow: `0 0 60px ${characterRole.color}10`,
              fontFamily: "var(--font-display), serif",
            }}
          >
            {selectedCharacter.name}
          </div>
        </div>
      </div>

      {/* Right Panel - Stats & Skills */}
      <div className="z-20 flex w-[420px] flex-col border-l border-[#c9a227]/20 bg-[#0c0a0f]/95 p-5">
        {/* Resources */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[#c9a227]/30 bg-gradient-to-r from-[#1e1a24] to-[#15121a] px-4 py-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-gem text-[#cd5c5c]" />
            <span className="font-bold text-[#f5e6c8]" style={{ fontFamily: "var(--font-display), serif" }}>
              {resources.ruby}
            </span>
          </div>
          <span className="text-xs uppercase tracking-wider text-[#8a7a5a]">Rubies</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Stats Section Header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
            <span
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#c9a227]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Statistics
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
          </div>

          {/* Offense Stats */}
          <div className="mb-4 rounded-lg border border-[#c9a227]/20 bg-[#15121a]/80 p-4">
            <div
              className="mb-3 text-xs font-bold uppercase tracking-wider text-[#cd5c5c]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Offense
            </div>
            <div className="space-y-3">
              {offenseStats.map((stat) => {
                const value = selectedCharacter.stats[stat.key as keyof CharacterStats];
                const baseValue = selectedCharacter.baseStats[stat.key as keyof CharacterStats];
                const bonus = value - baseValue;
                return (
                  <div key={stat.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#c9b896]">
                      <i className={`fa-solid ${stat.icon} w-4 text-center text-sm text-[#8a7a5a]`} />
                      <span className="text-sm">{stat.shortLabel}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-lg font-bold text-[#f5e6c8]"
                        style={{ fontFamily: "var(--font-display), serif" }}
                      >
                        {value}{stat.suffix || ""}
                      </span>
                      {bonus > 0 && (
                        <span className="text-xs font-medium text-[#8fbc8f]">+{bonus}{stat.suffix || ""}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Defense Stats */}
          <div className="mb-4 rounded-lg border border-[#c9a227]/20 bg-[#15121a]/80 p-4">
            <div
              className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8fbc8f]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Defense
            </div>
            <div className="space-y-3">
              {defenseStats.map((stat) => {
                const value = selectedCharacter.stats[stat.key as keyof CharacterStats];
                const baseValue = selectedCharacter.baseStats[stat.key as keyof CharacterStats];
                const bonus = value - baseValue;
                return (
                  <div key={stat.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#c9b896]">
                      <i className={`fa-solid ${stat.icon} w-4 text-center text-sm text-[#8a7a5a]`} />
                      <span className="text-sm">{stat.shortLabel}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-lg font-bold text-[#f5e6c8]"
                        style={{ fontFamily: "var(--font-display), serif" }}
                      >
                        {value}{stat.suffix || ""}
                      </span>
                      {bonus > 0 && (
                        <span className="text-xs font-medium text-[#8fbc8f]">+{bonus}{stat.suffix || ""}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utility Stats */}
          <div className="mb-6 rounded-lg border border-[#c9a227]/20 bg-[#15121a]/80 p-4">
            <div
              className="mb-3 text-xs font-bold uppercase tracking-wider text-[#dda0dd]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Utility
            </div>
            {utilityStats.map((stat) => {
              const value = selectedCharacter.stats[stat.key as keyof CharacterStats];
              const baseValue = selectedCharacter.baseStats[stat.key as keyof CharacterStats];
              const bonus = value - baseValue;
              return (
                <div key={stat.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#c9b896]">
                    <i className={`fa-solid ${stat.icon} w-4 text-center text-sm text-[#8a7a5a]`} />
                    <span className="text-sm">{stat.shortLabel}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-lg font-bold text-[#f5e6c8]"
                      style={{ fontFamily: "var(--font-display), serif" }}
                    >
                      {value}
                    </span>
                    {bonus > 0 && (
                      <span className="text-xs font-medium text-[#8fbc8f]">+{bonus}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skills Section Header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
            <span
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#c9a227]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Abilities
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
          </div>

          {/* Skills */}
          <div className="space-y-3">
            {selectedCharacter.skills.map((skill) => {
              const skillType = getSkillType(skill);
              const config = SKILL_TYPE_CONFIG[skillType];
              const isMaxLevel = skill.level >= maxSkillLevel;
              const canUpgrade = canUpgradeSkill(skill);
              const isAnimating = upgradeAnimating === skill.id;
              const resolved = resolveSkillDescription(skill.description, selectedCharacter.stats, skill);

              return (
                <div
                  key={skill.id}
                  className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                    selectedSkill?.id === skill.id
                      ? "border-[#c9a227]/50 bg-[#1e1a24]"
                      : "border-[#c9a227]/10 bg-[#15121a]/60 hover:border-[#c9a227]/30"
                  }`}
                  onClick={() => setSelectedSkill(selectedSkill?.id === skill.id ? null : skill)}
                >
                  {/* Type Indicator */}
                  <div
                    className="absolute left-0 top-0 h-full w-1"
                    style={{ backgroundColor: config.color }}
                  />

                  <div className="p-3 pl-4">
                    <div className="flex items-start gap-3">
                      {/* Skill Icon */}
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

                      {/* Skill Info */}
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

                        {/* Expanded Description */}
                        {selectedSkill?.id === skill.id && (
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
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Upgrade Button */}
                      {!isMaxLevel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeSkill(skill.id);
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

                    {/* Level Progress */}
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
            })}
          </div>

          {/* Hint */}
          <div className="mt-4 text-center text-xs italic text-[#5a5668]">
            Click on an ability to view details
          </div>
        </div>
      </div>
    </div>
  );
}

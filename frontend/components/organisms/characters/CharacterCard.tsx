import Card from "@/components/atoms/Card";
import CharacterHeaderPanel from "@/components/molecules/characters/CharacterHeaderPanel";
import CharacterStatsPanel from "@/components/molecules/characters/CharacterStatsPanel";
import SkillTile from "@/components/molecules/characters/SkillTile";
import type { CharacterData, PlayerResources } from "@/components/organisms/characters/types";

type CharacterCardProps = {
  character: CharacterData;
  resources: PlayerResources;
  maxCharacterLevel: number;
  maxSkillLevel: number;
};

export default function CharacterCard({
  character,
  resources,
  maxCharacterLevel,
  maxSkillLevel,
}: CharacterCardProps) {
  return (
    <Card className="relative w-[min(92vw,390px)] shrink-0 overflow-visible border-[#4a4266] bg-[#171320] p-3 shadow-[0_14px_30px_rgba(0,0,0,0.35)] sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#2b2240]/65 to-transparent" />

      <CharacterHeaderPanel
        character={character}
        maxCharacterLevel={maxCharacterLevel}
        availableCoin={resources.coin}
      />

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {character.skills.map((skill, skillIndex) => (
          <SkillTile
            key={skill.id}
            skill={skill}
            stats={character.stats}
            skillIndex={skillIndex}
            maxSkillLevel={maxSkillLevel}
            availableRuby={resources.ruby}
          />
        ))}
      </div>

      <CharacterStatsPanel stats={character.stats} />
    </Card>
  );
}

import { STAT_GROUPS } from "@/components/organisms/characters/character-utils";
import type { CharacterStats } from "@/components/organisms/characters/types";

type CharacterStatsPanelProps = {
  stats: CharacterStats;
};

export default function CharacterStatsPanel({ stats }: CharacterStatsPanelProps) {
  return (
    <div className="mt-3 rounded-xl border border-[#3c3650] bg-[#1b1727] p-3">
      <h3 className="text-xl font-bold text-white sm:text-2xl">Stats</h3>

      <div className="mt-3 space-y-2 text-sm text-gray-200 sm:text-base">
        {STAT_GROUPS.map((group) => (
          <div key={group.id} className="rounded-lg border border-[#3f3657] bg-[#13101d]/80 p-2">
            <div
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.11em] ${group.titleClassName}`}
            >
              {group.title}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-md border border-[#3f3657] bg-[#13101d] px-2 py-1.5"
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-gray-300">
                    <i className={`fa-solid ${item.icon} ${item.iconColor}`} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="font-bold text-white">{stats[item.key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

type MineSectionProps = {
  pseudo: string;
  rubyCount: number;
};

export function MineSection({
  pseudo,
  rubyCount,
}: MineSectionProps) {
  const ruby = "/gameResources/items/ruby.webp";
  const gold = "/gameResources/items/gold.webp";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      {/* Pseudo et ressources */}
      <div className="flex flex-col">
        <span
          className="text-lg font-black uppercase tracking-[0.16em] text-[#f5e6c8]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {pseudo}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c9b48a]">Welcome back</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1e1828] to-[#15121a] px-4 py-2.5 backdrop-blur-sm">
          <span className="inline-flex items-center leading-none text-sm font-bold text-[#f5e6c8]">
            <img src={ruby} alt="Ruby" width={22} height={22} className="mr-2 block" />
            <span className="min-w-[28px] text-right">{rubyCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

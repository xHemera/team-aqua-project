"use client";

type MineSectionProps = {
  pseudo: string;
  rubyCount: number;
  goldCount: number;
};

export function MineSection({
  pseudo,
  rubyCount,
  goldCount,
}: MineSectionProps) {
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
        <div className="rounded-xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1e1828] to-[#15121a] px-4 py-2.5 backdrop-blur-sm">
          <span className="inline-flex items-center gap-2.5 text-sm font-bold text-[#f5e6c8]">
            <i className="fa-solid fa-gem text-lg text-[#ff6b6b]" aria-hidden="true" />
            <span className="min-w-[48px] text-right">{rubyCount}</span>
          </span>
        </div>
        <div className="rounded-xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1e1828] to-[#15121a] px-4 py-2.5 backdrop-blur-sm">
          <span className="inline-flex items-center gap-2.5 text-sm font-bold text-[#f5e6c8]">
            <i className="fa-solid fa-coins text-lg text-[#ffd700]" aria-hidden="true" />
            <span className="min-w-[48px] text-right">{goldCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

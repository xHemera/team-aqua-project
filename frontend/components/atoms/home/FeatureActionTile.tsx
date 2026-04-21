import type { ReactNode } from "react";

type FeatureActionTileProps = {
  title: string;
  icon: string;
  accentClassName: string;
  value?: string;
  content?: ReactNode;
  onClick: () => void;
  className?: string;
};

const joinClasses = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

// Atom: carte d'action principale de la Home, style JRPG lisible.
export default function FeatureActionTile({
  title,
  icon,
  accentClassName,
  value,
  content,
  onClick,
  className,
}: FeatureActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={joinClasses(
        "group relative flex h-full min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#c9a227]/30 bg-[#120f17]/90 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.02] hover:border-[#e6c55a]/60",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className={joinClasses("absolute inset-0", accentClassName)} />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span
          className="text-2xl font-black uppercase tracking-[0.14em] text-[#f5e6c8]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {title}
        </span>
        <i className={`fa-solid ${icon} text-xl text-[#e6c55a]`} aria-hidden="true" />
      </div>

      {content ? <div className="relative z-10 mt-4">{content}</div> : null}

      <div className="relative z-10 mt-6 flex items-center justify-between">
        <div className="h-px flex-1 bg-gradient-to-r from-[#e6c55a]/60 to-transparent" />
        {value ? (
          <span className="ml-3 text-sm font-semibold uppercase tracking-wider text-[#f0dfb1]">{value}</span>
        ) : (
          <span className="ml-3 text-sm font-semibold uppercase tracking-wider text-[#f0dfb1]">Open</span>
        )}
      </div>
    </button>
  );
}

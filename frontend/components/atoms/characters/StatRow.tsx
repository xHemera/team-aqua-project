type StatRowProps = {
  icon: string;
  shortLabel: string;
  value: number;
  suffix?: string;
  bonus: number;
};

// Atom: ligne de statistique reutilisable dans les blocs offense/defense/utility.
export default function StatRow({ icon, shortLabel, value, suffix, bonus }: StatRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-[#c9b896]">
        <i className={`fa-solid ${icon} w-4 text-center text-sm text-[#8a7a5a]`} />
        <span className="text-sm">{shortLabel}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-lg font-bold text-[#f5e6c8]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {value}
          {suffix || ""}
        </span>
        {bonus > 0 && (
          <span className="text-xs font-medium text-[#8fbc8f]">
            +{bonus}
            {suffix || ""}
          </span>
        )}
      </div>
    </div>
  );
}

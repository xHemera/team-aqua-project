type SectionDividerProps = {
  label: string;
};

// Atom: separateur de section avec label centree.
export default function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
      <span
        className="text-xs font-bold uppercase tracking-[0.15em] text-[#c9a227]"
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
    </div>
  );
}

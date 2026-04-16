import Button from "@/components/atoms/Button";

type DeckOptionItemProps = {
  deck: string;
  selected: boolean;
  highlighted?: boolean;
  onSelect: () => void;
};

// Molecule: ligne d'option de deck reutilisable dans les selecteurs de deck.
export default function DeckOptionItem({
  deck,
  selected,
  highlighted = false,
  onSelect,
}: DeckOptionItemProps) {
  return (
    <Button
      type="button"
      onClick={onSelect}
      role="option"
      aria-selected={selected}
      variant={selected ? "primary" : "ghost"}
      className={`h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        selected
          ? "bg-[var(--accent-soft)] hover:bg-[var(--accent-color)]"
          : highlighted
            ? "bg-[var(--accent-soft)] hover:bg-[var(--accent-color)]"
            : "text-gray-200 hover:bg-[#555]"
      }`}
    >
      <span className="flex-1 truncate text-base font-semibold">{deck}</span>
      {selected && <i className="fa-solid fa-check text-[var(--accent-color)]"></i>}
    </Button>
  );
}

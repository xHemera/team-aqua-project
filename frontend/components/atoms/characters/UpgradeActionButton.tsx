import Button from "@/components/atoms/Button";
import { LEVEL_UP_READY_CLASS } from "@/components/organisms/characters/character-utils";

type UpgradeActionButtonProps = {
  canLevelUp: boolean;
  disabled: boolean;
  variant: "ghost" | "secondary";
  className?: string;
  title: string;
  ariaLabel: string;
  iconOnly?: boolean;
};

export default function UpgradeActionButton({
  canLevelUp,
  disabled,
  variant,
  className,
  title,
  ariaLabel,
  iconOnly = false,
}: UpgradeActionButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={`${className ?? ""} ${canLevelUp ? LEVEL_UP_READY_CLASS : ""}`.trim()}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {iconOnly ? <i className="fa-solid fa-arrow-up-right-dots" aria-hidden="true" /> : "Level Up"}
    </Button>
  );
}

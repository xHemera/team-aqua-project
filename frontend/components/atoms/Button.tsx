import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClassName =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "border border-[color:var(--accent-border)] bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]",
  secondary: "border border-[#3c3650] bg-[#302a45] text-gray-100 hover:bg-[#3a3355]",
  ghost: "border border-[#3c3650] bg-[#242033] text-gray-100 hover:bg-[#302a45]",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-4 text-base",
  lg: "h-14 px-5 text-lg",
};

const joinClasses = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

// Atom: bouton de base a reutiliser sur tous les ecrans pour normaliser les variants.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={joinClasses(baseClassName, variantClassName[variant], sizeClassName[size], className)}
      {...props}
    />
  );
});

export default Button;

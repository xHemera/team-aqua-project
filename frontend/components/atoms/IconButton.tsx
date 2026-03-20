import { ButtonHTMLAttributes, forwardRef } from "react";
import Button from "@/components/atoms/Button";

type IconButtonVariant = "primary" | "secondary" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";
type IconButtonShape = "rounded" | "circle";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
};

const sizeClassName: Record<IconButtonSize, string> = {
  sm: "h-9 w-9 p-0",
  md: "h-11 w-11 p-0",
  lg: "h-12 w-12 p-0",
};

const shapeClassName: Record<IconButtonShape, string> = {
  rounded: "rounded-xl",
  circle: "rounded-full",
};

const joinClasses = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

// Atom: bouton icone pour centraliser tailles/etats des actions compactes.
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, variant = "ghost", size = "md", shape = "rounded", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      className={joinClasses(sizeClassName[size], shapeClassName[shape], className)}
      {...props}
    />
  );
});

export default IconButton;

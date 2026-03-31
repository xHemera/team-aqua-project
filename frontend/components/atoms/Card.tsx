import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

const joinClasses = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

// Atom: surface reusable pour cartes/modales afin d'eviter les classes dupliquees.
export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-2xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

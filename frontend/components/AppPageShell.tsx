import { ReactNode } from "react";

type AppPageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  containerClassName?: string;
};

const joinClasses = (...values: Array<string | undefined>) => values.filter(Boolean).join(" ");

export default function AppPageShell({
  children,
  mainClassName,
  containerClassName,
}: AppPageShellProps) {
  return (
    <main className={joinClasses("relative isolate min-h-screen overflow-hidden text-white", mainClassName)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

      <div
        className={joinClasses(
          "relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] px-4 py-4 sm:px-8 sm:py-6",
          containerClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

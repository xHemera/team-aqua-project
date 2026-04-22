"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

type AppPageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  containerClassName?: string;
  showSidebar?: boolean;
};

const joinClasses = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

export default function AppPageShell({
  children,
  mainClassName,
  containerClassName,
  showSidebar = false,
}: AppPageShellProps) {
  return (
    <main className={joinClasses("relative isolate min-h-screen overflow-hidden text-white bg-black/40", mainClassName)}>

      {showSidebar ? (
        <div className="relative z-10 flex h-screen w-full gap-4 overflow-hidden px-4 py-4 sm:px-8 sm:py-6">
          <Sidebar />
          <div className={joinClasses("relative flex min-h-0 flex-1", containerClassName)}>
            {children}
          </div>
        </div>
      ) : (
        <div
          className={joinClasses(
            "relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] px-4 py-4 sm:px-8 sm:py-6",
            containerClassName,
          )}
        >
          {children}
        </div>
      )}
    </main>
  );
}

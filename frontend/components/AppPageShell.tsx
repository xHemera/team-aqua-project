import { ReactNode, CSSProperties } from "react";
import Sidebar from "./Sidebar";

type AppPageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  mainStyle?: CSSProperties;
  containerClassName?: string;
  showSidebar?: boolean;
};

const joinClasses = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

export default function AppPageShell({
  children,
  mainClassName,
  mainStyle,
  containerClassName,
  showSidebar = false,
}: AppPageShellProps) {
  return (
    <main 
      className={joinClasses("relative isolate min-h-screen overflow-hidden text-white bg-black/40", mainClassName)}
      style={mainStyle}
    >

      {showSidebar ? (
        <div className="flex h-screen w-full overflow-hidden bg-[#0c0a0f] font-serif text-white">
          <div className="shrink-0 p-3 pl-2">
            <Sidebar />
          </div>

          <main className="relative flex-1 overflow-hidden p-3 pl-0">
            <div className={joinClasses("relative flex h-full min-h-0 flex-col", containerClassName)}>
              {children}
            </div>
          </main>
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

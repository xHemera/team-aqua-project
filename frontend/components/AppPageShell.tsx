"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { BackgroundMediaType, getBackgroundMediaFromDocument } from "@/lib/background-utils";
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
  const [backgroundMedia, setBackgroundMedia] = useState<{ mediaType: BackgroundMediaType; mediaSource: string }>({
    mediaType: "none",
    mediaSource: "",
  });

  useEffect(() => {
    const refreshBackgroundMedia = () => {
      setBackgroundMedia(getBackgroundMediaFromDocument());
    };

    refreshBackgroundMedia();

    window.addEventListener("site-background-changed", refreshBackgroundMedia);
    window.addEventListener("storage", refreshBackgroundMedia);

    return () => {
      window.removeEventListener("site-background-changed", refreshBackgroundMedia);
      window.removeEventListener("storage", refreshBackgroundMedia);
    };
  }, []);

  const youtubeEmbedUrl = useMemo(() => {
    if (backgroundMedia.mediaType !== "youtube" || !backgroundMedia.mediaSource) {
      return "";
    }

    const id = backgroundMedia.mediaSource;
    return `https://www.youtube.com/embed/${encodeURIComponent(
      id,
    )}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(
      id,
    )}&modestbranding=1&playsinline=1&rel=0`;
  }, [backgroundMedia.mediaSource, backgroundMedia.mediaType]);

  const showDirectVideo = backgroundMedia.mediaType === "direct-video" && Boolean(backgroundMedia.mediaSource);
  const showYoutubeVideo = backgroundMedia.mediaType === "youtube" && Boolean(youtubeEmbedUrl);

  return (
    <main className={joinClasses("relative isolate min-h-screen overflow-hidden text-white", mainClassName)}>
      {showDirectVideo && (
        <video
          key={backgroundMedia.mediaSource}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.08] object-cover blur-[10px]"
          src={backgroundMedia.mediaSource}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {showYoutubeVideo && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <iframe
            src={youtubeEmbedUrl}
            className="h-full w-full scale-[1.2] blur-[10px]"
            title="Background video"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.08)",
          opacity: showDirectVideo || showYoutubeVideo ? 0 : 1,
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

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

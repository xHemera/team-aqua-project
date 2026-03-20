"use client";

import styles from "./HomePage.module.css";
import Button from "@/components/atoms/Button";

type PlayCtaProps = {
  onPlay: () => void;
};

export default function PlayCta({ onPlay }: PlayCtaProps) {
  return (
    <div
      className={`origin-center transform-gpu bg-black p-0.5 shadow-2xl transition-transform hover:scale-105 ${styles.hexOuter}`}
    >
      <div className={`bg-[#ffdb4c] p-2 ${styles.hexInner}`}>
        {/* Usage atomique: Button est stylise ici comme CTA principal tout en gardant la meme base comportementale. */}
        <Button
          type="button"
          onClick={onPlay}
          variant="ghost"
          className={`h-80 w-72 bg-[#ffdb4c] text-6xl font-black uppercase italic tracking-wide text-[#fff46d] hover:bg-[#ffdb4c] sm:h-96 sm:w-80 sm:text-7xl ${styles.hexButton}`}
        >
          Play
        </Button>
      </div>
    </div>
  );
}

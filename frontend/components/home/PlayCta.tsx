"use client";

import styles from "./HomePage.module.css";

type PlayCtaProps = {
  onPlay: () => void;
};

export default function PlayCta({ onPlay }: PlayCtaProps) {
  return (
    <div
      className={`origin-center transform-gpu bg-black p-0.5 shadow-2xl transition-transform hover:scale-105 ${styles.hexOuter}`}
    >
      <div className={`bg-[#ffdb4c] p-2 ${styles.hexInner}`}>
        <button
          type="button"
          onClick={onPlay}
          className={`flex h-80 w-72 items-center justify-center bg-[#ffdb4c] text-6xl font-black uppercase italic tracking-wide text-[#fff46d] sm:h-96 sm:w-80 sm:text-7xl ${styles.hexButton}`}
        >
          Play
        </button>
      </div>
    </div>
  );
}

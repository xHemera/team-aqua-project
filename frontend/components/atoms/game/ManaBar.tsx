"use client";

import type { CSSProperties } from "react";

type ManaBarProps = {
  currentMana: number;
  className?: string;
};

const MANA_MAX = 100;

const lerp = (start: number, end: number, ratio: number) => {
  return start + (end - start) * ratio;
};

export default function ManaBar({ currentMana, className = "" }: ManaBarProps) {
  const manaPercent = Math.max(0, Math.min(100, (currentMana / MANA_MAX) * 100));
  const clampedMana = Math.round(Math.max(0, Math.min(MANA_MAX, currentMana)));

  const manaHue =
    manaPercent >= 50
      ? lerp(52, 210, (manaPercent - 50) / 50)
      : manaPercent >= 20
        ? lerp(4, 52, (manaPercent - 20) / 30)
        : lerp(0, 4, manaPercent / 20);

  const valueColor = `hsl(${manaHue} 88% 78%)`;
  const trackBorderColor = `hsla(${manaHue} 82% 62% / 0.85)`;
  const fillColor = `hsl(${manaHue} 92% 56%)`;
  const glowColor = `hsla(${manaHue} 95% 74% / 0.28)`;

  const trackStyle: CSSProperties = {
    borderColor: trackBorderColor,
  };

  const fillStyle: CSSProperties = {
    height: `${manaPercent}%`,
    backgroundColor: fillColor,
    boxShadow: `inset 0 0 10px ${glowColor}`,
  };

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold" style={{ color: valueColor }}>
        {clampedMana}
      </span>

      <div
        className="relative flex h-52 w-5 items-end overflow-hidden rounded-md border bg-[#0e1726]"
        style={trackStyle}
        role="progressbar"
        aria-label="Mana"
        aria-valuemin={0}
        aria-valuemax={MANA_MAX}
        aria-valuenow={clampedMana}
      >
        <div className="w-full mana-stripes" style={fillStyle} />
      </div>

      <style jsx>{`
        .mana-stripes {
          position: relative;
          overflow: hidden;
          transition: height 220ms ease-out, background-color 220ms linear, box-shadow 220ms linear;
        }

        .mana-stripes::before {
          content: "";
          position: absolute;
          inset: -60% -30%;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.16) 0,
            rgba(255, 255, 255, 0.16) 3px,
            rgba(255, 255, 255, 0) 3px,
            rgba(255, 255, 255, 0) 10px
          );
          background-size: 16px 16px;
          animation: mana-stripes-move 2.4s linear infinite;
          will-change: transform;
          pointer-events: none;
        }

        .mana-stripes::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.2));
          pointer-events: none;
        }

        @keyframes mana-stripes-move {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(16px);
          }
        }
      `}</style>
    </div>
  );
}

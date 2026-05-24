"use client";

import React from "react";

type Props = {
  icon: string;
  name: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  className?: string;
};

export default function SpellButton({
  icon,
  name,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-md border-2 border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-2 py-1.5 transition-all duration-150 hover:border-[#c9a84c] hover:shadow-[0_0_14px_rgba(201,168,76,0.15)] sm:px-3 sm:py-2 ${className}`}
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c9a84c]/5 to-transparent" />
        <div className="absolute -top-6 left-1/2 h-10 w-20 -translate-x-1/2 rounded-full bg-[#c9a84c]/10 blur-lg" />
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        {/* medallion frame for icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4a3520] bg-[#1a1208] shadow-[inset_0_0_6px_rgba(0,0,0,0.6)] transition-all duration-150 group-hover:border-[#c9a84c]/60 sm:h-12 sm:w-12"
        >
          <img
            src={icon}
            alt={`${name} icon`}
            className="h-6 w-6 object-contain sm:h-8 sm:w-8"
            draggable={false}
          />
        </div>

        <span className="truncate font-serif text-sm font-semibold tracking-wide text-[#c9b896] transition-colors duration-150 group-hover:text-[#e8dcc8] sm:text-lg">
          {name}
        </span>
      </div>
    </button>
  );
}

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
      className={
        `flex items-center gap-3 rounded border border-[#3c3650] bg-[#0f0e13] px-3 py-2 hover:border-[#5b5480] ${className}`
      }
    >
      <img src={icon} alt={`${name} icon`} className="w-8 h-8 object-contain" />
      <span className="truncate text-sm font-medium">{name}</span>
    </button>
  );
}

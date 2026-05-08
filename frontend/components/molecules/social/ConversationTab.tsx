"use client";

import Image from "next/image";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import type { type as socialType } from "@/app/social/index";

type ConversationTabProps = {
  user: socialType.User;
  isActive: boolean;
  unreadCount: number;
  customUserAvatar?: string | null;
  onSelect: (userName: string) => void;
};

export function ConversationTab({
  user,
  isActive,
  unreadCount,
  customUserAvatar,
  onSelect,
}: ConversationTabProps) {
  const displayAvatar = customUserAvatar || user.image || user.avatar?.url || DEFAULT_PROFILE_ICON.url;

  return (
    <button
      onClick={() => onSelect(user.name)}
      className={`relative flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
        isActive
          ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
          : "border-[#c9a227]/30 bg-[#242033] text-gray-200 hover:bg-[#302a45]"
      }`}
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-visible">
        <Image
          src={displayAvatar}
          alt={user.name}
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg border border-[#c9a227]/30 object-cover"
          unoptimized
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#242033] ${
            user.online ? "bg-emerald-400" : "bg-rose-400"
          }`}
          aria-hidden="true"
        />
      </div>
      <span className="shrink-0 whitespace-nowrap text-sm font-semibold">{user.name}</span>
      {unreadCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

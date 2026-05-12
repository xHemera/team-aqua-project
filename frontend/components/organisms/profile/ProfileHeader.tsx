"use client";

import Image from "next/image";
import Card from "@/components/atoms/Card";

type ProfileHeaderProps = {
  profileName: string;
  isOwnProfile: boolean;
  badges: string[];
  currentAvatar: string;
  onAvatarUploadClick: () => void;
};

export function ProfileHeader({
  profileName,
  isOwnProfile,
  badges,
  currentAvatar,
  onAvatarUploadClick,
}: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#15131d]/92 p-0 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09070c] via-[#09070c]/72 to-transparent" />

        <div className="relative flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:gap-8 lg:justify-between">
          {/* Avatar */}
          <div className="shrink-0">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={onAvatarUploadClick}
                className="group relative block overflow-hidden rounded-[1.6rem] border-2 border-white/15 bg-[#0f0d14]/90 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.46)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#c9a227]/40"
                aria-label="Change profile picture"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.24),transparent_68%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <div className="relative aspect-square w-32 overflow-hidden rounded-[1.2rem] sm:w-40">
                  <Image
                    src={currentAvatar}
                    alt={`Avatar de ${profileName}`}
                    width={192}
                    height={192}
                    className="h-full w-full object-cover"
                    priority
                    unoptimized
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Changer l&apos;avatar
                  </span>
                </div>
              </button>
            ) : (
              <div className="overflow-hidden rounded-[1.6rem] border-2 border-white/15 bg-[#0f0d14]/90 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.46)]">
                <div className="aspect-square w-32 overflow-hidden rounded-[1.2rem] sm:w-40">
                  <Image
                    src={currentAvatar}
                    alt={`Avatar de ${profileName}`}
                    width={192}
                    height={192}
                    className="h-full w-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          {/* Name + Badges */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 sm:mb-6">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 break-words"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {profileName}
              </h1>
              <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-[#c9a227] to-[#f4e4a6] rounded-full" />
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-lg sm:rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/15 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#f3e3b9] shadow-[0_8px_16px_rgba(201,162,39,0.1)]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";

const NAV_ITEMS = [
  { href: "/home", icon: "fa-solid fa-house", label: "Accueil" },
  { href: "/decks", icon: "fa-regular fa-clone", label: "Decks" },
  { href: "/social", icon: "fa-regular fa-comment-dots", label: "Social" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [avatar, setAvatar] = useState(DEFAULT_PROFILE_ICON.url);
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) setAvatar(savedAvatar);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "avatar" && e.newValue) setAvatar(e.newValue);
    };

    window.addEventListener("storage", handleStorageChange);

    authClient.getSession().then(({ data }) => {
      if (data?.user?.name) setPseudo(data.user.name);
    });

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      router.push(`/profile/${data.user.name}`);
    } else {
      router.push("/not-connected");
    }
  };

  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside className="flex h-full w-20 shrink-0 flex-col items-center gap-3 rounded-2xl border border-[#3c3650] bg-[#15131d]/85 px-3 py-4 shadow-2xl backdrop-blur-md">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex h-14 w-14 items-center justify-center rounded-xl border shadow-lg transition-colors ${
              isActive
                ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                : "border-[#3c3650] bg-[#242033] text-white hover:bg-[#302a45]"
            }`}
          >
            <i className={`${icon} text-2xl`} />
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* Avatar / Profil */}
      <a
        href="#"
        onClick={handleProfileClick}
        title={pseudo ?? "Profil"}
        className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border shadow-lg transition-colors ${
          isProfileActive
            ? "border-[color:var(--accent-border)]"
            : "border-[#3c3650] hover:border-[color:var(--accent-border)]"
        }`}
      >
        <Image
          src={avatar}
          alt="Avatar"
          width={56}
          height={56}
          className="h-full w-full object-cover"
          unoptimized
        />
      </a>
    </aside>
  );
}

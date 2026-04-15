"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import { useAvatarPreference } from "@/hooks/useAvatarPreference";
import { socket } from "../socket";

const NAV_ITEMS = [
  { href: "/home", icon: "fa-solid fa-house", label: "Home" },
  { href: "/decks", icon: "fa-regular fa-clone", label: "Decks" },
  { href: "/social", icon: "fa-regular fa-comment-dots", label: "Social" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const avatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [socialUnread, setSocialUnread] = useState<number>(0);
  const unreadRequestSeqRef = useRef(0);

  const refreshSocialUnread = async () => {
    const requestSeq = ++unreadRequestSeqRef.current;

    try {
      const response = await fetch("/api/social/unread", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { totalUnread?: number };
      if (requestSeq !== unreadRequestSeqRef.current) return;
      setSocialUnread(Math.max(0, payload.totalUnread ?? 0));
    } catch {
      // Keep the current value if fetch fails.
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const hydrateIdentity = async () => {
      const [session, profileResponse] = await Promise.all([authClient.getSession(), fetch("/api/profile/")]);
      const profile = (await profileResponse.json()) as { pseudo?: string; name?: string };
      const identity = profile.pseudo || profile.name || session.data?.user?.name || null;

      if (!isCancelled) {
        setPseudo(identity);
      }
    };

    void hydrateIdentity();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadUnread = async () => {
      await refreshSocialUnread();
    };

    void loadUnread();
  }, [pathname]);

  useEffect(() => {
    if (!pseudo) return;

    if (!socket.connected) {
      socket.connect();
    }
    const login = () => {
      socket.emit("login", pseudo);
    };

    login();

    const onReceived = () => {
      void refreshSocialUnread();
    };

    socket.on("connect", login);
    socket.on("received", onReceived);

    return () => {
      socket.off("connect", login);
      socket.off("received", onReceived);
    };
  }, [pseudo]);

  useEffect(() => {
    const onUnreadUpdated = () => {
      void refreshSocialUnread();
    };

    window.addEventListener("social-unread-updated", onUnreadUpdated);
    return () => {
      window.removeEventListener("social-unread-updated", onUnreadUpdated);
    };
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
        const isSocial = href === "/social";
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`relative flex h-14 w-14 items-center justify-center rounded-xl border shadow-lg transition-colors ${
              isActive
                ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
                : "border-[#3c3650] bg-[#242033] text-white hover:bg-[#302a45]"
            }`}
          >
            <i className={`${icon} text-2xl`} />
            {isSocial && socialUnread > 0 && pathname !== "/social" &&(
              <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {socialUnread > 99 ? "99+" : socialUnread}
              </span>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* Avatar / Profil */}
      {/* Usage atomique: Button offre un comportement uniforme pour l'action profil. */}
      <Button
        type="button"
        onClick={handleProfileClick}
        title={pseudo ?? "Profile"}
        variant="ghost"
        className={`!h-14 !w-14 !p-0 !px-0 !py-0 overflow-hidden rounded-xl border shadow-lg ${
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
          // On affiche l'avatar complet (sans crop) en exploitant toute la case disponible.
          className="h-full w-full bg-[#1b1826] object-contain"
          unoptimized
        />
      </Button>
    </aside>
  );
}

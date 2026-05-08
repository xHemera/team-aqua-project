import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Custom hook to fetch the current user's pseudo/name on mount.
 * Defers the session fetch to avoid hydration mismatches.
 */
export function useUserSession() {
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setPseudo(data.user.name);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return pseudo;
}

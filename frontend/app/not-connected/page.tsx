"use client";

import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";

// Page d'alerte quand un utilisateur non connecté tente d'accéder au profil
export default function NotConnectedPage() {
  const router = useRouter();

  return (
    <AppPageShell containerClassName="items-center justify-center">
      {/* Carte d'information + actions de redirection */}
      <div className="w-full max-w-md rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <i className="fa-solid fa-circle-exclamation text-[var(--accent-color)] text-6xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Non Connecté
        </h1>
        
        <p className="text-gray-300 mb-8">
          Vous n&apos;êtes pas connecté à un compte. Veuillez vous connecter ou créer un compte pour accéder à votre profil.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Se connecter
          </button>
          
          <button
            onClick={() => router.push("/register")}
            className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 font-semibold text-gray-100 transition-colors hover:bg-[#302a45]"
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            Créer un compte
          </button>
          
          <button
            onClick={() => router.push("/home")}
            className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 font-semibold text-gray-100 transition-colors hover:bg-[#302a45]"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </AppPageShell>
  );
}

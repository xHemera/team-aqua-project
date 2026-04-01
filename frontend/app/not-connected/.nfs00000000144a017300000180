"use client";

import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

// Page d'alerte quand un utilisateur non connecté tente d'accéder au profil
export default function NotConnectedPage() {
  const router = useRouter();

  return (
    <AppPageShell containerClassName="items-center justify-center">
      {/* Carte d'information + actions de redirection */}
      <Card className="w-full max-w-md rounded-3xl p-8 text-center">
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
          <Button
            type="button"
            onClick={() => router.push("/")}
            className="h-auto w-full py-3 font-semibold text-white"
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Se connecter
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push("/register")}
            variant="secondary"
            className="h-auto w-full py-3 font-semibold text-gray-100"
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            Créer un compte
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push("/home")}
            variant="ghost"
            className="h-auto w-full py-3 font-semibold text-gray-100"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Retour à l&apos;accueil
          </Button>
        </div>
      </Card>
    </AppPageShell>
  );
}

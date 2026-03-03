"use client";

import { useRouter } from "next/navigation";

// Page d'alerte quand un utilisateur non connecté tente d'accéder au profil
export default function NotConnectedPage() {
  const router = useRouter();

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Fond global */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
      {/* Carte d'information + actions de redirection */}
      <div className="w-full max-w-md rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <i className="fa-solid fa-circle-exclamation text-[#8e82ff] text-6xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Non Connecté
        </h1>
        
        <p className="text-gray-300 mb-8">
          Vous n'êtes pas connecté à un compte. Veuillez vous connecter ou créer un compte pour accéder à votre profil.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl border border-[#b4a8ff]/70 bg-[#8e82ff] py-3 font-semibold text-white transition-colors hover:bg-[#7d71ec]"
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
            Retour à l'accueil
          </button>
        </div>
      </div>
      </div>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function NotConnectedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8 text-center border-2 border-red-500">
        <div className="mb-6">
          <i className="fa-solid fa-circle-exclamation text-red-500 text-6xl"></i>
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Se connecter
          </button>
          
          <button
            onClick={() => router.push("/register")}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            Créer un compte
          </button>
          
          <button
            onClick={() => router.push("/home")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </main>
  );
}

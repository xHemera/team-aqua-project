"use client";

import { useRouter } from "next/navigation";

// Page placeholder des decks
export default function DecksPage() {
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/home")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-500/80 bg-gray-700/80 text-white shadow-lg transition-colors hover:bg-gray-600"
            aria-label="Retour à l'accueil"
          >
            <i className="fa-solid fa-house"></i>
          </button>
          <button
            onClick={() => router.push("/social")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#b4a8ff]/60 bg-[#1f1b2d]/90 text-white shadow-lg transition-colors hover:bg-[#2b2540]"
            aria-label="Aller au social"
          >
            <i className="fa-regular fa-comment-dots"></i>
          </button>
        </header>

        <section className="flex-1 rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-8 shadow-2xl backdrop-blur-md">
          {/* Contenu temporaire */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight">Decks</h1>
          <div className="rounded-2xl border border-[#3c3650] bg-[#242033] p-10 text-center">
            <p className="text-2xl font-bold text-gray-100">Work in progress</p>
          </div>
        </section>
      </div>
    </main>
  );
}

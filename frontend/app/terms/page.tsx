"use client";

import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";

export default function TermsPage() {
  const router = useRouter();

  return (
    <AppPageShell containerClassName="min-h-0 flex-1 flex-col" mainClassName="bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]">
      <div className="flex w-full h-full flex-col px-4 py-8">
        <section className="w-full h-full rounded-3xl border border-[#c9a227]/25 bg-black/15 p-8 shadow-2xl overflow-y-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm text-gray-400 transition-colors hover:text-[var(--accent-color)]"
          >
            ← Back
          </button>

          <h1 className="mb-6 text-3xl font-bold text-white">Terms of Service</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">1. Introduction</h2>
              <p>
                Welcome to our RPG platform. We are committed to protecting your privacy and ensuring you have a positive experience on our site. This document outlines our terms of service.
              </p>
            </section>
          </div>
        </section>
      </div>
    </AppPageShell>
  );
}

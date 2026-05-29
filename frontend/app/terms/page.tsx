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
                Welcome to our RPG platform. By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. This document outlines our terms of service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on our RPG platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <ul className="mt-2 space-y-2 pl-4">
                <li>• You may not modify or copy the materials</li>
                <li>• You may not use the materials for any commercial purpose or for any public display</li>
                <li>• You may not attempt to decompile or reverse engineer the software</li>
                <li>• You may not transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">3. Disclaimer</h2>
              <p>
                The materials on our RPG platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">4. Limitations</h2>
              <p>
                In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on our RPG platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our site are accurate, complete, or current. We may make changes to the materials contained on our platform at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">6. Links</h2>
              <p>
                We have not reviewed all of the sites linked to our platform and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">7. Modifications</h2>
              <p>
                We may revise these terms of service for our platform at any time without notice. By using this site, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of our jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
          </div>
        </section>
      </div>
    </AppPageShell>
  );
}

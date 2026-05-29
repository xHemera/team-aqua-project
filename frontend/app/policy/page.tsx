"use client";

import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";

export default function PolicyPage() {
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

          <h1 className="mb-6 text-3xl font-bold text-white">Privacy Policy</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">1. Introduction</h2>
              <p>
                Welcome to our RPG platform. We are committed to protecting your privacy and ensuring you have a positive and transparent experience. This document outlines our privacy policy and how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">2. Information We Collect</h2>
              <p>We collect information you provide directly, such as when you:</p>
              <ul className="mt-2 space-y-2 pl-4">
                <li>• Create an account (username, email address, password)</li>
                <li>• Update your profile information (avatar, display name)</li>
                <li>• Send messages or interact with other players</li>
                <li>• Upload custom avatars or other content</li>
                <li>• Participate in game activities and matches</li>
                <li>• Contact our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="mt-2 space-y-2 pl-4">
                <li>• Provide, maintain, and improve our services</li>
                <li>• Enable communication between players</li>
                <li>• Maintain account security and prevent fraud</li>
                <li>• Track and record match history and player statistics</li>
                <li>• Send you updates and notifications about your account</li>
                <li>• Respond to your inquiries and provide customer support</li>
                <li>• Monitor and prevent abuse on our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Your password is encrypted and securely stored, and we use HTTPS to protect data in transit.
              </p>
              <p className="mt-2">
                However, no method of transmission over the Internet is entirely secure. We cannot guarantee absolute security, and you use our service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as long as necessary to provide you with our services. You can request deletion of your account and associated data at any time by contacting our support team, though we may retain some information for legal or operational purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">6. Sharing Your Information</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Your information may only be shared with:
              </p>
              <ul className="mt-2 space-y-2 pl-4">
                <li>• Other players to enable game functionality</li>
                <li>• Service providers who assist us in operating our platform</li>
                <li>• Law enforcement, if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">7. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. You can manage your account settings directly through the platform or contact our support team for assistance.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">8. Cookies and Tracking</h2>
              <p>
                Our platform uses cookies and similar tracking technologies to enhance your experience. These help us remember your preferences and improve our services. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us through the support channels available in the game or on our website. We will respond to your inquiry within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">11. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this privacy policy at any time. Changes will be effective upon posting to this page. We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </section>
          </div>
        </section>
      </div>
    </AppPageShell>
  );
}

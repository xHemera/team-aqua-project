import type { ReactNode } from "react";

type FeatureModalFrameProps = {
  open: boolean;
  title: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
};

// Molecule: frame modal reutilisable pour les features de la Home.
export default function FeatureModalFrame({ open, title, icon, onClose, children }: FeatureModalFrameProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#c9a227]/40 bg-[#120f17] shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#c9a227]/30 bg-gradient-to-r from-[#241b2f] to-[#1a1422] px-5 py-4">
          <div className="flex items-center gap-3">
            <i className={`fa-solid ${icon} text-[#e6c55a]`} aria-hidden="true" />
            <h2
              className="text-xl font-black uppercase tracking-[0.1em] text-[#f5e6c8]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#6a5b81] bg-[#211a2c] text-lg text-[#ead9aa] transition-colors hover:bg-[#2a2138]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

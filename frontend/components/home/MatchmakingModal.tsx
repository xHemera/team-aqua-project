"use client";

import styles from "./HomePage.module.css";

type MatchmakingModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function MatchmakingModal({ open, onClose }: MatchmakingModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-gradient-to-br from-gray-300 to-gray-200 p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matchmaking-title"
      >
        <div className="flex flex-col gap-4">
          <h2 id="matchmaking-title" className="mb-4 text-xl font-black uppercase tracking-wide text-gray-800">
            En recherche de joueur
            <span className={styles.dot1}>.</span>
            <span className={styles.dot2}>.</span>
            <span className={styles.dot3}>.</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-500 px-4 py-3 text-lg font-bold uppercase text-gray-800 transition-transform hover:scale-105"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

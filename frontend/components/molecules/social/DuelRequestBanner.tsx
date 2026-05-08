"use client";

type DuelRequestBannerProps = {
  opponentName: string;
  onAccept: () => void;
  onRefuse: () => void;
};

export function DuelRequestBanner({ opponentName, onAccept, onRefuse }: DuelRequestBannerProps) {
  return (
    <div className="border-b border-[#c9a227]/30 bg-[#1b1826] p-4">
      <div className="rounded-lg border border-[var(--accent-color)] bg-[#242033] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-300">
              <span className="text-[var(--accent-color)]">{opponentName}</span> wants to du-du-du-du-du-du-duel !
            </p>
            <p className="mt-1 text-xs text-gray-400">Do you want to accept this request?</p>
          </div>
          <div className="ml-4 flex gap-2">
            <button
              onClick={onAccept}
              className="rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Accept
            </button>
            <button
              onClick={onRefuse}
              className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
            >
              Refuse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

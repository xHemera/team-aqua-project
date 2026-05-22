import Button from "@/components/atoms/Button";
import FeatureModalFrame from "@/components/molecules/home/FeatureModalFrame";

type PongMatchmakingModalProps = {
  open: boolean;
  onClose: () => void;
};

// Organism: modal Pong front-only avec etat matchmaking simule.
export default function PongMatchmakingModal({
  open,
  onClose,
}: PongMatchmakingModalProps) {
  return (
    <FeatureModalFrame open={open} title="Pong Matchmaking" icon="fa-table-tennis" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[#c9a227]/25 bg-[#171220] p-4 text-[#e9d7ab]">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-spinner fa-spin text-[#e6c55a]" aria-hidden="true" />
            <span>Searching opponent...</span>
          </div>
        </div>
      </div>
    </FeatureModalFrame>
  );
}

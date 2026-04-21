import Button from "@/components/atoms/Button";
import FeatureModalFrame from "@/components/molecules/home/FeatureModalFrame";

type PvpMatchmakingModalProps = {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
};

// Organism: modal PvP front-only avec etat matchmaking simule.
export default function PvpMatchmakingModal({
  open,
  onClose,
  onCancel,
}: PvpMatchmakingModalProps) {
  return (
    <FeatureModalFrame open={open} title="PvP Matchmaking" icon="fa-swords" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[#c9a227]/25 bg-[#171220] p-4 text-[#e9d7ab]">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-spinner fa-spin text-[#e6c55a]" aria-hidden="true" />
            <span>Searching opponent...</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 font-bold uppercase tracking-wide">
            Cancel
          </Button>
        </div>
      </div>
    </FeatureModalFrame>
  );
}

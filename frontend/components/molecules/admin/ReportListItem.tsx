import StatusPill from "@/components/atoms/StatusPill";
import type { ReportedConversation } from "@/app/admin/types";

type ReportListItemProps = {
  report: ReportedConversation;
  active: boolean;
  onSelect: (id: string) => void;
};

export default function ReportListItem({ report, active, onSelect }: ReportListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(report.id)}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        active
          ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)]"
          : "border-[#3c3650] bg-[#1c1827] hover:bg-[#29233a]"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-white">
          @{report.reporter} / @{report.targetUser}
        </p>
        <StatusPill status={report.status} />
      </div>
      <p className="truncate text-xs text-gray-300">{report.reason}</p>
      <p className="mt-1 truncate text-xs text-gray-400">{report.preview}</p>
    </button>
  );
}

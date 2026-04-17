import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ConversationMessageBubble from "@/components/molecules/admin/ConversationMessageBubble";
import ReportListItem from "@/components/molecules/admin/ReportListItem";
import type { ReportedConversation } from "@/app/admin/types";

type ReportedConversationsPanelProps = {
  reports: ReportedConversation[];
  loadingReports: boolean;
  reportsError: string | null;
  selectedReportId: string;
  onSelectReportId: (id: string) => void;
};

export default function ReportedConversationsPanel({
  reports,
  loadingReports,
  reportsError,
  selectedReportId,
  onSelectReportId,
}: ReportedConversationsPanelProps) {
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  return (
    <Card className="flex min-h-0 w-full flex-col p-4 lg:w-[44%] lg:p-5">
      <div className="pb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Social Moderation</p>
        <h2 className="text-2xl font-bold text-white">Reported Conversations</h2>
        <p className="mt-1 text-sm text-gray-300">
          Data connected to existing conversations. The final reporting logic will be connected later.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[16rem_1fr]">
        <div className="min-h-0 overflow-y-auto pr-1">
          {loadingReports && (
            <Card className="rounded-xl bg-[#1c1827] p-3 text-sm text-gray-300">Loading conversations...</Card>
          )}

          {!loadingReports && reportsError && (
            <Card className="rounded-xl border-red-400/50 bg-red-900/20 p-3 text-sm text-red-100">{reportsError}</Card>
          )}

          {!loadingReports && !reportsError && reports.length === 0 && (
            <Card className="rounded-xl bg-[#1c1827] p-3 text-sm text-gray-300">No reported conversations available.</Card>
          )}

          {!loadingReports && !reportsError && reports.length > 0 && (
            <div className="space-y-2">
              {reports.map((report) => (
                <ReportListItem
                  key={report.id}
                  report={report}
                  active={selectedReport?.id === report.id}
                  onSelect={onSelectReportId}
                />
              ))}
            </div>
          )}
        </div>

        <Card className="min-h-0 rounded-xl bg-[#1c1827] p-3">
          {!selectedReport && <p className="text-sm text-gray-300">No report selected.</p>}

          {selectedReport && (
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-3 border-b border-[#3c3650] pb-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    @{selectedReport.reporter} vs @{selectedReport.targetUser}
                  </p>
                  <span className="text-xs text-gray-400">{selectedReport.createdAtLabel}</span>
                </div>
                <p className="mt-1 text-xs text-gray-300">Reason: {selectedReport.reason}</p>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {selectedReport.messages.map((message) => (
                  <ConversationMessageBubble key={message.id} message={message} />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-[#3c3650] pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  disabled
                  title="Action de moderation a connecter a l'API de signalement"
                >
                  Mark as Reviewed
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-3 text-xs"
                  disabled
                  title="Action de moderation a connecter a l'API de signalement"
                >
                  Ban
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Card>
  );
}

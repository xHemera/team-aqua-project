import type { ReportedConversationMessage } from "@/app/admin/types";

type ConversationMessageBubbleProps = {
  message: ReportedConversationMessage;
};

export default function ConversationMessageBubble({ message }: ConversationMessageBubbleProps) {
  return (
    <div
      className={`max-w-[92%] rounded-xl border px-3 py-2 text-sm ${
        message.mine
          ? "ml-auto border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
          : "border-[#3c3650] bg-[#242033] text-gray-100"
      }`}
    >
      <p className="mb-1 text-xs font-bold text-gray-300">{message.sender}</p>
      <p className="break-words">{message.content}</p>
      <p className="mt-1 text-right text-[11px] text-gray-400">{message.time}</p>
    </div>
  );
}

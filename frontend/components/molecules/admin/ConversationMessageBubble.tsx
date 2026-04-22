import type { type } from "@/app/admin/index";

type ConversationMessageBubbleProps = {
  message: type.Message;
  users: Record<string, string>;
  reporter: string;
};

const formatTime = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ConversationMessageBubble({ message, users, reporter}: ConversationMessageBubbleProps) {
  return (
    <div
      className={`max-w-[92%] rounded-xl border px-3 py-2 text-sm ${
        users[message.user_id] === reporter
          ? "ml-auto border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-white"
          : "border-[#3c3650] bg-[#242033] text-gray-100"
      }`}
    >
      <p className="mb-1 text-xs font-bold text-gray-300">{users[message.user_id]}</p>
      <p className="break-words">{message.message}</p>
      <p className="mt-1 text-right text-[11px] text-gray-400">{formatTime(message.createdAt)}</p>
    </div>
  );
}

import Image from "next/image";
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

const isImageFile = (attachment: type.Attachment) => {
  return attachment.type.startsWith("image/");
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
      {message.message && <p className="break-words">{message.message}</p>}
      
      {message.attachments && message.attachments.length > 0 && (
        <div className={`mt-2 grid gap-2 ${message.attachments.length > 1 ? "grid-cols-2" : ""}`}>
          {message.attachments.map((attachment) => (
            <button
              key={attachment.id}
              type="button"
              onClick={() => window.open(attachment.previewUrl, "_blank")}
              className="rounded-lg border p-2 cursor-pointer transition-opacity hover:opacity-80 border-[#5c5770] bg-[#15131d]"
            >
              {isImageFile(attachment) ? (
                <>
                  <Image
                    src={attachment.previewUrl}
                    alt={attachment.name}
                    width={200}
                    height={150}
                    className="h-20 w-full rounded-md object-cover"
                    unoptimized
                  />
                  <p className="mt-2 truncate text-xs font-semibold">{attachment.name}</p>
                  <p className="text-[11px] opacity-75">{attachment.sizeLabel}</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <i className="fa-solid fa-file text-xl mb-2"></i>
                  <p className="truncate text-xs font-semibold">{attachment.name}</p>
                  <p className="text-[11px] opacity-75">{attachment.sizeLabel}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      <p className="mt-1 text-right text-[11px] text-gray-400">{formatTime(message.createdAt)}</p>
    </div>
  );
}

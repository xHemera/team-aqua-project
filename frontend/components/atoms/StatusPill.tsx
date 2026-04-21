type StatusPillProps = {
  status: "pending" | "reviewed";
  pendingLabel?: string;
  reviewedLabel?: string;
  className?: string;
};

const joinClasses = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

export default function StatusPill({
  status,
  pendingLabel = "Pending",
  reviewedLabel = "Done",
  className,
}: StatusPillProps) {
  return (
    <span
      className={joinClasses(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
        status === "pending" ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200",
        className,
      )}
    >
      {status === "pending" ? pendingLabel : reviewedLabel}
    </span>
  );
}
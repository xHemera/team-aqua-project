type ResourceChipProps = {
  value: string;
  iconClassName: string;
};

const RESOURCE_BOX_CLASS =
  "inline-flex w-fit items-center justify-end gap-2 whitespace-nowrap rounded-xl border border-[#3c3650] bg-[#242033] px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg sm:px-3 sm:py-2 sm:text-sm";

export default function ResourceChip({ value, iconClassName }: ResourceChipProps) {
  return (
    <div className={RESOURCE_BOX_CLASS}>
      <span>{value}</span>
      <i className={iconClassName} aria-hidden="true" />
    </div>
  );
}

import Sidebar from "./Sidebar";

type SidebarShellProps = {
  className?: string;
};

export default function SidebarShell({ className = "" }: SidebarShellProps) {
  return (
    <div className={`shrink-0 p-3 ${className}`.trim()}>
      <Sidebar />
    </div>
  );
}

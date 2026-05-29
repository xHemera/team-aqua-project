import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent px-4 py-2">
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/policy"
          className="text-sm text-gray-400 transition-colors hover:text-[var(--accent-color)]"
        >
          Privacy Policy
        </Link>
        <span className="text-gray-600">|</span>
        <Link
          href="/terms"
          className="text-sm text-gray-400 transition-colors hover:text-[var(--accent-color)]"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}

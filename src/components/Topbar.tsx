"use client";

import { useSession } from "next-auth/react";

interface TopbarProps {
  title: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export default function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "АВ";
  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 pl-14 pr-8 backdrop-blur-md lg:px-8">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      {/* Search */}
      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            placeholder="Поиск клиентов, сделок..."
            className="w-full rounded-lg border border-border bg-bg-card py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative rounded-lg p-2 text-text-secondary transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          {/* Red notification dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent">
          {initials}
        </div>
      </div>
    </header>
  );
}

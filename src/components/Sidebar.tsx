"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

const navGroups = [
  {
    label: "ОСНОВНОЕ",
    items: [
      { href: "/dashboard", label: "Дашборд", icon: "⊞" },
      { href: "/clients", label: "Клиенты", icon: "⊡" },
      { href: "/deals", label: "Сделки", icon: "◈" },
    ],
  },
  {
    label: "НАСТРОЙКИ",
    items: [
      { href: "/settings", label: "Настройки", icon: "⊛" },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Пользователь";
  const initials = getInitials(userName);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex w-[260px] flex-col border-r border-border bg-bg-sidebar backdrop-blur-xl transition-transform duration-200 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* Logo + mobile close */}
      <div className="relative flex items-center gap-3 px-6 py-6">
        <div className="pulse-dot h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="text-lg font-semibold tracking-tight text-text-primary">
          Pulse
        </span>
        <span className="ml-auto rounded bg-accent-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent lg:ml-auto">
          CRM
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-secondary lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <motion.li key={item.href} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "border-l-2 border-accent bg-accent-muted text-text-primary"
                          : "border-l-2 border-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                      }`}
                    >
                      <span
                        className={`text-base ${
                          isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                        } transition-colors duration-150`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="relative border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-sm font-semibold text-accent">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {userName}
            </p>
            <p className="truncate text-xs text-text-muted">Менеджер</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Выйти"
            className="rounded-lg p-1.5 text-text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-text-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

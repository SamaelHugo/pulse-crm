"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-[260px] flex-col border-r border-border bg-bg-sidebar backdrop-blur-xl">
      {/* Gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 py-6">
        <div className="pulse-dot h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="text-lg font-semibold tracking-tight text-text-primary">
          Pulse
        </span>
        <span className="ml-auto rounded bg-accent-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent">
          CRM
        </span>
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
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
                  </li>
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
            АВ
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              Алихан Веров
            </p>
            <p className="truncate text-xs text-text-muted">Менеджер</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

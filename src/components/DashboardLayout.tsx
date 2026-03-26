"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-base bg-dot-pattern">
      <Sidebar />
      <main className="ml-[260px] min-h-screen">
        {children}
      </main>
    </div>
  );
}

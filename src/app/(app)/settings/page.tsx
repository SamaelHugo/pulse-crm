import { Metadata } from "next";
import Topbar from "@/components/Topbar";

export const metadata: Metadata = {
  title: "Настройки — Pulse CRM",
};

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Настройки" />
      <div className="p-4 lg:p-8">
        <p className="text-text-secondary">Параметры системы</p>
      </div>
    </>
  );
}

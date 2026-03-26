export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Topbar from "@/components/Topbar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { getDashboardData } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Дашборд — Pulse CRM",
};

export default async function DashboardPage() {
  const { deals, recentDeals, monthlyData, totalClients, activeClients } =
    await getDashboardData();

  return (
    <>
      <Topbar title="Дашборд" />
      <DashboardContent
        deals={deals}
        recentDeals={recentDeals}
        monthlyData={monthlyData}
        totalClients={totalClients}
        activeClients={activeClients}
      />
    </>
  );
}

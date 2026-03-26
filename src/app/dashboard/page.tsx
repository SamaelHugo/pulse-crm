export const dynamic = "force-dynamic";

import Topbar from "@/components/Topbar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPieChart from "@/components/dashboard/DealsPieChart";
import RecentDeals from "@/components/dashboard/RecentDeals";
import { getDashboardData } from "@/lib/queries";

export default async function DashboardPage() {
  const { deals, recentDeals, monthlyData, totalClients, activeClients } =
    await getDashboardData();

  return (
    <>
      <Topbar title="Дашборд" />
      <div className="space-y-6 p-8">
        <StatsCards
          deals={deals}
          monthlyData={monthlyData}
          totalClients={totalClients}
          activeClients={activeClients}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart monthlyData={monthlyData} />
          </div>
          <div className="lg:col-span-2">
            <DealsPieChart deals={deals} />
          </div>
        </div>

        <RecentDeals deals={recentDeals} />
      </div>
    </>
  );
}

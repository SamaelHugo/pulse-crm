import Topbar from "@/components/Topbar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPieChart from "@/components/dashboard/DealsPieChart";
import RecentDeals from "@/components/dashboard/RecentDeals";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Дашборд" />
      <div className="space-y-6 p-8">
        {/* Stats Row */}
        <StatsCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart />
          </div>
          <div className="lg:col-span-2">
            <DealsPieChart />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentDeals />
      </div>
    </>
  );
}

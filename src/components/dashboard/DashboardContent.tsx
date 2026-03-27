"use client";

import { PageTransition } from "@/components/animations";
import StatsCards from "./StatsCards";
import RevenueChart from "./RevenueChart";
import DealsPieChart from "./DealsPieChart";
import RecentDeals from "./RecentDeals";
import { FadeIn } from "@/components/animations";
import type { DealData, MonthlyDataPoint } from "@/lib/types";

interface Props {
  deals: DealData[];
  recentDeals: DealData[];
  monthlyData: MonthlyDataPoint[];
  totalClients: number;
  activeClients: number;
}

export default function DashboardContent({
  deals,
  recentDeals,
  monthlyData,
  totalClients,
  activeClients,
}: Props) {
  return (
    <PageTransition>
      <div className="space-y-4 p-4 lg:space-y-6 lg:p-8">
        <StatsCards
          deals={deals}
          monthlyData={monthlyData}
          totalClients={totalClients}
          activeClients={activeClients}
        />

        <FadeIn delay={0.25}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RevenueChart monthlyData={monthlyData} />
            </div>
            <div className="lg:col-span-2">
              <DealsPieChart deals={deals} />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.35}>
          <RecentDeals deals={recentDeals} />
        </FadeIn>
      </div>
    </PageTransition>
  );
}

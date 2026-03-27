export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Topbar from "@/components/Topbar";
import DealsView from "@/components/DealsView";
import { getDealsData } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Сделки — Pulse CRM",
};

export default async function DealsPage() {
  const deals = await getDealsData();

  return (
    <>
      <Topbar title="Сделки" />
      <div className="p-4 lg:p-8">
        <DealsView deals={deals} />
      </div>
    </>
  );
}

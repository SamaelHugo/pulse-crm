export const dynamic = "force-dynamic";

import Topbar from "@/components/Topbar";
import DealsView from "@/components/DealsView";
import { getDealsData } from "@/lib/queries";

export default async function DealsPage() {
  const deals = await getDealsData();

  return (
    <>
      <Topbar title="Сделки" />
      <div className="p-8">
        <DealsView deals={deals} />
      </div>
    </>
  );
}

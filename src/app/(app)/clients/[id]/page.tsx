import { Metadata } from "next";
import Topbar from "@/components/Topbar";
import ClientDetail from "@/components/ClientDetail";
import { getClientDetail } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Клиент — Pulse CRM",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client, deals, notes } = await getClientDetail(id);

  return (
    <>
      <Topbar title="Клиент" />
      <div className="p-4 lg:p-8">
        <ClientDetail client={client} deals={deals} notes={notes} />
      </div>
    </>
  );
}

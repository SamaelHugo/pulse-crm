export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Topbar from "@/components/Topbar";
import ClientsTable from "@/components/ClientsTable";
import { getClientsData } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Клиенты — Pulse CRM",
};

export default async function ClientsPage() {
  const clients = await getClientsData();

  return (
    <>
      <Topbar title="Клиенты" />
      <div className="p-8">
        <ClientsTable clients={clients} />
      </div>
    </>
  );
}

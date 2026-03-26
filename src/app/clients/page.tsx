export const dynamic = "force-dynamic";

import Topbar from "@/components/Topbar";
import ClientsTable from "@/components/ClientsTable";
import { getClientsData } from "@/lib/queries";

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

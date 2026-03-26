import Topbar from "@/components/Topbar";
import ClientsTable from "@/components/ClientsTable";

export default function ClientsPage() {
  return (
    <>
      <Topbar title="Клиенты" />
      <div className="p-8">
        <ClientsTable />
      </div>
    </>
  );
}

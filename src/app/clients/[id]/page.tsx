import Topbar from "@/components/Topbar";
import ClientDetail from "@/components/ClientDetail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Topbar title="Клиент" />
      <div className="p-8">
        <ClientDetail clientId={id} />
      </div>
    </>
  );
}

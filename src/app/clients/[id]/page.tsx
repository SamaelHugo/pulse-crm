import Topbar from "@/components/Topbar";

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
        <p className="text-text-secondary">Профиль клиента #{id}</p>
      </div>
    </>
  );
}

import Topbar from "@/components/Topbar";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Дашборд" />
      <div className="p-8">
        <p className="text-text-secondary">Аналитика и статистика продаж</p>
      </div>
    </>
  );
}

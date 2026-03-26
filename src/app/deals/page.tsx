import Topbar from "@/components/Topbar";
import DealsView from "@/components/DealsView";

export default function DealsPage() {
  return (
    <>
      <Topbar title="Сделки" />
      <div className="p-8">
        <DealsView />
      </div>
    </>
  );
}

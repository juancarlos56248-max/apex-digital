import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CardRequestRow from "@/components/admin/CardRequestRow";

const REQUEST_NOTE = "SOLICITUD TARJETA VIRTUAL APEX";

export default function CardRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => base44.entities.Transaction.filter({ notes: REQUEST_NOTE, status: "pending" }, "-created_date")
    .then(setRequests).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const update = async (request, status) => {
    setBusyId(request.id);
    try {
      await base44.entities.Transaction.update(request.id, { status });
      setRequests(items => items.filter(item => item.id !== request.id));
      toast.success(status === "approved" ? "Tarjeta aprobada." : "Solicitud rechazada.");
    } catch (error) {
      toast.error(error.message || "No se pudo actualizar la solicitud.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-gold/20 border-t-gold" /></div>;
  return (
    <div className="space-y-4">
      <div><h3 className="flex items-center gap-2 font-bold"><CreditCard className="h-5 w-5 text-gold" /> Solicitudes de tarjetas</h3><p className="text-sm text-muted-foreground">Aprueba o rechaza las tarjetas virtuales solicitadas.</p></div>
      {requests.length ? requests.map(request => <CardRequestRow key={request.id} request={request} onUpdate={update} busy={busyId === request.id} />) : <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No hay solicitudes pendientes.</div>}
    </div>
  );
}
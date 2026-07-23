import { Check, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CardRequestRow({ request, onUpdate, busy }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gold/10 p-2"><CreditCard className="h-4 w-4 text-gold" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{request.user_email}</p>
          <p className="text-xs text-muted-foreground">{new Date(request.created_date).toLocaleString("es-PE")}</p>
        </div>
        <span className="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-bold text-warning">Pendiente</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" disabled={busy} onClick={() => onUpdate(request, "rejected")}><X className="h-4 w-4" /> Rechazar</Button>
        <Button disabled={busy} onClick={() => onUpdate(request, "approved")}><Check className="h-4 w-4" /> Aprobar</Button>
      </div>
    </div>
  );
}
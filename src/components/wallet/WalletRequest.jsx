import { Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletRequest({ status, submitting, onSubmit }) {
  const pending = status === "pending";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-card p-5 md:p-6">
      <div className="absolute right-0 top-0 h-24 w-24 bg-gold/10 blur-3xl" />
      <div className="relative">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">Digital access</p>
        <h2 className="mt-2 flex items-center gap-2 font-bold"><Crown className="h-4 w-4 text-gold" /> {pending ? "Solicitud en revisión" : "Solicitar Tarjeta Virtual"}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{pending ? "El administrador debe aprobar tu solicitud antes de activar la tarjeta." : "Envía tu solicitud para que el administrador la revise y apruebe."}</p>
        {!pending && <Button onClick={onSubmit} disabled={submitting} className="mt-5 h-11 w-full bg-gold font-bold text-background hover:bg-gold/90">{submitting ? "Enviando..." : status === "rejected" ? "Volver a solicitar" : "Solicitar mi Tarjeta Virtual"}</Button>}
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><Shield className="h-3.5 w-3.5 text-gold" /> Tarjeta digital segura y sin envío físico.</p>
      </div>
    </div>
  );
}
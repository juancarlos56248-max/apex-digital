import { CheckCircle, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WalletRequest({ requested, form, setForm, submitting, onSubmit }) {
  if (requested) return (
    <div className="rounded-2xl border border-success/30 bg-success/5 p-7 text-center">
      <CheckCircle className="mx-auto h-10 w-10 text-success" />
      <h2 className="mt-3 font-bold text-success">¡Solicitud enviada!</h2>
      <p className="mt-2 text-sm text-muted-foreground">Tu Tarjeta APEX física llegará en <strong className="text-foreground">5–10 días hábiles</strong>.</p>
    </div>
  );

  const fields = [
    ["address", "Dirección de envío", "Av. Javier Prado 1234, Piso 3", "text"],
    ["city", "Ciudad / Distrito", "Lima, Miraflores", "text"],
    ["phone", "Teléfono", "+51 912 345 678", "tel"],
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-card p-5 md:p-6">
      <div className="absolute right-0 top-0 h-24 w-24 bg-gold/10 blur-3xl" />
      <div className="relative">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">Physical access</p>
        <h2 className="mt-2 flex items-center gap-2 font-bold"><Crown className="h-4 w-4 text-gold" /> Solicitar Tarjeta Física</h2>
        <p className="mt-1 text-xs text-muted-foreground">Acceso desbloqueado. Ingresa tus datos de envío:</p>
        <div className="mt-5 space-y-3">
          {fields.map(([key, label, placeholder, type]) => <div key={key}>
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1.5 h-11 border-gold/15 bg-secondary/50 focus-visible:ring-gold" />
          </div>)}
        </div>
        <Button onClick={onSubmit} disabled={submitting} className="mt-5 h-11 w-full bg-gold font-bold text-background hover:bg-gold/90">{submitting ? "Enviando..." : "Solicitar mi Tarjeta APEX"}</Button>
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><Shield className="h-3.5 w-3.5 text-gold" /> Información privada. Solo usada para el envío físico.</p>
      </div>
    </div>
  );
}
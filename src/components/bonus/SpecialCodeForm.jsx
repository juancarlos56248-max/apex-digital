import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CodeRequirements from "@/components/bonus/CodeRequirements";

export default function SpecialCodeForm({ code, setCode, loading, activated, result, stats, onSubmit }) {
  if (activated) return (
    <div className="rounded-xl border border-success/30 bg-success/10 p-8 text-center">
      <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-success" />
      <h2 className="font-bold text-success">Código activado</h2>
      <p className="mt-1 text-sm text-muted-foreground">El bono ya fue acreditado en tu saldo.</p>
    </div>
  );
  return (
    <div className="space-y-5 rounded-xl border border-gold/25 bg-card p-6">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-gold/10 p-3"><KeyRound className="h-5 w-5 text-gold" /></div><div><h2 className="font-semibold">Ingresa tu código</h2><p className="text-xs text-muted-foreground">Debe haber sido entregado por administración.</p></div></div>
      <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ej: APEXXXXXXX" className="font-mono uppercase tracking-widest" />
      <CodeRequirements code={result} stats={stats} />
      <Button onClick={onSubmit} disabled={loading || !code.trim()} className="w-full gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {loading ? "Verificando..." : "Activar código"}
      </Button>
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import OpportunityCountdown from "@/components/opportunity/OpportunityCountdown";
import { OPPORTUNITY_PAYOUT_AT } from "@/lib/opportunitySchedule";

export default function OportunidadDesembolsoManager() {
  const [profitPct, setProfitPct] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [payoutReady, setPayoutReady] = useState(Date.now() >= OPPORTUNITY_PAYOUT_AT);

  const handleDesembolsar = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("desembolsarOportunidad", { profit_pct: Number(profitPct) });
      const data = res.data;
      setResult(data);
      if (data.processed > 0) {
        toast.success(`✅ Desembolso completado: ${data.processed} usuarios acreditados con +${profitPct}%`);
      } else {
        toast.info(data.message || "No había participaciones pendientes.");
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Error al desembolsar");
      toast.error("Error al procesar el desembolso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
        <p className="text-sm font-bold text-gold flex items-center gap-2">
          <Zap className="w-4 h-4" /> Desembolso de Oportunidad Activa
        </p>
        <p className="text-xs text-muted-foreground">
          Acredita el capital + ganancia a todos los usuarios que participaron y aún no han sido desembolsados.
        </p>
      </div>

      {!payoutReady && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">El desembolso se habilita al finalizar los 3 días de inversión:</p>
          <OpportunityCountdown target={OPPORTUNITY_PAYOUT_AT} onComplete={() => setPayoutReady(true)} />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Porcentaje de ganancia (%)</Label>
        <Input
          type="number"
          min={1}
          max={200}
          value={profitPct}
          onChange={(e) => setProfitPct(e.target.value)}
          className="font-mono w-40"
        />
        <p className="text-xs text-muted-foreground">
          Ej: si alguien invirtió <strong className="text-foreground">$100</strong> con ganancia de <strong className="text-gold">{profitPct}%</strong>, recibirá <strong className="text-foreground">${(100 * (1 + Number(profitPct) / 100)).toFixed(2)}</strong> USDT.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Desembolso Completado
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-muted-foreground">Procesados</p>
              <p className="text-xl font-black text-emerald-400">{result.processed}</p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-muted-foreground">Ganancia</p>
              <p className="text-xl font-black text-gold">+{result.profit_pct}%</p>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <p className="text-muted-foreground">Errores</p>
              <p className="text-xl font-black text-destructive">{result.failed}</p>
            </div>
          </div>
          {result.details?.length > 0 && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {result.details.map((d, i) => (
                <div key={i} className="flex justify-between text-xs px-2 py-1.5 rounded bg-black/20">
                  <span className="text-muted-foreground truncate max-w-[55%]">{d.email}</span>
                  <span className="font-mono text-emerald-400">
                    ${d.amount} + ${d.gain} = <strong>${d.total}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleDesembolsar}
        disabled={loading || !profitPct || !payoutReady}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-base gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Procesando desembolso...</>
        ) : (
          <><Zap className="w-4 h-4" /> Desembolsar con +{profitPct}% a Todos</>
        )}
      </Button>
    </div>
  );
}
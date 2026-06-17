import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Zap, Star, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = {
  basic:    { name: "Basic",    gainPct: 3,  lossPct: 1,  icon: Zap,   color: "text-blue-400",   amount: 100 },
  standard: { name: "Standard", gainPct: 5,  lossPct: 2,  icon: Star,  color: "text-gold",        amount: 500 },
  premium:  { name: "Premium",  gainPct: 8,  lossPct: 3,  icon: Crown, color: "text-purple-400",  amount: 1000 },
};

export default function TradingManager() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.TradingPosition.filter({ status: "active" });
    setPositions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const processCycle = async (pos, type) => {
    const plan = PLANS[pos.plan];
    if (!plan) return;
    setProcessing(pos.id + type);

    const pct = type === "win" ? plan.gainPct / 100 : -(plan.lossPct / 100);
    const result = parseFloat((pos.amount * pct).toFixed(2));
    const newResults = [...(pos.daily_results || []), result];
    const newTotal = parseFloat(((pos.total_result || 0) + result).toFixed(2));
    const newDay = (pos.cycle_day || 1) + 1;
    const totalDays = pos.total_days || 7;
    const isCompleted = newDay > totalDays;

    // Fetch user and update balance
    const users = await base44.asServiceRole.entities.User.filter({ email: pos.user_email });
    const u = users[0];

    const updates = [
      base44.entities.TradingPosition.update(pos.id, {
        cycle_day: newDay,
        total_result: newTotal,
        daily_results: newResults,
        last_cycle_date: new Date().toISOString(),
        ...(isCompleted ? { status: "completed" } : {}),
      }),
    ];

    if (u) {
      // On win: add earnings. On loss: deduct from balance. On completion: return capital + net result
      const balanceDelta = isCompleted
        ? pos.amount + newTotal  // return capital + total net
        : result;

      updates.push(
        base44.entities.User.update(u.id, {
          balance: parseFloat(((u.balance || 0) + balanceDelta).toFixed(2)),
        })
      );

      updates.push(
        base44.entities.Transaction.create({
          user_email: pos.user_email,
          type: "dividend",
          amount: result,
          status: "completed",
          notes: `Trading ${plan.name} — Día ${pos.cycle_day} — ${type === "win" ? "Ganancia" : "Pérdida"} ${type === "win" ? "+" : ""}${result} USDT`,
        })
      );

      if (isCompleted) {
        updates.push(
          base44.entities.Transaction.create({
            user_email: pos.user_email,
            type: "dividend",
            amount: pos.amount,
            status: "completed",
            notes: `Trading ${plan.name} — Capital devuelto al completar ciclo`,
          })
        );
      }
    }

    await Promise.all(updates);

    toast.success(`Ciclo procesado: ${type === "win" ? "+" : ""}$${result} para ${pos.user_email}`);
    setProcessing(null);
    load();
  };

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />)}
    </div>
  );

  if (positions.length === 0) return (
    <div className="text-center py-12 text-muted-foreground text-sm">
      No hay posiciones de trading activas
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{positions.length} posición(es) activa(s)</p>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Actualizar
        </button>
      </div>

      {positions.map((pos) => {
        const plan = PLANS[pos.plan];
        if (!plan) return null;
        const Icon = plan.icon;
        const totalDays = pos.total_days || 7;
        const isPositive = (pos.total_result || 0) >= 0;

        return (
          <div key={pos.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${plan.color}`} />
                <div>
                  <p className="text-sm font-bold">{plan.name} — {pos.user_email}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Capital: ${pos.amount} · Día {pos.cycle_day || 1}/{totalDays}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-bold font-mono ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
                {isPositive ? "+" : ""}${(pos.total_result || 0).toFixed(2)}
              </span>
            </div>

            {/* Progress */}
            <div className="flex gap-1">
              {Array.from({ length: totalDays }).map((_, idx) => {
                const r = pos.daily_results?.[idx];
                return (
                  <div key={idx} className={`flex-1 h-1.5 rounded-full ${
                    r === undefined ? "bg-secondary" : r >= 0 ? "bg-emerald-500" : "bg-destructive"
                  }`} />
                );
              })}
            </div>

            {/* Actions */}
            {(pos.cycle_day || 1) <= totalDays && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!!processing}
                  onClick={() => processCycle(pos, "win")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  Ganancia +{plan.gainPct}% (${(pos.amount * plan.gainPct / 100).toFixed(2)})
                </Button>
                <Button
                  size="sm"
                  disabled={!!processing}
                  onClick={() => processCycle(pos, "loss")}
                  variant="outline"
                  className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-8"
                >
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  Pérdida -{plan.lossPct}% (-${(pos.amount * plan.lossPct / 100).toFixed(2)})
                </Button>
              </div>
            )}

            {(pos.cycle_day || 1) > totalDays && (
              <p className="text-xs text-center text-emerald-400 font-medium">✓ Ciclo completado</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
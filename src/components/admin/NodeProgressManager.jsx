import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIER_DAYS = { starter: 30, pro: 60, advance: 30, elite: 90, institutional: 120 };
const TIER_COLORS = {
  starter: "text-blue-400",
  pro: "text-purple-400",
  advance: "text-yellow-400",
  elite: "text-orange-400",
  institutional: "text-emerald-400",
};

export default function NodeProgressManager() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const investments = await base44.entities.Investment.filter({ status: "active" }, "-created_date", 200);
    const now = new Date();
    const result = investments.map((inv) => {
      const totalDays = TIER_DAYS[inv.tier] || 30;
      const elapsed = Math.floor((now - new Date(inv.created_date)) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, totalDays - elapsed);
      const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));
      return { ...inv, totalDays, elapsed, remaining, pct };
    });
    setNodes(result);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{nodes.length} nodos activos</p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />)}
        </div>
      ) : nodes.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No hay nodos activos</p>
      ) : (
        <div className="space-y-3">
          {nodes.map((node) => (
            <div key={node.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground truncate">{node.user_email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-sm font-bold capitalize ${TIER_COLORS[node.tier] || "text-foreground"}`}>
                      {node.tier}
                    </span>
                    <span className="text-sm font-mono text-foreground">${node.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {node.remaining === 0 ? (
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Vencido</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{node.remaining}</span> días restantes
                    </span>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{node.elapsed} / {node.totalDays} días</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${node.pct >= 100 ? "bg-destructive" : node.pct >= 75 ? "bg-yellow-500" : "bg-gold"}`}
                    style={{ width: `${node.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Inicio: {node.created_date?.split("T")[0]}</span>
                  <span>{node.pct}% completado</span>
                </div>
              </div>

              {node.total_earned > 0 && (
                <p className="text-xs text-emerald-400">+${node.total_earned.toFixed(2)} ganado</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
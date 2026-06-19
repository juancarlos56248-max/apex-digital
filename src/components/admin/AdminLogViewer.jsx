import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Globe, RefreshCw, ClipboardList } from "lucide-react";

const ACTION_CONFIG = {
  trading_win:        { label: "Subida individual", icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  trading_loss:       { label: "Bajada individual", icon: TrendingDown, color: "text-destructive",  bg: "bg-destructive/10", border: "border-destructive/20" },
  trading_win_global: { label: "Subida global",     icon: Globe,        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  trading_loss_global:{ label: "Bajada global",     icon: Globe,        color: "text-destructive",  bg: "bg-destructive/10", border: "border-destructive/20" },
};

function fmt(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AdminLog.list("-created_date", 100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-bold">Bitácora de Ajustes de Trading</h2>
        </div>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Refrescar
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-secondary/50 animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay registros aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.trading_win;
            const Icon = cfg.icon;
            const isGlobal = log.action?.includes("global");
            return (
              <div
                key={log.id}
                className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 flex items-start gap-3`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-background/40 flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    {log.symbol && (
                      <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground">
                        {log.symbol}
                      </span>
                    )}
                    {log.percentage > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {log.action?.includes("loss") ? "-" : "+"}{log.percentage}%
                      </span>
                    )}
                    {!isGlobal && log.amount_usd !== undefined && (
                      <span className={`text-[10px] font-mono font-bold ${log.amount_usd >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                        {log.amount_usd >= 0 ? "+" : ""}${log.amount_usd?.toFixed(2)}
                      </span>
                    )}
                    {isGlobal && log.positions_affected > 0 && (
                      <span className="text-[10px] text-muted-foreground">{log.positions_affected} posiciones</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground truncate">
                      Admin: <span className="text-foreground">{log.admin_email}</span>
                    </span>
                    {!isGlobal && log.target_email && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        Usuario: <span className="text-foreground">{log.target_email}</span>
                      </span>
                    )}
                    {log.notes && (
                      <span className="text-[10px] text-muted-foreground italic truncate">{log.notes}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono">
                  {fmt(log.created_date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
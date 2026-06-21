import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, RefreshCw, CheckCircle2,
  ChevronDown, AlertCircle, Zap, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Must match STOCKS in pages/Trading exactly
const STOCKS = {
  aapl:  { symbol: "AAPL", name: "Apple Inc.",          gainPct: 3,  gainPctMin: 3,  gainPctMax: 3,  lossPct: 1, days: 3,  color: "text-blue-400",    accent: "#60a5fa", variable: false },
  msft:  { symbol: "MSFT", name: "Microsoft Corp.",     gainPct: 5,  gainPctMin: 5,  gainPctMax: 5,  lossPct: 2, days: 5,  color: "text-sky-400",     accent: "#38bdf8", variable: false },
  nvda:  { symbol: "NVDA", name: "NVIDIA Corp.",        gainPct: 8,  gainPctMin: 8,  gainPctMax: 8,  lossPct: 3, days: 7,  color: "text-emerald-400", accent: "#34d399", variable: false },
  amzn:  { symbol: "AMZN", name: "Amazon.com Inc.",     gainPct: 12, gainPctMin: 12, gainPctMax: 12, lossPct: 4, days: 9,  color: "text-orange-400",  accent: "#fb923c", variable: false },
  brkb:  { symbol: "BRK.B", name: "Berkshire Hathaway", gainPct: 15, gainPctMin: 15, gainPctMax: 15, lossPct: 5, days: 12, color: "text-gold",         accent: "#c9a84c", variable: false },
  jpm:   { symbol: "JPM",  name: "JPMorgan Chase",      gainPct: 16, gainPctMin: 16, gainPctMax: 16, lossPct: 5, days: 13, color: "text-purple-400",  accent: "#c084fc", variable: false },
  xom:   { symbol: "XOM",  name: "Exxon Mobil",         gainPct: 18, gainPctMin: 14, gainPctMax: 18, lossPct: 5, days: 15, color: "text-rose-400",    accent: "#fb7185", variable: true  },
};

function PositionRow({ pos, processing, onProcess }) {
  const stock = STOCKS[pos.plan];
  const [expanded, setExpanded] = useState(false);
  const [customWinPct, setCustomWinPct] = useState("");

  if (!stock) return null;

  const totalDays = pos.total_days || stock.days;
  const cycleDay = pos.cycle_day || 1;
  const isCompleted = cycleDay > totalDays;
  const totalResult = pos.total_result || 0;
  const isPositive = totalResult >= 0;
  const progress = Math.min((cycleDay - 1) / totalDays, 1);
  const isProcessing = !!processing && processing.startsWith(pos.id);

  const presets = stock.variable
    ? [stock.gainPctMin, Math.round((stock.gainPctMin + stock.gainPctMax) / 2), stock.gainPctMax]
    : [stock.gainPct];

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden transition-all"
      style={{ borderColor: `${stock.accent}30` }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${stock.accent}, transparent)` }} />

      {/* Main row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 text-center">
            <p className={`text-base font-black font-mono ${stock.color}`}>{stock.symbol}</p>
            <p className="text-[9px] text-muted-foreground">Día {cycleDay}/{totalDays}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{pos.user_email}</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              ${pos.amount.toLocaleString()} capital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Completado
            </span>
          ) : (
            <span className={`text-base font-black font-mono ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
              {isPositive ? "+" : ""}${totalResult.toFixed(2)}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress * 100}%`, background: stock.accent }}
          />
        </div>
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const r = pos.daily_results?.[idx];
            return (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-sm ${r === undefined ? "bg-secondary/80" : r >= 0 ? "bg-emerald-500" : "bg-destructive"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="border-t border-border/50 mx-4 mb-4 pt-3 space-y-3">

          {/* Session history */}
          {(pos.daily_results?.length > 0) && (
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Historial</p>
              {pos.daily_results.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground">Sesión {idx + 1}</span>
                  <span className={`font-mono font-bold ${r >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                    {r >= 0 ? "+" : ""}${r.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!isCompleted && (
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                Procesar sesión {cycleDay}{cycleDay === totalDays ? " (ÚLTIMA — devolverá capital)" : ""}
              </p>

              {/* Win buttons */}
              <div className={`grid gap-1.5 ${stock.variable ? "grid-cols-3" : "grid-cols-1"}`}>
                {presets.map(pct => (
                  <Button
                    key={pct}
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => onProcess(pos, "win", pct)}
                    className="text-xs h-9 font-bold"
                    style={{ background: stock.accent, color: "#000" }}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +{pct}% · +${(pos.amount * pct / 100).toFixed(2)}
                  </Button>
                ))}
              </div>

              {/* Custom win % */}
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={customWinPct}
                  onChange={e => setCustomWinPct(e.target.value)}
                  placeholder="% personalizado"
                  className="flex-1 h-8 rounded-md bg-secondary border border-border text-xs px-3 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  min="0" max="100" step="0.1"
                />
                <Button
                  size="sm"
                  disabled={isProcessing || !customWinPct || parseFloat(customWinPct) <= 0}
                  onClick={() => { onProcess(pos, "win", parseFloat(customWinPct)); setCustomWinPct(""); }}
                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Zap className="w-3 h-3 mr-1" /> Aplicar
                </Button>
              </div>

              {/* Loss button */}
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => onProcess(pos, "loss")}
                variant="outline"
                className="w-full h-8 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-bold"
              >
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                Pérdida -{stock.lossPct}% · -${(pos.amount * stock.lossPct / 100).toFixed(2)}
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Ciclo completado — capital + resultado acreditados al usuario
            </div>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl">
          <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function TradingManager() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("active"); // active | completed | all
  const [globalProcessing, setGlobalProcessing] = useState(false);
  const [globalPct, setGlobalPct] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => setAdminEmail(u?.email || "admin")).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const query = filter === "all" ? {} : { status: filter };
      const data = await base44.entities.TradingPosition.filter(query, "-created_date", 100);
      setPositions(data);
    } catch (e) {
      toast.error("Error cargando posiciones: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  // Apply a win or loss to ALL active positions at once
  const applyGlobal = async (type, pct) => {
    const active = positions.filter(p => p.status === "active");
    if (active.length === 0) { toast.error("No hay posiciones activas"); return; }
    setGlobalProcessing(true);

    let processed = 0;
    await Promise.all(active.map(async (pos) => {
      const stock = STOCKS[pos.plan];
      if (!stock) return;
      const totalDays = pos.total_days || stock.days;
      const cycleDay = pos.cycle_day || 1;
      if (cycleDay > totalDays) return;

      const effectivePct = type === "win"
        ? (pct > 0 ? pct : stock.gainPct)
        : -(pct > 0 ? pct : stock.lossPct);
      const result = parseFloat((pos.amount * effectivePct / 100).toFixed(2));
      const newResults = [...(pos.daily_results || []), result];
      const newTotal = parseFloat(((pos.total_result || 0) + result).toFixed(2));
      const newDay = cycleDay + 1;
      const isCompleted = newDay > totalDays;

      const updates = [
        base44.entities.TradingPosition.update(pos.id, {
          cycle_day: newDay,
          total_result: newTotal,
          daily_results: newResults,
          last_cycle_date: new Date().toISOString(),
          ...(isCompleted ? { status: "completed" } : {}),
        }),
      ];

      const users = await base44.entities.User.filter({ email: pos.user_email });
      const u = users[0];
      if (u) {
        const balanceDelta = isCompleted ? pos.amount + result : result;
        updates.push(base44.entities.User.update(u.id, {
          balance: parseFloat(((u.balance || 0) + balanceDelta).toFixed(2)),
        }));
        updates.push(base44.entities.Transaction.create({
          user_email: pos.user_email,
          type: "dividend",
          amount: result,
          status: "completed",
          notes: `Trading ${stock.symbol} — Control Global — ${type === "win" ? "Ganancia" : "Pérdida"} ${result >= 0 ? "+" : ""}$${result} USDT`,
        }));
        if (isCompleted) {
          updates.push(base44.entities.Transaction.create({
            user_email: pos.user_email,
            type: "dividend",
            amount: pos.amount,
            status: "completed",
            notes: `Trading ${stock.symbol} — Capital devuelto al completar ciclo`,
          }));
        }
      }

      await Promise.all(updates);
      processed++;
    }));

    const effectivePct = parseFloat(globalPct) || 0;

    // Bitácora global
    await base44.entities.AdminLog.create({
      admin_email: adminEmail,
      action: type === "win" ? "trading_win_global" : "trading_loss_global",
      target_email: "",
      symbol: "GLOBAL",
      percentage: effectivePct || (type === "win" ? 0 : 0),
      amount_usd: 0,
      positions_affected: processed,
      notes: `Control global — ${processed} posiciones afectadas${effectivePct ? ` — ${effectivePct}% personalizado` : " — % default por activo"}`,
    });

    toast.success(`${type === "win" ? "📈 Subida" : "📉 Bajada"} aplicada a ${processed} posiciones`);
    setGlobalProcessing(false);
    setGlobalPct("");
    load();
  };

  const processCycle = async (pos, type, customPct = null) => {
    const stock = STOCKS[pos.plan];
    if (!stock) return;
    setProcessing(pos.id + type);

    const pct = type === "win"
      ? (customPct !== null ? customPct : stock.gainPct) / 100
      : -(stock.lossPct / 100);
    const result = parseFloat((pos.amount * pct).toFixed(2));
    const newResults = [...(pos.daily_results || []), result];
    const newTotal = parseFloat(((pos.total_result || 0) + result).toFixed(2));
    const newDay = (pos.cycle_day || 1) + 1;
    const totalDays = pos.total_days || stock.days;
    const isCompleted = newDay > totalDays;

    const users = await base44.entities.User.filter({ email: pos.user_email });
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
      // Each session: credit the daily result to balance
      // On completion: also return the capital
      const balanceDelta = isCompleted
        ? pos.amount + newTotal - (pos.total_result || 0) // capital + full final result, minus already credited
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
          notes: `Trading ${stock.symbol} — Sesión ${pos.cycle_day || 1}/${totalDays} — ${type === "win" ? "Ganancia" : "Pérdida"} ${result >= 0 ? "+" : ""}$${result} USDT`,
        })
      );
      if (isCompleted) {
        updates.push(
          base44.entities.Transaction.create({
            user_email: pos.user_email,
            type: "dividend",
            amount: pos.amount,
            status: "completed",
            notes: `Trading ${stock.symbol} — Capital devuelto al completar ciclo de ${totalDays} días`,
          })
        );
      }
    }

    await Promise.all(updates);

    // Bitácora
    await base44.entities.AdminLog.create({
      admin_email: adminEmail,
      action: type === "win" ? "trading_win" : "trading_loss",
      target_email: pos.user_email,
      symbol: stock.symbol,
      percentage: type === "win" ? (customPct !== null ? customPct : stock.gainPct) : stock.lossPct,
      amount_usd: result,
      positions_affected: 1,
      notes: `Sesión ${pos.cycle_day || 1}/${totalDays}${isCompleted ? " — Ciclo completado" : ""}`,
    });

    const label = type === "win" ? `+$${result}` : `-$${Math.abs(result)}`;
    toast.success(`${stock.symbol} · ${label} acreditado a ${pos.user_email}${isCompleted ? " · Ciclo completado ✓" : ""}`);
    setProcessing(null);
    load();
  };

  const activeCount = positions.filter(p => p.status === "active").length;
  const completedCount = positions.filter(p => p.status === "completed").length;

  return (
    <div className="space-y-4">

      {/* Global Market Control */}
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-gold" />
          <p className="text-sm font-bold text-gold">Control Global de Mercado</p>
          <span className="text-[10px] text-muted-foreground ml-auto font-mono">
            {positions.filter(p => p.status === "active").length} posiciones activas
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Aplica un movimiento a <strong>todas</strong> las posiciones activas simultáneamente.
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            value={globalPct}
            onChange={e => setGlobalPct(e.target.value)}
            placeholder="% (vacío = default)"
            className="flex-1 h-9 rounded-lg bg-secondary border border-border text-xs px-3 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            min="0" max="100" step="0.1"
            disabled={globalProcessing}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={globalProcessing}
            onClick={() => applyGlobal("win", parseFloat(globalPct) || 0)}
            className="h-10 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {globalProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-1" />}
            📈 Subida Global
          </Button>
          <Button
            disabled={globalProcessing}
            onClick={() => applyGlobal("loss", parseFloat(globalPct) || 0)}
            variant="outline"
            className="h-10 font-bold text-sm border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            {globalProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            📉 Bajada Global
          </Button>
        </div>
      </div>

      {/* Header + filters */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
          {[
            { id: "active", label: `Activas (${filter === "active" ? positions.length : activeCount})` },
            { id: "completed", label: `Completadas` },
            { id: "all", label: "Todas" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Refrescar
        </button>
      </div>

      {/* Stats summary */}
      {filter === "active" && positions.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-card border border-border p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Posiciones</p>
            <p className="text-lg font-black font-mono">{positions.length}</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Capital total</p>
            <p className="text-sm font-black font-mono text-gold">
              ${positions.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-card border border-border p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">P&L total</p>
            <p className={`text-sm font-black font-mono ${positions.reduce((s, p) => s + (p.total_result || 0), 0) >= 0 ? "text-emerald-400" : "text-destructive"}`}>
              {(() => { const t = positions.reduce((s, p) => s + (p.total_result || 0), 0); return `${t >= 0 ? "+" : ""}$${t.toFixed(2)}`; })()}
            </p>
          </div>
        </div>
      )}

      {/* Positions */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />)}
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {filter === "active" ? "No hay posiciones de trading activas" : "No hay posiciones en esta vista"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative">
          {positions.map(pos => (
            <PositionRow
              key={pos.id}
              pos={pos}
              processing={processing}
              onProcess={processCycle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
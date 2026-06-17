import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Activity, Shield, AlertTriangle, ChevronRight, Wallet, BarChart3, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STOCKS = [
  {
    id: "aapl", symbol: "AAPL", name: "Apple Inc.", category: "Technology",
    desc: "Consumer tech & closed ecosystems leader.",
    amount: 100, gainPct: 3, lossPct: 1, days: 3,
    color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", accent: "#60a5fa",
    change: "+1.24%", sector: "Tech",
  },
  {
    id: "msft", symbol: "MSFT", name: "Microsoft Corp.", category: "Technology",
    desc: "Cloud computing & enterprise software dominance.",
    amount: 500, gainPct: 5, lossPct: 2, days: 5,
    color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", accent: "#38bdf8",
    change: "+2.07%", sector: "Tech", popular: true,
  },
  {
    id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.", category: "Semiconductors · AI",
    desc: "GPU & AI infrastructure world leader.",
    amount: 1000, gainPct: 8, lossPct: 3, days: 7,
    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", accent: "#34d399",
    change: "+3.85%", sector: "AI",
  },
  {
    id: "amzn", symbol: "AMZN", name: "Amazon.com Inc.", category: "E-Commerce · Cloud",
    desc: "Global e-commerce & AWS cloud infrastructure.",
    amount: 2500, gainPct: 12, lossPct: 4, days: 9,
    color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", accent: "#fb923c",
    change: "+1.63%", sector: "Commerce",
  },
  {
    id: "brkb", symbol: "BRK.B", name: "Berkshire Hathaway", category: "Value · Diversified",
    desc: "Warren Buffett's diversified financial conglomerate.",
    amount: 5000, gainPct: 15, lossPct: 5, days: 12,
    color: "text-gold", bg: "bg-gold/10", border: "border-gold/20", accent: "#c9a84c",
    change: "+0.89%", sector: "Value",
  },
  {
    id: "jpm", symbol: "JPM", name: "JPMorgan Chase", category: "Banking · Value",
    desc: "Largest U.S. banking institution by assets.",
    amount: 7500, gainPct: 16, lossPct: 5, days: 13,
    color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", accent: "#c084fc",
    change: "+1.12%", sector: "Finance",
  },
  {
    id: "xom", symbol: "XOM", name: "Exxon Mobil", category: "Energy · Value",
    desc: "Global oil & gas industry giant.",
    amount: 10000, gainPct: 18, gainPctMin: 14, gainPctMax: 18, lossPct: 5, days: 15,
    color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", accent: "#fb7185",
    change: "+0.74%", sector: "Energy", variable: true,
  },
];

function MiniSparkline({ color }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = 40;
    const trend = i * 1.5;
    const noise = Math.sin(i * 2.1) * 6 + Math.cos(i * 0.9) * 4;
    return base + trend + noise;
  });
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = points.map(p => 28 - ((p - min) / (max - min)) * 24);
  const w = 60;
  const step = w / (points.length - 1);
  const d = norm.map((y, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y}`).join(" ");
  return (
    <svg width={w} height="30" viewBox={`0 0 ${w} 30`} fill="none">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PositionCard({ pos, stock }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = Math.max(0, (pos.total_days || stock.days) - (pos.cycle_day || 1) + 1);
  const isPositive = (pos.total_result || 0) >= 0;
  const progress = ((pos.cycle_day || 1) - 1) / (pos.total_days || stock.days);
  const pct = ((pos.total_result || 0) / pos.amount * 100).toFixed(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${stock.border} bg-card overflow-hidden`}
    >
      {/* Header row */}
      <button onClick={() => setExpanded(v => !v)} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stock.bg} border ${stock.border} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-[10px] font-black ${stock.color} leading-none`}>{stock.symbol}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{stock.symbol}
                <span className="ml-2 text-[10px] font-normal text-muted-foreground">{stock.name}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-muted-foreground">${pos.amount.toLocaleString()} capital</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                  Día {pos.cycle_day || 1}/{pos.total_days || stock.days}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className={`text-base font-black font-mono ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
                {isPositive ? "+" : ""}${(pos.total_result || 0).toFixed(2)}
              </p>
              <p className={`text-[10px] font-mono ${isPositive ? "text-emerald-400/70" : "text-destructive/70"}`}>
                {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}{pct}%
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progreso del ciclo</span>
            <span>{daysLeft}d restantes</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(progress * 100, 100)}%`, background: stock.accent }}
            />
          </div>
        </div>

        {/* Day dots */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: pos.total_days || stock.days }).map((_, idx) => {
            const r = pos.daily_results?.[idx];
            return (
              <div key={idx} className={`flex-1 h-1.5 rounded-full ${r === undefined ? "bg-secondary" : r >= 0 ? "bg-emerald-500" : "bg-destructive"}`} />
            );
          })}
        </div>
      </button>

      {/* Expanded: day log */}
      <AnimatePresence>
        {expanded && pos.daily_results?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border mx-4 mb-4 mt-0 pt-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Historial de sesiones</p>
              {pos.daily_results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${result >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                      {idx + 1}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Sesión {idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {result >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                    <span className={`font-mono text-xs font-bold ${result >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {result >= 0 ? "+" : ""}${result.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-mono ${result >= 0 ? "text-emerald-400/60" : "text-destructive/60"}`}>
                      ({result >= 0 ? "+" : ""}{(result / pos.amount * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StockCard({ stock, isActive, activating, onActivate }) {
  const maxGain = stock.amount * (stock.gainPct / 100) * stock.days;
  const maxLoss = stock.amount * (stock.lossPct / 100) * stock.days;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card overflow-hidden relative ${stock.border} ${stock.popular ? "ring-1 ring-offset-0" : ""}`}
      style={stock.popular ? { boxShadow: `0 0 0 1px ${stock.accent}30` } : {}}
    >
      {stock.popular && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${stock.accent}, transparent)` }} />
      )}

      <div className="p-4">
        {/* Top row: ticker + name + live badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${stock.bg} border ${stock.border} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-[11px] font-black ${stock.color} text-center leading-none`}>{stock.symbol}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{stock.symbol}</h3>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">{stock.change}</span>
                {stock.popular && (
                  <span className="text-[9px] bg-gold/20 text-gold font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Hot</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{stock.name}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{stock.category}</span>
            </div>
          </div>
          <div className="text-right">
            <MiniSparkline color={stock.accent} />
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">${stock.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{stock.desc}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="rounded-lg bg-secondary/60 p-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Ciclo</p>
            <p className="text-sm font-black font-mono text-foreground">{stock.days}d</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
            <p className="text-[9px] text-emerald-400 uppercase tracking-wider">Gan/día</p>
            <p className="text-sm font-black font-mono text-emerald-400">
              {stock.variable ? `${stock.gainPctMin}–${stock.gainPctMax}%` : `+${stock.gainPct}%`}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Capital</p>
            <p className="text-xs font-black font-mono text-foreground">${stock.amount >= 1000 ? `${stock.amount / 1000}K` : stock.amount}</p>
          </div>
        </div>

        {/* Potential row */}
        <div className="flex items-center justify-between text-[11px] rounded-lg bg-secondary/40 px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-muted-foreground">Pot. ganancia</span>
            <span className="text-emerald-400 font-mono font-semibold">
              +${stock.variable ? (stock.amount * stock.gainPctMax / 100 * stock.days).toFixed(0) : maxGain.toFixed(0)}
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-destructive/70" />
            <span className="text-muted-foreground">Riesgo máx.</span>
            <span className="text-destructive/80 font-mono font-semibold">-${maxLoss.toFixed(0)}</span>
          </div>
        </div>

        {/* CTA */}
        {isActive ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4" />
            Posición activa · {stock.symbol}
          </div>
        ) : (
          <Button
            onClick={() => onActivate(stock)}
            disabled={!!activating}
            className="w-full h-10 text-sm font-bold rounded-xl transition-all"
            style={{ background: `${stock.accent}22`, border: `1px solid ${stock.accent}44`, color: stock.accent }}
          >
            {activating === stock.id ? (
              <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Abriendo posición...</span>
            ) : (
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Invertir ${stock.amount.toLocaleString()} USDT</span>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function Trading() {
  const { user, setUser } = useOutletContext();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [tab, setTab] = useState("market"); // "market" | "portfolio"

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.TradingPosition.filter({ user_email: user.email, status: "active" })
      .then(data => { setPositions(data); if (data.length > 0) setTab("portfolio"); })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const activeIds = positions.map(p => p.plan);

  const handleActivate = async (stock) => {
    if (activeIds.includes(stock.id)) { toast.error("Ya tienes una posición activa en esta acción"); return; }
    const balance = user?.balance || 0;
    if (balance < stock.amount) { toast.error(`Saldo insuficiente. Necesitas $${stock.amount} USDT`); return; }
    setActivating(stock.id);
    const freshUser = await base44.auth.me();
    if ((freshUser?.balance || 0) < stock.amount) { toast.error("Saldo insuficiente"); setActivating(null); return; }
    const newBalance = (freshUser.balance || 0) - stock.amount;
    const [position] = await Promise.all([
      base44.entities.TradingPosition.create({
        user_email: user.email, plan: stock.id, amount: stock.amount,
        status: "active", cycle_day: 1, total_days: stock.days,
        total_result: 0, daily_results: [], last_cycle_date: new Date().toISOString(),
      }),
      base44.auth.updateMe({ balance: newBalance }),
    ]);
    setUser(prev => ({ ...prev, balance: newBalance }));
    setPositions(prev => [...prev, position]);
    toast.success(`Posición ${stock.symbol} abierta — $${stock.amount.toLocaleString()} USDT`);
    setActivating(null);
    setTab("portfolio");
  };

  const totalInvested = positions.reduce((s, p) => s + p.amount, 0);
  const totalPnl = positions.reduce((s, p) => s + (p.total_result || 0), 0);

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-2xl pb-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">APEX Trading</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Mercado de Acciones</h1>
          <p className="text-xs text-muted-foreground mt-0.5">NYSE · NASDAQ · Ciclos algorítmicos 3–15 días</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Disponible</p>
          <p className="text-lg font-black font-mono text-gold">${(user?.balance || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground font-mono">USDT</p>
        </div>
      </motion.div>

      {/* Portfolio summary — only when positions exist */}
      {positions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Posiciones</p>
            <p className="text-lg font-black font-mono text-foreground">{positions.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Invertido</p>
            <p className="text-base font-black font-mono text-gold">${totalInvested.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl border p-3 text-center ${totalPnl >= 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">P&L</p>
            <p className={`text-base font-black font-mono ${totalPnl >= 0 ? "text-emerald-400" : "text-destructive"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Disclaimer cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-emerald-400">Capital 100% retirable</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">Al completar el ciclo, tu capital se devuelve íntegramente más el resultado neto.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-yellow-400">Mercado real: ganancia & pérdida</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">Cada sesión puede cerrar en positivo o negativo según el comportamiento del activo.</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
        {[
          { id: "market", label: "Mercado", icon: BarChart3 },
          { id: "portfolio", label: `Portafolio${positions.length > 0 ? ` (${positions.length})` : ""}`, icon: Wallet },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Market tab */}
      <AnimatePresence mode="wait">
        {tab === "market" && (
          <motion.div key="market" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
            {STOCKS.map((stock, i) => (
              <motion.div key={stock.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StockCard stock={stock} isActive={activeIds.includes(stock.id)} activating={activating} onActivate={handleActivate} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Portfolio tab */}
        {tab === "portfolio" && (
          <motion.div key="portfolio" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary/50 animate-pulse" />)}
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No tienes posiciones abiertas</p>
                <Button onClick={() => setTab("market")} variant="outline" size="sm" className="text-xs">
                  Ver mercado <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              positions.map(pos => {
                const stock = STOCKS.find(s => s.id === pos.plan);
                if (!stock) return null;
                return <PositionCard key={pos.id} pos={pos} stock={stock} />;
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Activity, Shield, AlertTriangle, ChevronRight,
  Wallet, BarChart3, Zap, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STOCKS = [
  {
    id: "aapl", symbol: "AAPL", name: "Apple Inc.",
    category: "Tecnología", desc: "Líder en tecnología de consumo y ecosistemas cerrados.",
    minAmount: 100, gainPct: 3, lossPct: 1, days: 3,
    color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", accent: "#60a5fa",
    change: "+1.24%",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    logoBg: "bg-white",
  },
  {
    id: "msft", symbol: "MSFT", name: "Microsoft Corp.",
    category: "Tecnología", desc: "Dominancia en nube empresarial y software.",
    minAmount: 500, gainPct: 5, lossPct: 2, days: 5,
    color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", accent: "#38bdf8",
    change: "+2.07%", popular: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    logoBg: "bg-white",
  },
  {
    id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.",
    category: "Chips & IA", desc: "Líder mundial en GPUs e infraestructura de IA.",
    minAmount: 1000, gainPct: 8, lossPct: 3, days: 7,
    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", accent: "#34d399",
    change: "+3.85%",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/6d/Nvidia_image_logo.svg",
    logoBg: "bg-black",
  },
  {
    id: "amzn", symbol: "AMZN", name: "Amazon.com Inc.",
    category: "E-Commerce · Cloud", desc: "E-commerce global y servicios de infraestructura AWS.",
    minAmount: 2500, gainPct: 12, lossPct: 4, days: 9,
    color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", accent: "#fb923c",
    change: "+1.63%",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    logoBg: "bg-white",
  },
  {
    id: "brkb", symbol: "BRK.B", name: "Berkshire Hathaway",
    category: "Valor", desc: "Conglomerado financiero diversificado de Warren Buffett.",
    minAmount: 5000, gainPct: 15, lossPct: 5, days: 12,
    color: "text-gold", bg: "bg-gold/10", border: "border-gold/20", accent: "#c9a84c",
    change: "+0.89%",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Berkshire_Hathaway_Logo.png",
    logoBg: "bg-white",
  },
  {
    id: "jpm", symbol: "JPM", name: "JPMorgan Chase",
    category: "Banca · Valor", desc: "La institución bancaria más grande de EE.UU.",
    minAmount: 7500, gainPct: 16, lossPct: 5, days: 13,
    color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", accent: "#c084fc",
    change: "+1.12%",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg",
    logoBg: "bg-white",
  },
  {
    id: "xom", symbol: "XOM", name: "Exxon Mobil",
    category: "Energía · Valor", desc: "Gigante global del sector petróleo y gas.",
    minAmount: 10000, gainPct: 18, gainPctMin: 14, gainPctMax: 18, lossPct: 5, days: 15,
    color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", accent: "#fb7185",
    change: "+0.74%", variable: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/ExxonMobil_logo.svg",
    logoBg: "bg-white",
  },
];

function StockCard({ stock, isActive, activating, onActivate, userBalance }) {
  const [expanded, setExpanded] = useState(false);
  const [customAmount, setCustomAmount] = useState(String(stock.minAmount));

  const amt = parseFloat(customAmount) || 0;
  const gainPct = stock.variable ? stock.gainPctMax : stock.gainPct;
  const projectedGain = (amt * gainPct / 100 * stock.days).toFixed(2);

  const amountValid = amt >= stock.minAmount && amt <= (userBalance || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card overflow-hidden ${stock.border} ${stock.popular ? "shadow-lg" : ""}`}
      style={stock.popular ? { boxShadow: `0 0 0 1px ${stock.accent}40, 0 4px 24px ${stock.accent}15` } : {}}
    >
      {/* Glow line for popular */}
      {stock.popular && (
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${stock.accent}, transparent)` }} />
      )}

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${stock.logoBg} border ${stock.border} flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5`}>
            <img src={stock.logo} alt={stock.symbol} className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            <span className={`text-xs font-black ${stock.color} hidden`}>{stock.symbol}</span>
          </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">{stock.symbol}</h3>
                <span className="text-xs text-emerald-400 font-mono font-semibold">{stock.change}</span>
                {stock.popular && (
                  <span className="text-[9px] bg-gold/20 text-gold font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">🔥 Popular</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{stock.name}</p>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{stock.category}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${stock.change.startsWith('+') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-destructive/15 text-destructive'}`}>
                  {stock.change.startsWith('+') ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {stock.change}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-muted-foreground">Ciclo</p>
            <p className="text-base font-black font-mono text-foreground">{stock.days}d</p>
            <p className="text-[10px] text-muted-foreground">duración</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{stock.desc}</p>

        {/* Rendimiento stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Rendimiento/día</p>
            </div>
            <p className="text-xl font-black font-mono text-emerald-400">
              {stock.variable ? `${stock.gainPctMin}–${stock.gainPctMax}%` : `+${stock.gainPct}%`}
            </p>
          </div>
          <div className="rounded-xl bg-gold/10 border border-gold/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3 h-3 text-gold" />
              <p className="text-[10px] text-gold font-semibold uppercase tracking-wider">Capital seguro</p>
            </div>
            <p className="text-xl font-black font-mono text-gold">100%</p>
          </div>
        </div>

        {/* Proyección con monto personalizado */}
        {!isActive && (
          <div className="space-y-2 mb-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                Monto a invertir — mínimo ${stock.minAmount.toLocaleString()} USDT
              </p>
              <div className="relative">
                <Input
                  type="number"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className={`bg-secondary border font-mono text-sm pr-16 ${
                    customAmount && !amountValid ? "border-destructive/60" : "border-border"
                  }`}
                  placeholder={`Mín. $${stock.minAmount}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">USDT</span>
              </div>
              {customAmount && amt < stock.minAmount && (
                <p className="text-[10px] text-destructive mt-1">Mínimo ${stock.minAmount.toLocaleString()} USDT</p>
              )}
              {customAmount && amt > (userBalance || 0) && (
                <p className="text-[10px] text-destructive mt-1">Saldo insuficiente (disponible: ${(userBalance || 0).toLocaleString()})</p>
              )}
            </div>

            {/* Proyección */}
            {amt >= stock.minAmount && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Proyección del ciclo ({stock.days} días)</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> Ganancia estimada</span>
                  <span className="font-mono font-bold text-emerald-400">+${projectedGain} USDT</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3 text-gold" /> Capital al finalizar</span>
                  <span className="font-mono font-bold text-gold">${amt.toLocaleString()} USDT</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-emerald-500/20 pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Total estimado a recibir</span>
                  <span className="font-mono font-bold text-emerald-300">≈ ${(amt + parseFloat(projectedGain)).toLocaleString()} USDT</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {isActive ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4" />
            Posición activa en {stock.symbol}
          </div>
        ) : (
          <Button
            onClick={() => onActivate(stock, amt)}
            disabled={!!activating || !amountValid}
            className="w-full h-12 text-sm font-black rounded-xl transition-all relative overflow-hidden"
            style={{
              background: amountValid ? `linear-gradient(135deg, ${stock.accent}dd, ${stock.accent}99)` : undefined,
              color: amountValid ? "#000" : undefined,
            }}
          >
            {activating === stock.id ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Abriendo posición...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Invertir {amt >= stock.minAmount ? `$${amt.toLocaleString()}` : ""} en {stock.symbol}
              </span>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function PositionCard({ pos, stock }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = Math.max(0, (pos.total_days || stock.days) - (pos.cycle_day || 1) + 1);
  const isPositive = (pos.total_result || 0) >= 0;
  const progress = Math.min(((pos.cycle_day || 1) - 1) / (pos.total_days || stock.days), 1);
  const pct = pos.amount > 0 ? ((pos.total_result || 0) / pos.amount * 100).toFixed(2) : "0.00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${stock.border} bg-card overflow-hidden`}
    >
      <button onClick={() => setExpanded(v => !v)} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stock.logoBg} border ${stock.border} flex items-center justify-center overflow-hidden p-1`}>
              <img src={stock.logo} alt={stock.symbol} className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              <span className={`text-[10px] font-black ${stock.color} hidden`}>{stock.symbol}</span>
            </div>
            <div>
              <p className="text-sm font-bold">{stock.symbol} <span className="text-muted-foreground text-xs font-normal">{stock.name}</span></p>
              <p className="text-[11px] text-muted-foreground font-mono">${pos.amount.toLocaleString()} capital · Día {pos.cycle_day || 1}/{pos.total_days || stock.days}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-base font-black font-mono ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
                {isPositive ? "+" : ""}${(pos.total_result || 0).toFixed(2)}
              </p>
              <p className={`text-[10px] font-mono ${isPositive ? "text-emerald-400/70" : "text-destructive/70"}`}>
                {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}{pct}%
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>{daysLeft}d restantes</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: stock.accent }} />
          </div>
        </div>

        <div className="flex gap-1 mt-2">
          {Array.from({ length: pos.total_days || stock.days }).map((_, idx) => {
            const r = pos.daily_results?.[idx];
            return <div key={idx} className={`flex-1 h-1.5 rounded-full ${r === undefined ? "bg-secondary" : r >= 0 ? "bg-emerald-500" : "bg-destructive"}`} />;
          })}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-border mx-4 mb-4 pt-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Historial de sesiones</p>
              {pos.daily_results?.length > 0 ? pos.daily_results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${result >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>{idx + 1}</span>
                    <span className="text-[11px] text-muted-foreground">Sesión {idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {result >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                    <span className={`font-mono text-xs font-bold ${result >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {result >= 0 ? "+" : ""}${result.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-mono ${result >= 0 ? "text-emerald-400/60" : "text-destructive/60"}`}>
                      ({result >= 0 ? "+" : ""}{pos.amount > 0 ? (result / pos.amount * 100).toFixed(2) : "0"}%)
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">Aún no hay sesiones registradas.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Trading() {
  const { user, setUser } = useOutletContext();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [tab, setTab] = useState("market");

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.TradingPosition.filter({ user_email: user.email, status: "active" })
      .then(data => {
        setPositions(data);
        if (data.length > 0) setTab("portfolio");
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const activeIds = positions.map(p => p.plan);

  const handleActivate = async (stock, amount) => {
    if (activeIds.includes(stock.id)) { toast.error("Ya tienes una posición activa en esta acción"); return; }
    const balance = user?.balance || 0;
    if (balance < amount) { toast.error(`Saldo insuficiente. Disponible: $${balance}`); return; }
    setActivating(stock.id);
    const freshUser = await base44.auth.me();
    if ((freshUser?.balance || 0) < amount) { toast.error("Saldo insuficiente"); setActivating(null); return; }
    const newBalance = (freshUser.balance || 0) - amount;
    const [position] = await Promise.all([
      base44.entities.TradingPosition.create({
        user_email: user.email, plan: stock.id, amount,
        status: "active", cycle_day: 1, total_days: stock.days,
        total_result: 0, daily_results: [], last_cycle_date: new Date().toISOString(),
      }),
      base44.auth.updateMe({ balance: newBalance }),
    ]);
    setUser(prev => ({ ...prev, balance: newBalance }));
    setPositions(prev => [...prev, position]);
    toast.success(`✅ Posición ${stock.symbol} abierta — $${amount.toLocaleString()} USDT`);
    setActivating(null);
    setTab("portfolio");
  };

  const totalInvested = positions.reduce((s, p) => s + (p.amount || 0), 0);
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

      {/* P&L summary */}
      {positions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Posiciones</p>
            <p className="text-xl font-black font-mono">{positions.length}</p>
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

      {/* Market Pulse */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">📊 Pulso del mercado</p>
        <div className="flex flex-wrap gap-1.5">
          {STOCKS.map(s => (
            <div key={s.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border ${s.change.startsWith('+') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {s.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {s.symbol} <span className="opacity-80">{s.change}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimers */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-2">
        {/* Risk warning */}
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-3.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-yellow-400 mb-0.5">⚠️ Aviso de riesgo — Lectura obligatoria</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              El trading en acciones implica <span className="text-yellow-300 font-semibold">riesgo real de pérdida parcial</span> del capital invertido. Los resultados de cada sesión dependen del comportamiento del mercado y <span className="text-yellow-300 font-semibold">no están garantizados</span>. Invierte únicamente lo que puedas permitirte perder.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-emerald-400">Capital retirable al finalizar</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">Tu capital inicial se devuelve al completar el ciclo, más o menos el resultado neto.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-emerald-400">Rendimientos diarios acreditados</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">Cada sesión genera rendimientos que se acreditan directamente a tu balance.</p>
            </div>
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Market */}
      <AnimatePresence mode="wait">
        {tab === "market" && (
          <motion.div key="market" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
            {STOCKS.map((stock, i) => (
              <motion.div key={stock.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StockCard
                  stock={stock}
                  isActive={activeIds.includes(stock.id)}
                  activating={activating}
                  onActivate={handleActivate}
                  userBalance={user?.balance || 0}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Portfolio */}
        {tab === "portfolio" && (
          <motion.div key="portfolio" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-3">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary/50 animate-pulse" />)
            ) : positions.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No tienes posiciones abiertas</p>
                <Button onClick={() => setTab("market")} variant="outline" size="sm" className="text-xs">
                  Ver mercado <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
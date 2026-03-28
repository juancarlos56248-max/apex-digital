import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Building2 } from "lucide-react";

const tierConfig = {
  starter: { name: "Apex Starter", icon: Zap, dailyRate: 0.05, color: "text-emerald-400" },
  advance: { name: "Apex Advance", icon: TrendingUp, dailyRate: 0.10, color: "text-blue-400" },
  pro: { name: "Apex Pro", icon: TrendingUp, dailyRate: 0.10, color: "text-blue-400" },
  elite: { name: "Apex Elite", icon: BarChart3, dailyRate: 0.15, color: "text-purple-400" },
  institutional: { name: "Apex Institutional", icon: Building2, dailyRate: 0.20, color: "text-gold" },
};

function LiveTicker({ value }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(null);
  const prevRef = useState(value);

  useEffect(() => {
    if (value !== display) {
      setFlash(value > display ? "up" : "down");
      setDisplay(value);
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`font-mono font-bold transition-colors duration-300 ${
      flash === "up" ? "text-emerald-400" : flash === "down" ? "text-red-400" : "text-foreground"
    }`}>
      ${display.toFixed(4)}
    </span>
  );
}

export default function ActivePortfolio({ investments }) {
  const [liveValues, setLiveValues] = useState({});

  // Simulate tiny live market fluctuations on top of real earned dividends
  useEffect(() => {
    const init = {};
    investments.forEach(inv => {
      init[inv.id] = inv.amount + (inv.total_earned || 0);
    });
    setLiveValues(init);

    const interval = setInterval(() => {
      setLiveValues(prev => {
        const next = { ...prev };
        investments.forEach(inv => {
          const base = inv.amount + (inv.total_earned || 0);
          const fluctuation = (Math.random() - 0.48) * inv.amount * 0.0003;
          next[inv.id] = Math.max(base * 0.999, (prev[inv.id] || base) + fluctuation);
        });
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [investments]);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalEarned = investments.reduce((s, i) => s + (i.total_earned || 0), 0);
  const totalLive = Object.values(liveValues).reduce((s, v) => s + v, 0);
  const totalChangePct = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold">Mis Activos en Vivo</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">EN VIVO</span>
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valor total</p>
          <p className="text-sm font-bold font-mono">${totalLive.toFixed(4)}</p>
        </div>
      </div>

      {/* Portfolio summary bar */}
      <div className="px-5 py-3 bg-secondary/30 flex items-center justify-between border-b border-border">
        <div>
          <p className="text-[11px] text-muted-foreground">Capital invertido</p>
          <p className="text-sm font-mono font-semibold">${totalInvested.toLocaleString()} USDT</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">Dividendos ganados</p>
          <p className="text-sm font-mono font-bold text-emerald-400">
            +${totalEarned.toFixed(4)} USDT
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Rendimiento</p>
          <div className="flex items-center gap-1 justify-end text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-sm font-mono font-bold">+{totalChangePct.toFixed(3)}%</span>
          </div>
        </div>
      </div>

      {/* Individual assets */}
      <div className="divide-y divide-border">
        {investments.map((inv) => {
          const cfg = tierConfig[inv.tier] || tierConfig.starter;
          const Icon = cfg.icon;
          const liveVal = liveValues[inv.id] || inv.amount;
          const change = liveVal - inv.amount;
          const changePct = (change / inv.amount) * 100;
          const isUp = change >= 0;

          return (
            <div key={inv.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{cfg.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Capital: ${inv.amount.toLocaleString()} USDT &bull; +{(cfg.dailyRate * 100).toFixed(0)}%/día
                </p>
              </div>
              <div className="text-right">
                <LiveTicker value={liveVal} />
                <div className="text-[11px] font-mono text-emerald-400">
                  Dividendos: <span className="font-bold">+${(inv.total_earned || 0).toFixed(4)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
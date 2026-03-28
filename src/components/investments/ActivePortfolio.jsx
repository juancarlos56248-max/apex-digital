import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Building2, Clock } from "lucide-react";

const tierConfig = {
  starter: {
    name: "Apex Starter",
    icon: Zap,
    dailyRate: 0.05,
    holdingHours: 4,
    holdingDays: 7,
    stocks: [
      { symbol: "AAPL", name: "Apple Inc.", basePrice: 189.5 },
      { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 415.2 },
    ],
  },
  advance: {
    name: "Apex Advance",
    icon: TrendingUp,
    dailyRate: 0.10,
    holdingHours: 8,
    holdingDays: 14,
    stocks: [
      { symbol: "TSLA", name: "Tesla Inc.", basePrice: 248.3 },
      { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 875.6 },
    ],
  },
  pro: {
    name: "Apex Pro",
    icon: TrendingUp,
    dailyRate: 0.10,
    holdingHours: 8,
    holdingDays: 14,
    stocks: [
      { symbol: "TSLA", name: "Tesla Inc.", basePrice: 248.3 },
      { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 875.6 },
    ],
  },
  elite: {
    name: "Apex Elite",
    icon: BarChart3,
    dailyRate: 0.15,
    holdingHours: 12,
    holdingDays: 21,
    stocks: [
      { symbol: "AMZN", name: "Amazon.com Inc.", basePrice: 198.4 },
      { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 172.8 },
      { symbol: "META", name: "Meta Platforms", basePrice: 512.3 },
    ],
  },
  institutional: {
    name: "Apex Institutional",
    icon: Building2,
    dailyRate: 0.20,
    holdingHours: 24,
    holdingDays: 30,
    stocks: [
      { symbol: "BRK.B", name: "Berkshire Hathaway", basePrice: 456.1 },
      { symbol: "JPM", name: "JPMorgan Chase", basePrice: 218.7 },
      { symbol: "GS", name: "Goldman Sachs", basePrice: 512.9 },
      { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 415.2 },
    ],
  },
};

function useElapsedTime(createdDate) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const start = new Date(createdDate);
      const now = new Date();
      const diffMs = now - start;
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${h}h ${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdDate]);

  return elapsed;
}

function LivePrice({ base }) {
  const [price, setPrice] = useState(base);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPrice(prev => {
        const next = prev + (Math.random() - 0.48) * prev * 0.002;
        setFlash(next >= prev ? "up" : "down");
        setTimeout(() => setFlash(null), 500);
        return parseFloat(next.toFixed(2));
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <span className={`font-mono text-xs font-bold transition-colors duration-300 ${
      flash === "up" ? "text-emerald-400" : flash === "down" ? "text-red-400" : "text-muted-foreground"
    }`}>
      ${price.toFixed(2)}
    </span>
  );
}

function useLiveEarnings(inv) {
  const [liveEarned, setLiveEarned] = useState(inv.total_earned || 0);

  useEffect(() => {
    const dailyRate = 0.10;
    const perSecond = (inv.amount * dailyRate) / (24 * 3600);
    const base = inv.total_earned || 0;
    const baseTime = inv.last_dividend_date ? new Date(inv.last_dividend_date) : new Date(inv.created_date);

    const t = setInterval(() => {
      const secondsElapsed = (new Date() - baseTime) / 1000;
      setLiveEarned(base + perSecond * secondsElapsed);
    }, 100);
    return () => clearInterval(t);
  }, [inv.id, inv.total_earned, inv.last_dividend_date]);

  return liveEarned;
}

function InvestmentCard({ inv }) {
  const cfg = tierConfig[inv.tier] || tierConfig.starter;
  const Icon = cfg.icon;
  const elapsed = useElapsedTime(inv.created_date);
  const liveEarned = useLiveEarnings(inv);

  return (
    <div className="px-5 py-4 space-y-3">
      {/* Nodo header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{cfg.name}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Capital: ${inv.amount.toLocaleString()} USDT &bull; +{(cfg.dailyRate * 100).toFixed(0)}%/día
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold text-emerald-400">
            +${liveEarned.toFixed(6)}
          </p>
          <p className="text-[10px] text-emerald-500 flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            en vivo
          </p>
        </div>
      </div>

      {/* Holding time */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border/50">
        <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
        <span className="text-[11px] text-muted-foreground">Tiempo en posición:</span>
        <span className="text-[11px] font-mono text-gold font-semibold">{elapsed}</span>
        <span className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Ciclo: {cfg.holdingHours}h</span>
          <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold font-semibold">{cfg.holdingDays} días</span>
        </span>
      </div>

      {/* Stocks */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Posiciones activas</p>
        {cfg.stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gold">{stock.symbol}</span>
              <span className="text-[11px] text-muted-foreground">{stock.name}</span>
            </div>
            <LivePrice base={stock.basePrice} />
          </div>
        ))}
      </div>
    </div>
  );
}

function useTotalLiveEarnings(investments) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      let sum = 0;
      for (const inv of investments) {
        const dailyRate = 0.10;
        const perSecond = (inv.amount * dailyRate) / (24 * 3600);
        const base = inv.total_earned || 0;
        const baseTime = inv.last_dividend_date ? new Date(inv.last_dividend_date) : new Date(inv.created_date);
        const secondsElapsed = (now - baseTime) / 1000;
        sum += base + perSecond * secondsElapsed;
      }
      setTotal(sum);
    }, 100);
    return () => clearInterval(t);
  }, [investments]);

  return total;
}

export default function ActivePortfolio({ investments }) {
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalEarned = useTotalLiveEarnings(investments);
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
          <p className="text-xs text-muted-foreground">Dividendos totales</p>
          <p className="text-sm font-bold font-mono text-emerald-400">+${totalEarned.toFixed(6)}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 bg-secondary/30 flex items-center justify-between border-b border-border">
        <div>
          <p className="text-[11px] text-muted-foreground">Capital invertido</p>
          <p className="text-sm font-mono font-semibold">${totalInvested.toLocaleString()} USDT</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">Ganado</p>
          <p className="text-sm font-mono font-bold text-emerald-400">+${totalEarned.toFixed(6)} USDT</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Rendimiento</p>
          <div className="flex items-center gap-1 justify-end text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-sm font-mono font-bold">+{totalChangePct.toFixed(3)}%</span>
          </div>
        </div>
      </div>

      {/* Individual investments */}
      <div className="divide-y divide-border">
        {investments.map((inv) => (
          <InvestmentCard key={inv.id} inv={inv} />
        ))}
      </div>
    </motion.div>
  );
}
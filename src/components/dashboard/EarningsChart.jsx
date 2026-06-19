import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PERIODS = [
  { label: "7D",  key: "week",  days: 7  },
  { label: "1M",  key: "month", days: 30 },
  { label: "1A",  key: "year",  days: 365 },
];

function buildTimeline(transactions, days) {
  const now = new Date();
  const buckets = {};

  // Inicializar todos los días del período en 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  // Agrupar ganancias por día
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  transactions.forEach(tx => {
    if (tx.status !== "completed") return;
    if (tx.type !== "dividend" && tx.type !== "referral_bonus") return;
    const txDate = new Date(tx.created_date);
    if (txDate < cutoff) return;
    const key = txDate.toISOString().slice(0, 10);
    if (key in buckets) {
      buckets[key] = parseFloat(((buckets[key] || 0) + (tx.amount || 0)).toFixed(2));
    }
  });

  // Convertir a array acumulado
  let cumulative = 0;
  return Object.entries(buckets).map(([date, daily]) => {
    cumulative = parseFloat((cumulative + daily).toFixed(2));
    const d = new Date(date);
    const label = days <= 7
      ? d.toLocaleDateString("es", { weekday: "short", day: "numeric" })
      : days <= 30
        ? d.toLocaleDateString("es", { day: "2-digit", month: "short" })
        : d.toLocaleDateString("es", { month: "short", year: "2-digit" });
    return { date, label, daily, cumulative };
  });
}

function aggregateByMonth(transactions, days) {
  // Para 1 año agrupa por mes
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const buckets = {};

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = 0;
  }

  transactions.forEach(tx => {
    if (tx.status !== "completed") return;
    if (tx.type !== "dividend" && tx.type !== "referral_bonus") return;
    const txDate = new Date(tx.created_date);
    if (txDate < cutoff) return;
    const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
    if (key in buckets) {
      buckets[key] = parseFloat(((buckets[key] || 0) + (tx.amount || 0)).toFixed(2));
    }
  });

  let cumulative = 0;
  return Object.entries(buckets).map(([key, daily]) => {
    cumulative = parseFloat((cumulative + daily).toFixed(2));
    const [y, m] = key.split("-");
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return {
      date: key,
      label: d.toLocaleDateString("es", { month: "short", year: "2-digit" }),
      daily,
      cumulative
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const cumulative = payload.find(p => p.dataKey === "cumulative")?.value ?? 0;
  const daily = payload.find(p => p.dataKey === "daily")?.value ?? 0;
  return (
    <div className="rounded-xl border border-gold/25 bg-card/98 backdrop-blur-md px-4 py-3 shadow-2xl shadow-black/60 min-w-[150px]">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className="text-sm font-bold font-mono text-gold">+${cumulative.toFixed(2)}</p>
      <p className="text-[10px] text-muted-foreground mt-1">
        Ese período: <span className={`font-mono font-semibold ${daily >= 0 ? "text-emerald-400" : "text-destructive"}`}>
          {daily >= 0 ? "+" : ""}${daily.toFixed(2)}
        </span>
      </p>
    </div>
  );
};

export default function EarningsChart({ userEmail }) {
  const [period, setPeriod] = useState(PERIODS[1]); // default 1M
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.Transaction.filter(
      { user_email: userEmail },
      "-created_date",
      500
    ).then(txs => {
      setTransactions(txs);
      setLoading(false);
    });
  }, [userEmail]);

  const data = useMemo(() => {
    if (!transactions.length) return [];
    return period.key === "year"
      ? aggregateByMonth(transactions, period.days)
      : buildTimeline(transactions, period.days);
  }, [transactions, period]);

  const totalEarned = data[data.length - 1]?.cumulative ?? 0;
  const firstValue = data[0]?.cumulative ?? 0;
  const change = totalEarned - firstValue;
  const isPositive = change >= 0;
  const hasData = totalEarned > 0;

  if (loading) {
    return <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">Evolución de Ganancias</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rendimientos acumulados reales</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/60 border border-border self-start sm:self-auto">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                period.key === p.key
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-secondary/10">
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total ganado</p>
          <p className="text-base font-bold font-mono text-emerald-400">
            +${totalEarned.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">USDT acumulados</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Variación período</p>
          <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <p className="text-base font-bold font-mono">
              {isPositive ? "+" : ""}${change.toFixed(2)}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">en este período</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 md:h-64 px-1 pt-5 pb-3">
        {!hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">Sin ganancias registradas en este período</p>
            <p className="text-[10px] text-muted-foreground/60">Activa una inversión para ver tu evolución aquí</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ecGreenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,9%)" vertical={false} />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(0,0%,35%)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                interval={period.key === "week" ? 0 : period.key === "month" ? 4 : 1}
                dy={6}
              />
              <YAxis hide domain={["dataMin * 0.95", "dataMax * 1.05"]} />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "hsl(142,71%,45%)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.6 }}
              />

              <ReferenceLine y={0} stroke="hsl(0,0%,15%)" strokeWidth={1} />

              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(142,71%,45%)"
                strokeWidth={2}
                fill="url(#ecGreenFill)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(142,71%,50%)",
                  stroke: "hsl(0,0%,5%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="px-5 pb-4">
        <p className="text-[10px] text-muted-foreground/40">Basado en dividendos y bonos completados en tu cuenta</p>
      </div>
    </div>
  );
}
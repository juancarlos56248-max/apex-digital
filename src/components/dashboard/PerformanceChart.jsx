import { useState, useEffect, useMemo, useRef } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

// Genera datos de mercado realistas con tendencia alcista + volatilidad + drawdowns
function generateMarketData(days = 90) {
  const data = [];
  let value = 10000;
  let trend = 0.0035; // drift diario suave
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Ocasionalmente simula correcciones (-1% a -3%)
    const correction = Math.random() < 0.08 ? -(Math.random() * 0.025 + 0.005) : 0;
    // Volatilidad normal del mercado
    const volatility = (Math.random() - 0.42) * 0.018;
    // Drift positivo con variación
    const drift = trend * (0.5 + Math.random());
    // Pequeño momentum
    trend = Math.max(0.001, Math.min(0.006, trend + (Math.random() - 0.5) * 0.0005));

    value = Math.max(9000, value * (1 + drift + volatility + correction));

    // Genera un high y low intradía para riqueza visual
    const intraHigh = value * (1 + Math.random() * 0.008);
    const intraLow = value * (1 - Math.random() * 0.008);

    data.push({
      date: date.toLocaleDateString("es", { day: "2-digit", month: "short" }),
      value: Math.round(value * 100) / 100,
      high: Math.round(intraHigh * 100) / 100,
      low: Math.round(intraLow * 100) / 100,
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const h = payload.find(p => p.dataKey === "high")?.value;
  const l = payload.find(p => p.dataKey === "low")?.value;
  return (
    <div className="rounded-xl border border-gold/25 bg-card/98 backdrop-blur-md px-4 py-3 shadow-2xl shadow-black/60 min-w-[140px]">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className="text-sm font-bold font-mono text-gold mb-1">${v?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      {h && l && (
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-emerald-400">↑ ${h?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-red-400">↓ ${l?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      )}
    </div>
  );
};

const PERIODS = [
  { label: "30D", days: 30 },
  { label: "60D", days: 60 },
  { label: "90D", days: 90 },
];

function AnimatedValue({ value, prefix = "", suffix = "", className = "" }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const diff = end - start;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className={className}>
      {prefix}{Math.round(display).toLocaleString()}{suffix}
    </span>
  );
}

export default function PerformanceChart() {
  const [allData] = useState(() => generateMarketData(90));
  const [liveData, setLiveData] = useState(allData);
  const [period, setPeriod] = useState(30);
  const [pulse, setPulse] = useState(false);

  // Tick en tiempo real cada 3s: actualiza el último punto con micro-movimientos
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => {
        const last = prev[prev.length - 1];
        const micro = (Math.random() - 0.44) * last.value * 0.003;
        const newVal = Math.max(9000, last.value + micro + last.value * 0.0008);
        const updated = [...prev.slice(0, -1), {
          ...last,
          value: Math.round(newVal * 100) / 100,
          high: Math.max(last.high, Math.round(newVal * (1 + Math.random() * 0.004) * 100) / 100),
          low: Math.min(last.low, Math.round(newVal * (1 - Math.random() * 0.004) * 100) / 100),
        }];
        setPulse(p => !p);
        return updated;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const data = useMemo(() => liveData.slice(-period), [liveData, period]);

  const currentValue = data[data.length - 1]?.value ?? 0;
  const startValue = data[0]?.value ?? 0;
  const profit = currentValue - startValue;
  const performance = startValue > 0 ? ((profit / startValue) * 100).toFixed(2) : "0.00";
  const isPositive = Number(performance) >= 0;

  // Referencia a la mitad del rango para la línea de base
  const midValue = useMemo(() => {
    const vals = data.map(d => d.value);
    return (Math.max(...vals) + Math.min(...vals)) / 2;
  }, [data]);

  const tickInterval = period === 30 ? 5 : period === 60 ? 9 : 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">Rendimiento del Portafolio</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] text-emerald-400 font-medium">EN VIVO</p>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/60 border border-border self-start sm:self-auto">
          {PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.days)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                period === p.days
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-secondary/10">
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Valor actual</p>
          <p className="text-base font-bold font-mono">
            <AnimatedValue value={currentValue} prefix="$" />
          </p>
          <p className="text-[10px] text-muted-foreground">USDT</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ganancia</p>
          <p className={`text-base font-bold font-mono ${isPositive ? "text-success" : "text-destructive"}`}>
            <AnimatedValue value={profit} prefix={isPositive ? "+$" : "-$"} />
          </p>
          <p className="text-[10px] text-muted-foreground">USDT</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Variación</p>
          <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <p className="text-base font-bold font-mono">{isPositive ? "+" : ""}{performance}%</p>
          </div>
          <p className="text-[10px] text-muted-foreground">en el período</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 md:h-80 px-1 pt-5 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pcGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(40,60%,60%)" stopOpacity={0.35} />
                <stop offset="40%" stopColor="hsl(40,52%,50%)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="hsl(40,52%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pcRangeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142,71%,45%)" stopOpacity={0.06} />
                <stop offset="100%" stopColor="hsl(142,71%,45%)" stopOpacity={0.01} />
              </linearGradient>
              <filter id="pcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="hsl(0,0%,9%)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0,0%,35%)", fontSize: 9, fontFamily: "var(--font-mono)" }}
              interval={tickInterval}
              dy={6}
            />
            <YAxis
              hide
              domain={["dataMin * 0.965", "dataMax * 1.035"]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "hsl(40,52%,56%)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.7 }}
            />

            {/* Línea de referencia al inicio del período */}
            <ReferenceLine
              y={startValue}
              stroke="hsl(0,0%,20%)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            {/* Área de rango high/low (banda de volatilidad) */}
            <Area
              type="monotone"
              dataKey="high"
              stroke="none"
              fill="url(#pcRangeFill)"
              dot={false}
              activeDot={false}
              legendType="none"
            />

            {/* Área principal del valor */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(40,58%,60%)"
              strokeWidth={2}
              fill="url(#pcGoldFill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "hsl(40,60%,65%)",
                stroke: "hsl(0,0%,5%)",
                strokeWidth: 2,
                filter: "url(#pcGlow)",
              }}
              filter="url(#pcGlow)"
            />

            {/* Línea de low (sombra inferior) */}
            <Line
              type="monotone"
              dataKey="low"
              stroke="hsl(0,72%,45%)"
              strokeWidth={0.8}
              strokeOpacity={0.25}
              dot={false}
              activeDot={false}
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-gold/60 inline-block" /> Valor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-emerald-500/40 inline-block" /> Máx.
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-red-500/30 inline-block" /> Mín.
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/40">Simulación · No garantiza rendimientos futuros</p>
      </div>
    </motion.div>
  );
}
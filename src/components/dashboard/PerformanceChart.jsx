import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";

function generateMarketData() {
  const data = [];
  let value = 10000;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dailyGrowth = value * 0.10 * (0.7 + Math.random() * 0.6);
    const noise = (Math.random() - 0.3) * value * 0.02;
    value = Math.max(10000, value + dailyGrowth + noise);
    data.push({
      date: date.toLocaleDateString("es", { day: "2-digit", month: "short" }),
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gold/20 bg-card/95 backdrop-blur-sm px-3.5 py-2.5 shadow-xl shadow-black/40">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold font-mono text-gold">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
];

export default function PerformanceChart() {
  const [allData, setAllData] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setAllData(generateMarketData());
    const interval = setInterval(() => {
      setAllData(prev => {
        const last = prev[prev.length - 1];
        const dailyGrowth = last.value * 0.10 / 24;
        const noise = (Math.random() - 0.3) * last.value * 0.005;
        const newVal = last.value + dailyGrowth + noise;
        return [...prev.slice(1), {
          date: new Date().toLocaleDateString("es", { day: "2-digit", month: "short" }),
          value: Math.round(Math.max(10000, newVal) * 100) / 100,
        }];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const data = useMemo(() => allData.slice(-period), [allData, period]);

  const performance = useMemo(() => {
    if (data.length < 2) return 0;
    return (((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2);
  }, [data]);

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  const startValue = data.length > 0 ? data[0].value : 0;
  const profit = currentValue - startValue;
  const isPositive = Number(performance) >= 0;

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
            <p className="text-[11px] text-muted-foreground mt-0.5">Simulación algorítmica de activos</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/60 border border-border self-start sm:self-auto">
          {PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.days)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
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
          <p className="text-base font-bold font-mono">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ganancia</p>
          <p className={`text-base font-bold font-mono ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : ""}${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Variación</p>
          <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-destructive"}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <p className="text-base font-bold font-mono">{isPositive ? "+" : ""}{performance}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 md:h-72 px-1 pt-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradientFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(40,52%,56%)" stopOpacity={0.45} />
                <stop offset="60%" stopColor="hsl(40,52%,56%)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="hsl(40,52%,56%)" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0,0%,10%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0,0%,38%)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              interval={Math.floor(data.length / 5)}
              dy={6}
            />
            <YAxis
              hide
              domain={["dataMin * 0.97", "dataMax * 1.03"]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(40,52%,56%)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotoneX"
              dataKey="value"
              stroke="hsl(40,52%,62%)"
              strokeWidth={2.5}
              fill="url(#goldGradientFill)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(40,52%,62%)", stroke: "hsl(0,0%,6%)", strokeWidth: 2 }}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer disclaimer */}
      <div className="px-5 pb-4 text-[10px] text-muted-foreground/50 text-center">
        Datos simulados con fines ilustrativos. No representan rendimientos reales garantizados.
      </div>
    </motion.div>
  );
}
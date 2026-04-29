import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

function generateMarketData() {
  const data = [];
  let value = 10000;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Tendencia alcista: crecimiento con dividendos diarios del 10%
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

export default function PerformanceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateMarketData());
    const interval = setInterval(() => {
      setData(prev => {
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

  const performance = useMemo(() => {
    if (data.length < 2) return 0;
    return (((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Rendimiento del Portafolio</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Últimos 30 días</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold font-mono">
            ${data.length > 0 ? data[data.length - 1].value.toLocaleString() : "0"}
          </p>
          <p className={`text-xs font-mono font-medium ${Number(performance) >= 0 ? "text-success" : "text-destructive"}`}>
            {Number(performance) >= 0 ? "+" : ""}{performance}%
          </p>
        </div>
      </div>

      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(40, 52%, 56%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(40, 52%, 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(0,0%,45%)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              hide 
              domain={["dataMin - 200", "dataMax + 200"]} 
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 6%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(0,0%,55%)" }}
              formatter={(val) => [`$${val.toLocaleString()}`, "Valor"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(40, 52%, 56%)"
              strokeWidth={2.5}
              fill="url(#goldGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
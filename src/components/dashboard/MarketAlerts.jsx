import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, X, Bell } from "lucide-react";

const STOCKS = [
  { symbol: "AAPL", base: 5.20, target: 9.36 },
  { symbol: "MSFT", base: 6.80, target: 8.50 },
  { symbol: "TSLA", base: 3.40, target: 6.12 },
  { symbol: "NVDA", base: 7.50, target: 9.20 },
  { symbol: "AMZN", base: 4.90, target: 8.82 },
  { symbol: "GOOGL", base: 6.10, target: 7.30 },
  { symbol: "META", base: 5.70, target: 10.26 },
  { symbol: "NFLX", base: 4.20, target: 7.56 },
];

const THRESHOLD = 5; // % umbral

export default function MarketAlerts() {
  const [alerts, setAlerts] = useState([]);
  const pricesRef = useRef({});
  const alertedRef = useRef(new Set());

  useEffect(() => {
    // Inicializa precios base
    STOCKS.forEach(s => { pricesRef.current[s.symbol] = s.base; });

    const interval = setInterval(() => {
      STOCKS.forEach((stock) => {
        const prev = pricesRef.current[stock.symbol];
        const TARGET = stock.target;
        const distanceToTarget = TARGET - prev;
        const drift = distanceToTarget > 0 ? distanceToTarget * 0.00008 : 0;
        const noise = (Math.random() - 0.1) * prev * 0.0001;
        const next = parseFloat(Math.min(prev + drift + noise, TARGET * 1.05).toFixed(2));
        pricesRef.current[stock.symbol] = next;

        const changePct = ((next - stock.base) / stock.base) * 100;
        const absChange = Math.abs(changePct);

        if (absChange >= THRESHOLD) {
          const key = `${stock.symbol}-${changePct > 0 ? "up" : "down"}-${Math.floor(absChange / THRESHOLD)}`;
          if (!alertedRef.current.has(key)) {
            alertedRef.current.add(key);
            const id = Date.now() + Math.random();
            const isUp = changePct > 0;
            setAlerts(prev => [
              {
                id,
                symbol: stock.symbol,
                change: changePct.toFixed(2),
                price: next.toFixed(2),
                isUp,
              },
              ...prev.slice(0, 4),
            ]);
            // Auto-dismiss después de 6s
            setTimeout(() => {
              setAlerts(prev => prev.filter(a => a.id !== id));
            }, 6000);
          }
        }
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 lg:bottom-6 lg:right-6 max-w-xs w-full">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
              ${alert.isUp
                ? "bg-emerald-950/90 border-emerald-500/30"
                : "bg-red-950/90 border-red-500/30"
              }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${alert.isUp ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
              {alert.isUp
                ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                : <TrendingDown className="w-4 h-4 text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <p className={`text-xs font-bold font-mono ${alert.isUp ? "text-emerald-300" : "text-red-300"}`}>
                  {alert.symbol}
                </p>
                <span className={`text-xs font-mono font-semibold ${alert.isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {alert.isUp ? "▲" : "▼"} {alert.isUp ? "+" : ""}{alert.change}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {alert.isUp ? "Superó" : "Cayó"} el umbral del {THRESHOLD}% · ${alert.price}
              </p>
            </div>
            <button
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
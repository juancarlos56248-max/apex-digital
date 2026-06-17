import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STOCKS = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Tecnología · Crecimiento",
    desc: "Lidera en tecnología de consumo y ecosistemas cerrados.",
    amount: 100,
    gainPct: 3,
    lossPct: 1,
    days: 3,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    category: "Tecnología · Crecimiento",
    desc: "Domina la computación en la nube y software empresarial.",
    amount: 500,
    gainPct: 5,
    lossPct: 2,
    days: 5,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    popular: true,
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "Chips & IA",
    desc: "Lidera el desarrollo de chips e inteligencia artificial.",
    amount: 1000,
    gainPct: 8,
    lossPct: 3,
    days: 7,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    id: "amzn",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    category: "E-Commerce",
    desc: "Domina el comercio electrónico global y servicios de infraestructura digital.",
    amount: 2500,
    gainPct: 12,
    lossPct: 4,
    days: 9,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    id: "brkb",
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    category: "Valor",
    desc: "Conglomerado financiero diversificado gestionado por Warren Buffett.",
    amount: 5000,
    gainPct: 15,
    lossPct: 5,
    days: 12,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    id: "jpm",
    symbol: "JPM",
    name: "JPMorgan Chase",
    category: "Valor · Bancario",
    desc: "La institución bancaria más grande de Estados Unidos.",
    amount: 7500,
    gainPct: 16,
    lossPct: 5,
    days: 13,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    id: "xom",
    symbol: "XOM",
    name: "Exxon Mobil",
    category: "Valor · Energía",
    desc: "Gigante del sector energético, petróleo y gas tradicional.",
    amount: 10000,
    gainPct: 18,
    gainPctMin: 14,
    gainPctMax: 18,
    lossPct: 5,
    days: 15,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    variable: true,
  },
];

export default function Trading() {
  const { user, setUser } = useOutletContext();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.TradingPosition.filter({ user_email: user.email, status: "active" })
      .then(setPositions)
      .finally(() => setLoading(false));
  }, [user?.email]);

  const activeIds = positions.map(p => p.plan);

  const handleActivate = async (stock) => {
    if (activeIds.includes(stock.id)) {
      toast.error("Ya tienes una posición activa en esta acción");
      return;
    }
    const balance = user?.balance || 0;
    if (balance < stock.amount) {
      toast.error(`Saldo insuficiente. Necesitas $${stock.amount} USDT`);
      return;
    }

    setActivating(stock.id);
    const freshUser = await base44.auth.me();
    if ((freshUser?.balance || 0) < stock.amount) {
      toast.error("Saldo insuficiente");
      setActivating(null);
      return;
    }

    const newBalance = (freshUser.balance || 0) - stock.amount;
    const [position] = await Promise.all([
      base44.entities.TradingPosition.create({
        user_email: user.email,
        plan: stock.id,
        amount: stock.amount,
        status: "active",
        cycle_day: 1,
        total_days: stock.days,
        total_result: 0,
        daily_results: [],
        last_cycle_date: new Date().toISOString(),
      }),
      base44.auth.updateMe({ balance: newBalance }),
    ]);

    setUser(prev => ({ ...prev, balance: newBalance }));
    setPositions(prev => [...prev, position]);
    toast.success(`Posición ${stock.symbol} activada — $${stock.amount} USDT invertidos`);
    setActivating(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Trading de Acciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invierte en acciones reales · ciclos de 3 a 15 días · capital devuelto + resultado neto al completar
        </p>
      </motion.div>

      {/* Aviso de riesgo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-3 flex gap-2.5 items-start"
      >
        <span className="text-yellow-400 text-base leading-none mt-0.5">⚠️</span>
        <p className="text-[12px] text-yellow-300/80 leading-relaxed">
          El trading implica <span className="font-bold text-yellow-400">riesgo de pérdida</span>. Cada día el mercado puede generar ganancia o pérdida. Al finalizar el ciclo recibes tu <span className="font-semibold text-foreground">capital ± resultado neto acumulado</span>.
        </p>
      </motion.div>

      {/* Balance disponible */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-secondary/30 p-3 flex items-center justify-between"
      >
        <span className="text-xs text-muted-foreground">Saldo disponible</span>
        <span className="text-sm font-bold font-mono text-gold">${(user?.balance || 0).toLocaleString()} USDT</span>
      </motion.div>

      {/* Acciones disponibles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Acciones disponibles</p>
        </div>

        {STOCKS.map((stock, i) => {
          const isActive = activeIds.includes(stock.id);
          const maxGain = stock.amount * (stock.gainPct / 100) * stock.days;

          return (
            <motion.div
              key={stock.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border bg-card p-5 relative overflow-hidden ${stock.border} ${stock.popular ? "ring-1 ring-sky-400/30" : ""}`}
            >
              {stock.popular && (
                <span className="absolute top-3 right-3 text-[10px] bg-sky-400/20 text-sky-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
              )}
              <div className="flex items-start gap-4">
                {/* Ticker badge */}
                <div className={`w-14 h-14 rounded-xl ${stock.bg} border ${stock.border} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-[11px] font-black ${stock.color} text-center leading-tight`}>{stock.symbol}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div>
                      <h3 className={`text-base font-bold ${stock.color}`}>{stock.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{stock.category}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono flex-shrink-0">${stock.amount.toLocaleString()} USDT</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{stock.desc}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="rounded-lg bg-secondary/60 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Duración</p>
                      <p className="text-sm font-bold font-mono">{stock.days}d</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                      <p className="text-[10px] text-emerald-400">Ganancia/día</p>
                      <p className="text-sm font-bold font-mono text-emerald-400">
                        {stock.variable ? `${stock.gainPctMin}–${stock.gainPctMax}%` : `+${stock.gainPct}%`}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {stock.variable
                      ? <>Ganancia variable: <span className="text-emerald-400 font-mono">{stock.gainPctMin}–{stock.gainPctMax}%/día</span></>
                      : <>Potencial máx: <span className="text-emerald-400 font-mono">+${maxGain.toFixed(2)}</span></>
                    }
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {isActive ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Posición activa en {stock.symbol}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleActivate(stock)}
                    disabled={activating === stock.id}
                    className={`w-full h-9 text-sm font-semibold ${stock.popular ? `bg-sky-500 hover:bg-sky-600 text-white` : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"}`}
                  >
                    {activating === stock.id ? "Activando..." : `Invertir en ${stock.symbol} — $${stock.amount.toLocaleString()} USDT`}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Posiciones activas */}
      {!loading && positions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mis posiciones activas</p>
          {positions.map((pos) => {
            const stock = STOCKS.find(s => s.id === pos.plan);
            if (!stock) return null;
            const daysLeft = (pos.total_days || stock.days) - (pos.cycle_day || 1) + 1;
            const isPositive = (pos.total_result || 0) >= 0;

            return (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl border bg-card p-4 ${stock.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg ${stock.bg} border ${stock.border} flex items-center justify-center`}>
                      <span className={`text-[10px] font-black ${stock.color}`}>{stock.symbol}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${stock.color}`}>{stock.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">${pos.amount.toLocaleString()} USDT</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${isPositive ? "text-emerald-400" : "text-destructive"}`}>
                      {isPositive ? "+" : ""}${(pos.total_result || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">resultado acumulado</p>
                  </div>
                </div>

                {/* Progress días */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: pos.total_days || stock.days }).map((_, idx) => {
                    const dayResult = pos.daily_results?.[idx];
                    return (
                      <div
                        key={idx}
                        className={`flex-1 h-1.5 rounded-full ${
                          dayResult === undefined ? "bg-secondary" : dayResult >= 0 ? "bg-emerald-500" : "bg-destructive"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Día {pos.cycle_day || 1} de {pos.total_days || stock.days}</span>
                  </div>
                  <span>{daysLeft} día(s) restantes</span>
                </div>

                {/* Historial de días */}
                {pos.daily_results && pos.daily_results.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {pos.daily_results.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Día {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          {result >= 0
                            ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                            : <TrendingDown className="w-3 h-3 text-destructive" />
                          }
                          <span className={`font-mono font-semibold ${result >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {result >= 0 ? "+" : ""}${result.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
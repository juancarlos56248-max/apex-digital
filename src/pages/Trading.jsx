import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Star, Crown, Clock, CheckCircle2, Flame, Building2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Tecnología",
    desc: "Lidera en tecnología de consumo y ecosistemas cerrados.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    category: "Tecnología",
    desc: "Domina la computación en la nube y software empresarial.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "Chips & IA",
    desc: "Lidera el desarrollo de chips e inteligencia artificial.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    category: "E-Commerce",
    desc: "Domina el comercio electrónico global y servicios de infraestructura digital.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    category: "Valor",
    desc: "Conglomerado financiero diversificado gestionado por Warren Buffett.",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    category: "Valor",
    desc: "La institución bancaria más grande de Estados Unidos.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil",
    category: "Valor",
    desc: "Gigante del sector energético, petróleo y gas tradicional.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
];

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    icon: Zap,
    amount: 100,
    gainPct: 3,
    lossPct: 1,
    days: 3,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    id: "standard",
    name: "Standard",
    icon: Star,
    amount: 500,
    gainPct: 5,
    lossPct: 2,
    days: 5,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    amount: 1000,
    gainPct: 8,
    lossPct: 3,
    days: 7,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    id: "advance",
    name: "Advance",
    icon: Flame,
    amount: 2500,
    gainPct: 12,
    lossPct: 4,
    days: 9,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    amount: 5000,
    gainPct: 15,
    lossPct: 5,
    days: 12,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  {
    id: "institutional",
    name: "Institutional",
    icon: Building2,
    amount: 10000,
    gainPct: 18,
    gainPctMin: 14,
    gainPctMax: 18,
    lossPct: 5,
    days: 15,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
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

  const handleActivate = async (plan) => {
    if (activeIds.includes(plan.id)) {
      toast.error("Ya tienes una posición activa en este plan");
      return;
    }
    const balance = user?.balance || 0;
    if (balance < plan.amount) {
      toast.error(`Saldo insuficiente. Necesitas $${plan.amount} USDT`);
      return;
    }

    setActivating(plan.id);
    const freshUser = await base44.auth.me();
    if ((freshUser?.balance || 0) < plan.amount) {
      toast.error("Saldo insuficiente");
      setActivating(null);
      return;
    }

    const newBalance = (freshUser.balance || 0) - plan.amount;
    const [position] = await Promise.all([
      base44.entities.TradingPosition.create({
        user_email: user.email,
        plan: plan.id,
        amount: plan.amount,
        status: "active",
        cycle_day: 1,
        total_days: plan.days,
        total_result: 0,
        daily_results: [],
        last_cycle_date: new Date().toISOString(),
      }),
      base44.auth.updateMe({ balance: newBalance }),
    ]);

    setUser(prev => ({ ...prev, balance: newBalance }));
    setPositions(prev => [...prev, position]);
    toast.success(`Posición ${plan.name} activada — $${plan.amount} USDT en trading`);
    setActivating(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Trading de Inversión</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ciclos de 3 a 15 días con ganancias y pérdidas controladas por el mercado
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

      {/* Activos del portafolio */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Activos del portafolio</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {STOCKS.map((s) => (
            <div key={s.symbol} className={`rounded-xl border ${s.border} bg-card px-4 py-3 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-[11px] font-black ${s.color}`}>{s.symbol.replace(".","")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${s.color}`}>{s.symbol}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{s.category}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">{s.name} · {s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Planes */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Planes disponibles</p>
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isActive = activeIds.includes(plan.id);
          const maxGain = plan.amount * (plan.gainPct / 100) * plan.days;
          const maxLoss = plan.amount * (plan.lossPct / 100) * plan.days;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border bg-card p-5 relative overflow-hidden ${plan.border} ${plan.popular ? "ring-1 ring-gold/30" : ""}`}
            >
              {plan.popular && (
                <span className="absolute top-3 right-3 text-[10px] bg-gold/20 text-gold font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${plan.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${plan.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold ${plan.color}`}>{plan.name}</h3>
                    <span className="text-xs text-muted-foreground font-mono">${plan.amount.toLocaleString()} USDT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="rounded-lg bg-secondary/60 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Duración</p>
                      <p className="text-sm font-bold font-mono">{plan.days}d</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                      <p className="text-[10px] text-emerald-400">Ganancia/día</p>
                      <p className="text-sm font-bold font-mono text-emerald-400">
                        {plan.variable ? `${plan.gainPctMin}–${plan.gainPctMax}%` : `+${plan.gainPct}%`}
                      </p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-center">
                      <p className="text-[10px] text-destructive">Pérdida/día</p>
                      <p className="text-sm font-bold font-mono text-destructive">-{plan.lossPct}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {plan.variable
                      ? <>Ganancia variable según el mercado: <span className="text-emerald-400 font-mono">{plan.gainPctMin}%–{plan.gainPctMax}%/día</span></>
                      : <>Máx. ganancia: <span className="text-emerald-400 font-mono">+${maxGain.toFixed(2)}</span> · Máx. pérdida: <span className="text-destructive font-mono">-${maxLoss.toFixed(2)}</span></>
                    }
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {isActive ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Posición activa en este plan
                  </div>
                ) : (
                  <Button
                    onClick={() => handleActivate(plan)}
                    disabled={activating === plan.id}
                    className={`w-full h-9 text-sm font-semibold ${plan.popular ? "bg-gold hover:bg-gold-dark text-black" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"}`}
                  >
                    {activating === plan.id ? "Activando..." : `Invertir $${plan.amount.toLocaleString()} USDT`}
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
            const plan = PLANS.find(p => p.id === pos.plan);
            if (!plan) return null;
            const Icon = plan.icon;
            const daysLeft = (pos.total_days || plan.days) - (pos.cycle_day || 1) + 1;
            const isPositive = (pos.total_result || 0) >= 0;

            return (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl border bg-card p-4 ${plan.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${plan.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${plan.color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${plan.color}`}>{plan.name}</p>
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
                  {Array.from({ length: pos.total_days || plan.days }).map((_, idx) => {
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
                    <span>Día {pos.cycle_day || 1} de {pos.total_days || plan.days}</span>
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
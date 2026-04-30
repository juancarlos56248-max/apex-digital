import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, BarChart3, Building2, Check, Lock } from "lucide-react";

const tierConfig = {
  prueba: {
    name: "Apex Prueba",
    subtitle: "Plan de prueba — Solo ganancias",
    icon: Zap,
    minDeposit: 5,
    maxDeposit: 5,
    dailyReturn: "10%",
    totalReturn: "100%",
    duration: "10 días",
    exampleEarning: "$0.50 diario · $5 en 10 días",
    features: ["Los $5 son 100% ganancia tuya", "Sin riesgo de capital", "Liquidación cada 24 horas"],
    gradient: "from-slate-500/15 via-slate-500/5 to-transparent",
    border: "hover:border-slate-500/40",
    activeBorder: "border-slate-500/40",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-400",
    badge: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    bar: "from-slate-500 to-slate-400",
    checkColor: "text-slate-400",
    accent: "text-slate-300",
  },
  starter: {
    name: "Apex Starter",
    subtitle: "Apple Inc. (AAPL)",
    icon: Zap,
    minDeposit: 10,
    maxDeposit: 499,
    dailyReturn: "10%",
    totalReturn: "300%",
    duration: "30 días",
    exampleEarning: "Est. +$1,497 (sobre $10)*",
    features: ["Estrategia algorítmica de bajo perfil", "Análisis técnico en acciones Apple", "Liquidación cada 24 horas"],
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    border: "hover:border-emerald-500/40",
    activeBorder: "border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bar: "from-emerald-500 to-emerald-400",
    checkColor: "text-emerald-400",
    accent: "text-emerald-400",
  },
  advance: {
    name: "Apex Advance",
    subtitle: "Amazon.com (AMZN)",
    icon: TrendingUp,
    minDeposit: 500,
    maxDeposit: 1999,
    dailyReturn: "10%",
    totalReturn: "600%",
    duration: "60 días",
    exampleEarning: "Est. +$3,000 (sobre $500)*",
    features: ["Análisis de arbitraje activo", "Seguimiento de acciones Amazon", "Liquidación cada 24 horas"],
    gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
    border: "hover:border-blue-500/40",
    activeBorder: "border-blue-500/40",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bar: "from-blue-500 to-blue-400",
    checkColor: "text-blue-400",
    accent: "text-blue-400",
  },
  elite: {
    name: "Apex Elite",
    subtitle: "NVIDIA Corp. (NVDA)",
    icon: BarChart3,
    minDeposit: 2000,
    maxDeposit: 9999,
    dailyReturn: "10%",
    totalReturn: "900%",
    duration: "90 días",
    exampleEarning: "Est. +$18,000 (sobre $2,000)*",
    features: ["Motor de análisis de alta frecuencia", "Seguimiento de acciones NVIDIA", "Liquidación cada 24 horas"],
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
    border: "hover:border-purple-500/40",
    activeBorder: "border-purple-500/40",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    bar: "from-purple-500 to-purple-400",
    checkColor: "text-purple-400",
    accent: "text-purple-400",
  },
  institutional: {
    name: "Apex Institutional",
    subtitle: "S&P 500 Index",
    icon: Building2,
    minDeposit: 10000,
    maxDeposit: null,
    dailyReturn: "10%",
    totalReturn: "1,200%",
    duration: "120 días",
    exampleEarning: "Est. +$120,000 (sobre $10,000)*",
    features: ["Acceso a cartera diversificada", "Seguimiento del índice S&P 500", "Liquidación cada 24 horas"],
    gradient: "from-gold/15 via-gold/5 to-transparent",
    border: "hover:border-gold/40",
    activeBorder: "border-gold/40",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    badge: "bg-gold/10 text-gold border-gold/20",
    bar: "from-gold to-gold-light",
    checkColor: "text-gold",
    accent: "text-gold",
  },
};

export default function TierCard({ tier, onSubscribe, delay = 0, hasActive }) {
  const config = tierConfig[tier];
  if (!config) return null;
  const Icon = config.icon;

  const rangeLabel = config.maxDeposit
    ? `$${config.minDeposit.toLocaleString()} – $${config.maxDeposit.toLocaleString()} USDT`
    : `Desde $${config.minDeposit.toLocaleString()} USDT`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl border bg-card group transition-all duration-300 flex flex-col
        ${hasActive ? config.activeBorder : `border-border/60 ${config.border}`}`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center ring-1 ring-white/5`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${config.badge}`}>
            +{config.dailyReturn}/día
          </span>
        </div>

        {/* Name & range */}
        <h3 className="text-base font-bold mb-0.5 tracking-tight">{config.name}</h3>
        <p className="text-[11px] text-muted-foreground mb-0.5">{config.subtitle}</p>
        <p className="text-[11px] font-mono text-gold/80 mb-4">{rangeLabel}</p>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <div className="rounded-lg bg-secondary/60 border border-border/40 px-2 py-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Diario</p>
            <p className={`text-xs font-bold font-mono ${config.accent}`}>{config.dailyReturn}</p>
          </div>
          <div className="rounded-lg bg-secondary/60 border border-border/40 px-2 py-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Ciclo</p>
            <p className="text-xs font-bold font-mono text-foreground">{config.duration}</p>
          </div>
          <div className="rounded-lg bg-secondary/60 border border-border/40 px-2 py-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Total est.</p>
            <p className="text-xs font-bold font-mono text-success">{config.totalReturn}</p>
          </div>
        </div>

        {/* Estimated earning highlight */}
        <div className="rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 mb-4">
          <p className="text-[10px] text-muted-foreground mb-0.5">Rendimiento estimado</p>
          <p className="text-sm font-bold font-mono text-success">{config.exampleEarning}</p>
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Capacidad del Nodo</span>
            <span className="text-[9px] font-mono text-success">En línea</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className={`h-full rounded-full bg-gradient-to-r ${config.bar}`}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-5 flex-1">
          {config.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <Check className={`w-3.5 h-3.5 ${config.checkColor} flex-shrink-0 mt-0.5`} />
              <span>{f}</span>
            </div>
          ))}
          <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <Check className={`w-3.5 h-3.5 ${config.checkColor} flex-shrink-0 mt-0.5`} />
            <span>Duración del contrato: <span className="text-foreground font-medium">{config.duration}</span></span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed mb-3">
          * Rendimiento estimado. Los resultados pasados no garantizan resultados futuros. Toda inversión conlleva riesgo.
        </p>

        {/* CTA */}
        <Button
          onClick={() => onSubscribe(tier, config.minDeposit, config)}
          className={`w-full font-semibold h-10 transition-all duration-200 ${
            hasActive
              ? "bg-secondary text-muted-foreground cursor-not-allowed"
              : "bg-gold hover:bg-gold-dark text-black"
          }`}
          disabled={hasActive}
        >
          {hasActive ? (
            <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Nodo Activo</span>
          ) : (
            "Activar Contrato"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
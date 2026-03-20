import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, BarChart3, Building2, Check } from "lucide-react";

const tierConfig = {
  starter: {
    name: "Apex Starter",
    subtitle: "Apple Inc. (AAPL)",
    icon: Zap,
    minDeposit: 50,
    maxDeposit: 499,
    dailyReturn: "5%",
    features: ["Algoritmo HFT de bajo riesgo", "Respaldado por acciones Apple", "Liquidación cada 24 horas"],
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    barColor: "from-emerald-500 to-emerald-400",
  },
  advance: {
    name: "Apex Advance",
    subtitle: "Amazon.com (AMZN)",
    icon: TrendingUp,
    minDeposit: 500,
    maxDeposit: 1999,
    dailyReturn: "10%",
    features: ["Arbitraje cuántico activo", "Respaldado por acciones Amazon", "Liquidación cada 24 horas"],
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400",
    barColor: "from-blue-500 to-blue-400",
  },
  elite: {
    name: "Apex Elite",
    subtitle: "NVIDIA Corp. (NVDA)",
    icon: BarChart3,
    minDeposit: 2000,
    maxDeposit: 9999,
    dailyReturn: "18%",
    features: ["Motor de IA de alta frecuencia", "Respaldado por acciones NVIDIA", "Liquidación cada 24 horas"],
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-400",
    barColor: "from-purple-500 to-purple-400",
  },
  institutional: {
    name: "Apex Institutional",
    subtitle: "S&P 500 Index",
    icon: Building2,
    minDeposit: 10000,
    maxDeposit: null,
    dailyReturn: "25%",
    features: ["Acceso institucional exclusivo", "Respaldado por el índice S&P 500", "Liquidación cada 24 horas"],
    color: "from-gold/20 to-gold-dark/5",
    borderColor: "hover:border-gold/30",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    badgeColor: "bg-gold/10 text-gold",
    barColor: "from-gold to-gold-light",
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
      transition={{ duration: 0.6, delay }}
      className={`relative overflow-hidden rounded-xl border border-border bg-card p-6 group transition-all duration-300 ${config.borderColor}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${config.badgeColor}`}>
            +{config.dailyReturn} / día
          </span>
        </div>

        <h3 className="text-lg font-bold mb-0.5">{config.name}</h3>
        <p className="text-xs text-muted-foreground mb-1">{config.subtitle}</p>
        <p className="text-xs font-mono text-gold mb-4">{rangeLabel}</p>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacidad del Nodo</span>
            <span className="text-[10px] font-mono text-success">En línea</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${config.barColor}`}
              style={{ width: "75%" }}
            />
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {config.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className={`w-3.5 h-3.5 ${config.iconColor} flex-shrink-0`} />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onSubscribe(tier, config.minDeposit, config)}
          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
          disabled={hasActive}
        >
          {hasActive ? "Nodo Activo" : "Activar Contrato"}
        </Button>
      </div>
    </motion.div>
  );
}
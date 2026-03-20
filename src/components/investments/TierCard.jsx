import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, BarChart3, Building2, Check } from "lucide-react";

const tierConfig = {
  starter: {
    name: "Apex Starter",
    subtitle: "Tech Basket",
    icon: Zap,
    deposit: 50,
    dailyReturn: "0.8 - 1.2%",
    features: ["Algoritmo de bajo riesgo", "Diversificación tecnológica", "Retornos estables"],
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  pro: {
    name: "Apex Pro",
    subtitle: "Energy / Tesla",
    icon: TrendingUp,
    deposit: 500,
    dailyReturn: "1.5 - 2.5%",
    features: ["Volatilidad media", "Sector energético", "IA de análisis técnico"],
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  elite: {
    name: "Apex Elite",
    subtitle: "AI / NVIDIA",
    icon: BarChart3,
    deposit: 2000,
    dailyReturn: "2.5 - 4.0%",
    features: ["Crecimiento acelerado", "Sector IA", "Liquidez premium"],
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  institutional: {
    name: "Apex Institutional",
    subtitle: "S&P Index",
    icon: Building2,
    deposit: 10000,
    dailyReturn: "3.5 - 5.0%",
    features: ["Liquidez concentrada", "Índice S&P 500", "Acceso institucional"],
    color: "from-gold/20 to-gold-dark/5",
    borderColor: "hover:border-gold/30",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
  },
};

export default function TierCard({ tier, onSubscribe, delay = 0, hasActive }) {
  const config = tierConfig[tier];
  if (!config) return null;
  const Icon = config.icon;

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
          {tier === "institutional" && (
            <span className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-semibold uppercase tracking-wider">
              Premium
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold mb-0.5">{config.name}</h3>
        <p className="text-xs text-muted-foreground mb-4">{config.subtitle}</p>

        <div className="mb-5">
          <p className="text-3xl font-bold font-mono">
            ${config.deposit.toLocaleString()}
            <span className="text-sm text-muted-foreground ml-1">USDT</span>
          </p>
          <p className="text-xs text-success mt-1 font-mono">Rendimiento diario: {config.dailyReturn}</p>
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
          onClick={() => onSubscribe(tier, config.deposit)}
          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
          disabled={hasActive}
        >
          {hasActive ? "Nodo Activo" : "Activar Nodo"}
        </Button>
      </div>
    </motion.div>
  );
}
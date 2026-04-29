import { motion } from "framer-motion";
import { Zap, TrendingUp, BarChart3, Building2 } from "lucide-react";

const tierIcons = {
  starter: Zap,
  pro: TrendingUp,
  elite: BarChart3,
  institutional: Building2,
};

const tierNames = {
  starter: "Apex Starter",
  pro: "Apex Pro",
  elite: "Apex Elite",
  institutional: "Apex Institutional",
};

export default function ActiveInvestments({ investments }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="text-sm font-semibold mb-4">Nodos Activos</h3>
      
      {investments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No hay inversiones activas</p>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const Icon = tierIcons[inv.tier] || Zap;
            return (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tierNames[inv.tier]}</p>
                  <p className="text-xs text-muted-foreground font-mono">${inv.amount.toLocaleString()} USDT</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-success">+${(inv.total_earned || 0).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, suffix = "", trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 group hover:border-gold/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold" />
          </div>
          {trend && (
            <span className={`text-xs font-mono font-medium ${trend > 0 ? "text-success" : "text-destructive"}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
        </div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold tracking-tight">
          {value}
          {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </div>
    </motion.div>
  );
}
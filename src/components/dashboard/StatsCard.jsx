import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, suffix = "", trend, delay = 0, loading = false, period = "Actual" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/25 transition-colors duration-200"
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold" />
          </div>
          {trend && !loading && (
            <span className={`text-xs font-mono font-medium ${trend > 0 ? "text-success" : "text-destructive"}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
        </div>
        <div className="mb-1 flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground leading-tight">{label}</p><span className="text-[10px] text-muted-foreground">{period}</span></div>
        {loading ? (
          <div className="h-7 w-24 rounded-md bg-secondary/60 animate-pulse mt-1" />
        ) : (
          <p className="font-mono text-lg sm:text-2xl font-bold tracking-tight">
            {value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </p>
        )}
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, suffix = "", trend, delay = 0, loading = false, period = "Actual" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="relative min-h-48 overflow-visible rounded-2xl border border-gold/80 bg-card p-7 shadow-2xl shadow-black/30 transition-colors duration-200 hover:border-gold"
    >
      <div className="absolute inset-x-4 -bottom-3 -z-10 h-full rounded-2xl border border-gold/20 bg-gold/5" />
      <div className="absolute inset-x-8 -bottom-5 -z-20 h-full rounded-2xl border border-gold/10 bg-gold/5" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15">
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
          <p className="font-mono text-2xl font-bold tracking-tight sm:text-4xl">
            {value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </p>
        )}
      </div>
    </motion.div>
  );
}
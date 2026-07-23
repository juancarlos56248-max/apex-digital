import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Users, Clock, Star, ChevronDown, ChevronUp, Zap } from "lucide-react";

const TOTAL_CUPOS = 1000;
const CUPOS_DISPONIBLES = 2; // Solo quedan 2

export default function BonoCuposLimitados() {
  const [collapsed, setCollapsed] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Simula alguien tomando cupo cada cierto tiempo (efecto urgencia)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(c => c + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const pct = ((TOTAL_CUPOS - CUPOS_DISPONIBLES) / TOTAL_CUPOS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gold/40 overflow-hidden shadow-lg shadow-gold/5"
      style={{
        background: "linear-gradient(135deg, hsl(38 20% 7%) 0%, hsl(40 15% 9%) 60%, hsl(38 20% 7%) 100%)",
      }}
    >
      {/* Top urgency bar */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 border-b border-red-500/20 px-4 py-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">¡ÚLTIMOS CUPOS DISPONIBLES!</span>
        </div>
        <button onClick={() => setCollapsed(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 space-y-4">

              {/* Headline */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold">Oferta Exclusiva APEX</span>
                  <Star className="w-5 h-5 text-gold fill-gold" />
                </div>
                <p className="text-xl font-black text-foreground leading-tight">
                  Deposita <span className="text-gold font-black">$300</span> y recibe
                </p>
                <p className="text-4xl font-black text-gold tracking-tight">
                  $1,000 <span className="text-2xl font-bold text-gold/70">USDT</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Bono acreditado directamente a tu balance — sin condiciones ocultas
                </p>
              </div>

              {/* Cupos progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Cupos reclamados</span>
                  </div>
                  <motion.span
                    key={pulseCount}
                    initial={{ scale: 1.15, color: "#ef4444" }}
                    animate={{ scale: 1, color: "#f59e0b" }}
                    transition={{ duration: 0.6 }}
                    className="text-xs font-black font-mono text-gold"
                  >
                    {TOTAL_CUPOS - CUPOS_DISPONIBLES} / {TOTAL_CUPOS}
                  </motion.span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 rounded-full bg-secondary overflow-hidden border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #b45309, #d97706, #f59e0b, #fbbf24)",
                    }}
                  />
                  {/* Shimmer */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s ease-in-out infinite",
                    }}
                  />
                </div>

                {/* Solo X disponibles */}
                <motion.div
                  key={pulseCount}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-2"
                >
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-sm font-black text-red-400">
                    ¡Solo quedan <span className="text-white">{CUPOS_DISPONIBLES}</span> cupos de {TOTAL_CUPOS}!
                  </span>
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                </motion.div>
              </div>

              {/* How it works */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-2">
                <p className="text-[11px] font-bold text-gold uppercase tracking-wider">¿Cómo funciona?</p>
                {[
                  { n: "1", text: "Realiza un depósito de exactamente $300 USDT o más" },
                  { n: "2", text: "El equipo APEX verifica tu transacción en blockchain" },
                  { n: "3", text: "Recibes $1,000 USDT adicionales directamente en tu balance" },
                ].map(item => (
                  <div key={item.n} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gold text-black text-[10px] font-black flex items-center justify-center flex-shrink-0">
                      {item.n}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Urgency footer */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span>Oferta válida hasta agotar los <strong className="text-foreground">{CUPOS_DISPONIBLES} cupos restantes</strong> — sin prórroga</span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
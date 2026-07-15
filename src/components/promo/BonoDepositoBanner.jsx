import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Gift } from "lucide-react";

// Promo válida 12 horas desde esta fecha fija (ajusta si necesitas reiniciarla)
const PROMO_END = new Date("2026-07-16T01:20:00-05:00"); // 12h desde las 13:20 Lima

function getTimeLeft() {
  const diff = PROMO_END - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function BonoDepositoBanner({ onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = getTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (!timeLeft || dismissed) return null;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/60 shadow-lg shadow-amber-500/10"
      >
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/25 via-yellow-500/15 to-orange-600/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        {/* Shimmer */}
        <div className="absolute inset-0 gold-shimmer" />

        <div className="relative flex items-center gap-4 px-5 py-4">
          {/* Icono pulsante */}
          <div className="relative flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30 animate-ping" />
            <div className="relative w-11 h-11 rounded-xl bg-amber-500/25 flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-300" />
            </div>
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-extrabold text-amber-200 tracking-wide">
                🎁 ¡BONO DEL 50% EN TU DEPÓSITO!
              </p>
              <span className="text-[10px] font-bold bg-red-600/80 text-white px-2 py-0.5 rounded-full animate-pulse">
                TIEMPO LIMITADO
              </span>
            </div>
            <p className="text-xs text-amber-100/80 mt-0.5 leading-relaxed">
              Deposita <strong className="text-amber-200">más de $100 USDT</strong> y recibe un <strong className="text-amber-200">bono del 50%</strong> adicional sobre tu depósito — válido <strong>una sola vez</strong>.
            </p>
            {/* Countdown */}
            <div className="flex items-center gap-1.5 mt-2">
              <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] text-amber-300/80">Expira en:</span>
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <span className="bg-black/40 text-amber-200 px-1.5 py-0.5 rounded">{pad(timeLeft.h)}</span>
                <span className="text-amber-400">:</span>
                <span className="bg-black/40 text-amber-200 px-1.5 py-0.5 rounded">{pad(timeLeft.m)}</span>
                <span className="text-amber-400">:</span>
                <span className="bg-black/40 text-amber-200 px-1.5 py-0.5 rounded">{pad(timeLeft.s)}</span>
              </div>
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-amber-400/60 hover:text-amber-200 hover:bg-white/5 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
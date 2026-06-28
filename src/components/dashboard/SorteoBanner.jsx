import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";

const COUNTDOWN_DATE = new Date("2026-07-28T00:00:00-05:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = COUNTDOWN_DATE - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

function CountUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl text-white"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          {String(value).padStart(2, "0")}
        </div>
      </div>
      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">{label}</span>
    </div>
  );
}

import { useState, useEffect } from "react";

export default function SorteoBanner() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0505 0%, #1c0606 35%, #150404 65%, #0a0202 100%)" }}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* Franja izquierda roja */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #dc2626, #dc2626, transparent)" }} />
      {/* Franja derecha roja */}
      <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #dc2626, #dc2626, transparent)" }} />

      {/* Glow orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #dc2626, transparent 70%)" }} />
      <div className="absolute -bottom-12 left-1/3 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #fbbf24, transparent 70%)" }} />

      {/* Particles decorativas */}
      <motion.div
        animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-1/2 text-yellow-400/20 text-2xl pointer-events-none select-none"
      >✦</motion.div>
      <motion.div
        animate={{ y: [4, -4, 4], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-4 right-24 text-red-400/20 text-xl pointer-events-none select-none"
      >✦</motion.div>

      {/* Separador superior dorado */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.6) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)" }} />

      <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-6">

        {/* Badge superior */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">
              🇵🇪 Fiestas Patrias 2026
            </span>
          </motion.div>
          <span className="text-[10px] text-gray-500 font-mono">28 · JUL · 2026</span>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Trofeo animado */}
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex-shrink-0 hidden sm:block"
          >
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50"
              style={{ background: "linear-gradient(145deg, #991b1b, #dc2626, #ef4444)" }}>
              <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
              {/* Shine */}
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
            </div>
          </motion.div>

          {/* Texto central */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white leading-tight"
              style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)" }}>
              Gran Sorteo{" "}
              <span style={{
                background: "linear-gradient(90deg, #fcd34d, #fbbf24, #f59e0b, #fbbf24, #fcd34d)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                $1,000 USDT
              </span>
            </h3>

            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-xs">
              Realiza tu <span className="text-white font-semibold">2do depósito</span> de{" "}
              <span className="text-yellow-400 font-bold">$100 o más</span> y entra automáticamente.
              A mayor depósito, más probabilidades de ganar.
            </p>

            {/* Pills de requisitos */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                { dot: "bg-emerald-400", text: "Mínimo $100 USDT" },
                { dot: "bg-yellow-400", text: "2do depósito en adelante" },
                { dot: "bg-blue-400", text: "Sorteo en vivo" },
              ].map((r) => (
                <div key={r.text} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${r.dot} flex-shrink-0`} />
                  <span className="text-[10px] text-gray-300 font-medium">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha: countdown + CTA */}
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-end gap-3">

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <CountUnit value={days} label="días" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={hours} label="horas" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={minutes} label="min" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={seconds} label="seg" />
            </div>

            {/* CTA Button */}
            <Link to="/deposit" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="w-full sm:w-auto font-black text-sm h-11 px-6 gap-2 rounded-xl shadow-xl shadow-red-900/40"
                  style={{
                    background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)",
                    color: "white",
                    border: "1px solid rgba(239,68,68,0.4)",
                  }}
                >
                  Depositar y participar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Separador inferior dorado */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.5) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)" }} />
    </motion.div>
  );
}
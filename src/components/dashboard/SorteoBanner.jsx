import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Star, ChevronLeft, ChevronRight } from "lucide-react";

// Gran sorteo 28 de julio
const GRAN_SORTEO_DATE = new Date("2026-07-28T20:00:00-05:00");
// Próximo domingo
function getNextSunday() {
  const now = new Date();
  const day = now.getDay(); // 0=domingo
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(20, 0, 0, 0);
  return next;
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
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
  }, [targetDate]);
  return timeLeft;
}

function CountUnit({ value, label, color = "rgba(255,255,255,0.08)" }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl text-white"
        style={{ background: color, border: "1px solid rgba(255,255,255,0.12)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">{label}</span>
    </div>
  );
}

// ── Sorteo Semanal $1,000 ──────────────────────────────────────────────────
function SorteoSemanal() {
  const nextSunday = getNextSunday();
  const { days, hours, minutes, seconds } = useCountdown(nextSunday);
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const dateLabel = `${dayNames[nextSunday.getDay()]} ${nextSunday.getDate()} ${monthNames[nextSunday.getMonth()]}`;

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050a0f 0%, #0a1520 35%, #071018 65%, #020508 100%)" }}>
      {/* Franjas laterales azul */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #3b82f6, #3b82f6, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #3b82f6, #3b82f6, transparent)" }} />
      {/* Glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
      {/* Separador superior */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 50%, transparent 100%)" }} />

      <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-6">
        {/* Badge */}
        <div className="flex items-center justify-between mb-4">
          <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">
              🎯 Sorteo Semanal — Todos los Domingos
            </span>
          </motion.div>
          <span className="text-[10px] text-gray-500 font-mono">{dateLabel}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Icono */}
          <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex-shrink-0 hidden sm:block">
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/50"
              style={{ background: "linear-gradient(145deg, #1d4ed8, #3b82f6, #60a5fa)" }}>
              <Star className="w-10 h-10 text-white drop-shadow-lg" />
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
            </div>
          </motion.div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white leading-tight" style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)" }}>
              Sorteo Dominical{" "}
              <span style={{
                background: "linear-gradient(90deg, #93c5fd, #60a5fa, #3b82f6, #60a5fa, #93c5fd)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                $1,000 USDT
              </span>
            </h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-xs">
              Cada depósito aprobado es un <span className="text-white font-semibold">boleto de participación</span>.
              A <span className="text-blue-400 font-bold">más depósitos, más chances</span> de ganar cada domingo.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                { dot: "bg-emerald-400", text: "Sin mínimo" },
                { dot: "bg-blue-400", text: "Cada depósito = 1 boleto" },
                { dot: "bg-yellow-400", text: "Sorteo en vivo cada domingo" },
              ].map((r) => (
                <div key={r.text} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${r.dot} flex-shrink-0`} />
                  <span className="text-[10px] text-gray-300 font-medium">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-end gap-3">
            <div className="flex items-center gap-1.5">
              <CountUnit value={days} label="días" color="rgba(59,130,246,0.15)" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={hours} label="horas" color="rgba(59,130,246,0.15)" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={minutes} label="min" color="rgba(59,130,246,0.15)" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={seconds} label="seg" color="rgba(59,130,246,0.15)" />
            </div>
            <Link to="/deposit" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="w-full sm:w-auto font-black text-sm h-11 px-6 gap-2 rounded-xl shadow-xl shadow-blue-900/40"
                  style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)", color: "white", border: "1px solid rgba(96,165,250,0.4)" }}>
                  Depositar y participar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 50%, transparent 100%)" }} />
    </div>
  );
}

// ── Gran Sorteo $5,000 — 28 Jul ────────────────────────────────────────────
function GranSorteo() {
  const { days, hours, minutes, seconds } = useCountdown(GRAN_SORTEO_DATE);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/80 bg-card shadow-2xl shadow-black/30">
      {/* Franjas rojas */}
      <div className="absolute inset-y-0 left-0 w-px bg-gold" />
      <div className="absolute inset-y-0 right-0 w-px bg-gold" />
      {/* Glows */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #dc2626, transparent 70%)" }} />
      <div className="absolute -bottom-12 left-1/3 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #fbbf24, transparent 70%)" }} />
      {/* Partículas */}
      <motion.div animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-4 left-1/2 text-yellow-400/20 text-2xl pointer-events-none select-none">✦</motion.div>
      <motion.div animate={{ y: [4, -4, 4], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute bottom-4 right-24 text-red-400/20 text-xl pointer-events-none select-none">✦</motion.div>

      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.6) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)" }} />

      <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8">
        {/* Badge ESPECIAL */}
        <div className="flex items-center justify-between mb-4">
          <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">
              🇵🇪 Gran Premio — Fiestas Patrias 2026
            </span>
          </motion.div>
          <span className="text-[10px] text-gray-500 font-mono">28 · JUL · 2026</span>
        </div>

        {/* Badge ESPECIAL flotante */}
        <div className="absolute top-4 right-14 sm:right-6">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-yellow-900"
            style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)" }}>
            ESPECIAL
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex-shrink-0 hidden sm:block">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600 shadow-2xl shadow-red-600/30">
              <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white leading-tight" style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)" }}>
              Gran Sorteo{" "}
              <span style={{
                background: "linear-gradient(90deg, #fcd34d, #fbbf24, #f59e0b, #fbbf24, #fcd34d)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                $5,000 USDT
              </span>
            </h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-xs">
              El <span className="text-white font-semibold">28 de julio</span> sortearemos{" "}
              <span className="text-yellow-400 font-bold">$5,000 USDT</span> en efectivo.
              Cada depósito aprobado es un boleto — <span className="text-white font-semibold">a más depósitos, más chances</span>.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                { dot: "bg-emerald-400", text: "Cualquier depósito cuenta" },
                { dot: "bg-yellow-400", text: "Más depósitos = más boletos" },
                { dot: "bg-red-400", text: "Sorteo en vivo 28 Jul" },
              ].map((r) => (
                <div key={r.text} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${r.dot} flex-shrink-0`} />
                  <span className="text-[10px] text-gray-300 font-medium">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-end gap-3">
            <div className="flex items-center gap-1.5">
              <CountUnit value={days} label="días" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={hours} label="horas" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={minutes} label="min" />
              <span className="text-gray-600 font-black text-lg mb-4">:</span>
              <CountUnit value={seconds} label="seg" />
            </div>
            <Link to="/deposit" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-11 w-full gap-2 rounded-xl border border-gold bg-gold px-6 text-sm font-black text-background shadow-xl shadow-gold/20 hover:bg-gold-light sm:w-auto">
                  Participar ahora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.5) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)" }} />
    </div>
  );
}

// ── Carousel con ambos sorteos ─────────────────────────────────────────────
export default function SorteoBanner() {
  const [current, setCurrent] = useState(0);
  const banners = [<GranSorteo key="gran" />, <SorteoSemanal key="semanal" />];

  // Auto-rotate cada 8 segundos
  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % 2), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          {banners[current]}
        </motion.div>
      </AnimatePresence>

      {/* Dots de navegación */}
      <div className="hidden items-center justify-center gap-2 mt-2.5">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-gold w-4" : "bg-border"}`}
          />
        ))}
      </div>

      {/* Flechas */}
      <button onClick={() => setCurrent(c => (c - 1 + 2) % 2)}
        className="hidden">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % 2)}
        className="hidden">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
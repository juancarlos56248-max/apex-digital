import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Star, X } from "lucide-react";

// Valores visibles en la ruleta; el premio acreditado es siempre USD 1
const PRIZES = [
  { label: "$1",     amount: 1,    color: "#c9a84c", bg: "#1a1400" },
  { label: "$5",     amount: 5,    color: "#34d399", bg: "#001a0d" },
  { label: "$10",    amount: 10,   color: "#a78bfa", bg: "#12003a" },
  { label: "$50",    amount: 50,   color: "#60a5fa", bg: "#001433" },
  { label: "$100",   amount: 100,  color: "#fb923c", bg: "#1a0800" },
  { label: "$500",   amount: 500,  color: "#f472b6", bg: "#1a001a" },
  { label: "$1,000", amount: 1000, color: "#f87171", bg: "#1a0000" },
];

const SEGMENTS = PRIZES.length;
const SEGMENT_ANGLE = 360 / SEGMENTS;
const SPINS = 8;
const WIN_SEGMENT = 0; // Todos los usuarios ganan USD 1

function getFinalAngle(winSegment, currentRotation) {
  const base = (currentRotation % 360 + 360) % 360;
  const targetOffset = (360 - (winSegment * SEGMENT_ANGLE + SEGMENT_ANGLE / 2)) % 360;
  const diff = (targetOffset - base + 360) % 360;
  return currentRotation + SPINS * 360 + diff;
}

function WheelCanvas({ rotation }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  const segments = PRIZES.map((prize, i) => {
    const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
    const midAngle = ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const textR = r * 0.68;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textAngle = (i + 0.5) * SEGMENT_ANGLE;

    return (
      <g key={i}>
        <path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={prize.bg}
          stroke="#2a2a2a"
          strokeWidth="1.5"
        />
        <text
          x={tx}
          y={ty}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={prize.color}
          fontSize={prize.amount >= 1000 ? "11" : "13"}
          fontWeight="900"
          fontFamily="monospace"
          transform={`rotate(${textAngle}, ${tx}, ${ty})`}
        >
          {prize.label}
        </text>
      </g>
    );
  });

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: `rotate(${rotation}deg)`, transition: "none" }}
    >
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#c9a84c" strokeWidth="3" opacity="0.4" />
      {segments}
      <circle cx={cx} cy={cy} r={14} fill="#0a0a0a" stroke="#c9a84c" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={6} fill="#c9a84c" />
    </svg>
  );
}

export default function RuletaSuerte({ user, onWin }) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [spinsAvailable, setSpinsAvailable] = useState(0);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const animRef = useRef(null);
  const startAngleRef = useRef(0);
  const startTimeRef = useRef(null);
  const DURATION = 4500;

  const loadEligibility = () => {
    if (!user?.email) return;
    base44.entities.Transaction
      .filter({ user_email: user.email, type: "dividend", status: "completed" })
      .then((dividends) => {
        const alreadyUsed = dividends.some(d => d.notes?.includes("Ruleta USD 1"));
        setSpinsAvailable(alreadyUsed ? 0 : 1);
        setLoadingEligibility(false);
      });
  };

  useEffect(() => { loadEligibility(); }, [user?.email]);

  const easeOut = (t) => 1 - Math.pow(1 - t, 4);

  const spin = () => {
    if (spinning || spinsAvailable <= 0) return;
    setResult(null);
    setSpinning(true);
    startAngleRef.current = rotation % 360;
    startTimeRef.current = null;

    const winSegment = WIN_SEGMENT;
    const targetAngle = getFinalAngle(winSegment, rotation);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOut(progress);
      const current = startAngleRef.current + (targetAngle - startAngleRef.current) * eased;
      setRotation(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(targetAngle);
        setSpinning(false);
        const prize = PRIZES[winSegment];
        setResult(prize);
        creditPrize(prize.amount);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const creditPrize = async (amount) => {
    try {
      await Promise.all([
        base44.entities.Transaction.create({
          user_email: user.email,
          type: "dividend",
          amount,
          status: "completed",
          notes: `🎰 Premio Ruleta USD 1 — $${amount} USDT`,
        }),
        base44.entities.User.filter({ email: user.email }).then(async ([u]) => {
          if (u) {
            await base44.entities.User.update(u.id, {
              balance: parseFloat(((u.balance || 0) + amount).toFixed(2)),
              total_earned: parseFloat(((u.total_earned || 0) + amount).toFixed(2)),
            });
          }
        }),
      ]);
      setSpinsAvailable(prev => Math.max(0, prev - 1));
      if (onWin) onWin(amount);
    } catch {}
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  if (loadingEligibility || spinsAvailable <= 0) return null;

  return (
    <>
      {/* Banner de acceso */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-transparent p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center flex-shrink-0 text-2xl">
          🎰
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-yellow-400">¡Ruleta de Depósito disponible!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tienes <span className="text-yellow-400 font-bold">1 giro</span> disponible. Premio garantizado de $1 USD.</p>
        </div>
        <Button size="sm" className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
          Girar
        </Button>
      </motion.div>

      {/* Modal ruleta */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => { if (!spinning) setOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed inset-x-4 top-4 z-50 bg-[#080808] border border-yellow-500/20 rounded-3xl p-6 max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-base font-bold text-yellow-400">Ruleta de Premios</h2>
                </div>
                {!spinning && (
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Wheel */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "22px solid #c9a84c" }} />
                </div>
                <WheelCanvas rotation={rotation} />
              </div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-4 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10"
                  >
                    <p className="text-3xl font-black font-mono text-yellow-400">+${result.amount}</p>
                    <p className="text-sm text-muted-foreground mt-1">¡Acreditado a tu balance! 🎉</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {result ? (
                <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold" onClick={() => { setOpen(false); setResult(null); }}>
                  {spinsAvailable > 0 ? `🎰 Girar de nuevo (${spinsAvailable} giro${spinsAvailable > 1 ? "s" : ""})` : "Ver mi balance"}
                </Button>
              ) : (
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 text-base"
                  disabled={spinning || spinsAvailable <= 0}
                  onClick={spin}
                >
                  {spinning ? "Girando..." : `🎰 ¡Girar Ruleta! (${spinsAvailable} giro${spinsAvailable > 1 ? "s" : ""})`}
                </Button>
              )}

              <p className="text-center text-[10px] text-muted-foreground mt-3">
                Un único giro por usuario · Premio garantizado de $1 USD
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
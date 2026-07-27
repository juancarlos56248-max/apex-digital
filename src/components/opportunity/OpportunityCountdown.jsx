import { useEffect, useRef, useState } from "react";

export default function OpportunityCountdown({ target, onComplete }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const completed = useRef(false);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
      if (diff === 0 && !completed.current) { completed.current = true; onComplete?.(); }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target, onComplete]);

  const Unit = ({ val, label }) => <div className="flex flex-col items-center"><div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-black/40"><span className="font-mono text-2xl font-black text-gold">{String(val).padStart(2, "0")}</span></div><span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div>;
  return <div className="flex justify-center gap-2"><Unit val={time.d} label="días" /><span className="mt-3 text-2xl font-black text-gold">:</span><Unit val={time.h} label="horas" /><span className="mt-3 text-2xl font-black text-gold">:</span><Unit val={time.m} label="min" /><span className="mt-3 text-2xl font-black text-gold">:</span><Unit val={time.s} label="seg" /></div>;
}
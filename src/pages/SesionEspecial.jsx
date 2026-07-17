import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Zap, Clock, Shield, Copy, AlertTriangle, Lock, Star } from "lucide-react";

const WALLET_ADDRESS = "0xbf4b66292c791d063ccdb8ce6506f5725bbf33a4";

const SESSION_END = new Date("2026-07-20T23:59:59-05:00"); // 3 días desde hoy en hora Perú

function Countdown({ target }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  const Unit = ({ val, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl bg-black/40 border border-gold/30 flex items-center justify-center">
        <span className="text-2xl font-black font-mono text-gold">{String(val).padStart(2, "0")}</span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 justify-center">
      <Unit val={time.d} label="días" />
      <div className="text-gold text-2xl font-black mt-3">:</div>
      <Unit val={time.h} label="horas" />
      <div className="text-gold text-2xl font-black mt-3">:</div>
      <Unit val={time.m} label="min" />
      <div className="text-gold text-2xl font-black mt-3">:</div>
      <Unit val={time.s} label="seg" />
    </div>
  );
}

const TIERS = [
  { range: "$50 – $299",   profit: "10% – 20%", color: "from-blue-600/20 to-blue-500/10", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-300" },
  { range: "$300 – $999",  profit: "20% – 35%", color: "from-purple-600/20 to-purple-500/10", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-300" },
  { range: "$1,000+",      profit: "35% – 50%", color: "from-gold/20 to-gold-dark/10", border: "border-gold/40", badge: "bg-gold/20 text-gold", highlight: true },
];

export default function SesionEspecial() {
  const { user, setUser } = useOutletContext();
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    toast.success("Dirección copiada");
  };

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!amount || !txid) { toast.error("Completa todos los campos"); return; }
    if (amt < 50) { toast.error("Monto mínimo para esta sesión: $50 USDT"); return; }

    setSubmitting(true);
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: "deposit",
      amount: amt,
      status: "pending",
      txid: txid.trim(),
      network: "BEP20",
      notes: "SESIÓN ESPECIAL — Compra masiva detectada",
    });
    toast.success("✅ Participación registrada. Desembolso en 3 días.");
    setAmount("");
    setTxid("");
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-gold/10 via-amber-500/5 to-transparent border border-gold/30 p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 gold-shimmer pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Sesión Activa — Cupos limitados</span>
          </div>
          <h1 className="text-2xl font-black text-gold-light leading-tight">
            🚨 Compra Masiva Detectada
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Nuestros analistas identificaron una <strong className="text-foreground">orden institucional de compra</strong> en el mercado. Estamos abriendo esta sesión exclusiva para que participes de las ganancias.
          </p>
        </div>
      </motion.div>

      {/* Countdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-gold" />
          <span>La sesión cierra en:</span>
        </div>
        <Countdown target={SESSION_END.getTime()} />
        <p className="text-[11px] text-muted-foreground">
          Cierre: <strong className="text-foreground">20 de julio, 2026</strong> · Desembolso en <strong className="text-gold">3 días hábiles</strong>
        </p>
      </motion.div>

      {/* Tiers de ganancia */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-gold" /> Ganancias garantizadas por monto
        </p>
        <div className="grid gap-2">
          {TIERS.map((t) => (
            <div key={t.range}
              className={`rounded-xl bg-gradient-to-r ${t.color} border ${t.border} p-4 flex items-center justify-between ${t.highlight ? "ring-1 ring-gold/20" : ""}`}>
              <div className="flex items-center gap-2">
                {t.highlight && <Star className="w-4 h-4 text-gold fill-gold" />}
                <div>
                  <p className="text-sm font-bold">{t.range}</p>
                  <p className="text-[11px] text-muted-foreground">inversión en USDT</p>
                </div>
              </div>
              <span className={`text-sm font-black px-3 py-1 rounded-full ${t.badge}`}>
                +{t.profit}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Garantías */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Zap, label: "Retorno", val: "10% – 50%" },
          { icon: Clock, label: "Plazo", val: "3 días" },
          { icon: Lock, label: "Mínimo", val: "$50 USDT" },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
            <Icon className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-gold">{val}</p>
          </div>
        ))}
      </motion.div>

      {/* Formulario de depósito */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <h2 className="text-base font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" /> Participar en la Sesión
        </h2>

        {/* Wallet */}
        <div>
          <Label className="text-xs text-muted-foreground">Envía USDT (BEP20) a esta dirección:</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5">
              <p className="text-xs font-mono text-gold break-all">{WALLET_ADDRESS}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy} className="flex-shrink-0 border-border hover:border-gold/30 h-10 w-10">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-yellow-500 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Usa únicamente red BNB Smart Chain (BEP20)
          </p>
        </div>

        {/* Monto */}
        <div>
          <Label className="text-xs text-muted-foreground">Monto enviado (USDT) — mínimo $50</Label>
          <Input type="number" placeholder="Ej: 200" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 bg-secondary border-border font-mono" />
        </div>

        {/* TXID */}
        <div>
          <Label className="text-xs text-muted-foreground">Hash / TXID de la transacción</Label>
          <Input placeholder="Pega aquí el hash de tu transacción" value={txid}
            onChange={(e) => setTxid(e.target.value)}
            className="mt-1.5 bg-secondary border-border font-mono text-xs" />
          <p className="text-[11px] text-muted-foreground mt-1">Lo encuentras en bscscan.com o el historial de tu wallet</p>
        </div>

        {/* Preview de ganancia */}
        {Number(amount) >= 50 && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs space-y-1">
            <p className="text-emerald-400 font-semibold">Proyección estimada en 3 días:</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Inversión</span>
              <span className="font-mono text-foreground">${Number(amount).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ganancia mínima (10%)</span>
              <span className="font-mono text-emerald-400">+${(Number(amount) * 0.10).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-muted-foreground border-t border-emerald-500/20 pt-1">
              <span className="font-semibold">Total mínimo a recibir</span>
              <span className="font-mono font-bold text-emerald-400">${(Number(amount) * 1.10).toFixed(2)} USDT</span>
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={submitting || !amount || !txid}
          className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11 text-base">
          {submitting ? "Registrando participación..." : "🚀 Confirmar Participación"}
        </Button>

        <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
          <span>El capital más las ganancias serán desembolsados directamente a tu balance en 3 días hábiles tras confirmar la sesión.</span>
        </div>
      </motion.div>
    </div>
  );
}
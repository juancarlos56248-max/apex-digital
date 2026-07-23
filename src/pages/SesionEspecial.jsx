import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Zap, Clock, Shield, Lock, Star } from "lucide-react";

const SESSION_END = new Date("2026-07-24T23:59:59-05:00"); // Nueva sesión — 24 horas desde hoy

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [existingParticipation, setExistingParticipation] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Verificar si ya participó en esta sesión
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Transaction.filter({ user_email: user.email })
      .then(txs => {
        const sesion = txs.find(t => t.notes?.includes("SESIÓN ESPECIAL") || t.notes?.includes("OPORTUNIDAD ACTIVA"));
        if (sesion) setExistingParticipation(sesion);
      })
      .finally(() => setLoadingCheck(false));
  }, [user?.email]);

  useEffect(() => {
    if (existingParticipation) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [existingParticipation]);

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!amount) { setFormError("Ingresa el monto que deseas activar"); return; }
    if (amt < 50) { setFormError("El monto mínimo para participar es $50 USDT"); return; }
    setFormError("");
    setSubmitting(true);

    try {
      const response = await base44.functions.invoke("activarOportunidad", { amount: amt });
      const { transaction, newBalance } = response.data;
      setUser(prev => ({ ...prev, balance: newBalance }));
      setExistingParticipation(transaction);
      toast.success("✅ Oportunidad activada y saldo descontado. Desembolso en 3 días.");
    } catch (error) {
      setFormError(error?.response?.data?.error || error.message || "No se pudo activar la oportunidad");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loadingCheck) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-gold/10 via-amber-500/5 to-transparent border border-gold/30 p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 gold-shimmer pointer-events-none" />
        <div className="relative z-10 space-y-2">
          {/* Banner desembolso */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">✅ Desembolso Procesado — 23 de julio 2026</span>
          </div>
          <h1 className="text-2xl font-black text-gold-light leading-tight">
            💰 Ganancias Acreditadas Hoy
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            El desembolso de la sesión anterior ya fue procesado. Revisa tu balance actualizado. Ahora abrimos una <strong className="text-foreground">nueva oportunidad por solo 24 horas</strong>.
          </p>

          {/* Nueva sesión badge */}
          <div className="mt-3 inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">🚨 Nueva Sesión Abierta — Solo 24 Horas</span>
          </div>
        </div>
      </motion.div>

      {/* Countdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-gold" />
          <span>La oportunidad cierra en:</span>
        </div>
        <Countdown target={SESSION_END.getTime()} />
        <p className="text-[11px] text-muted-foreground">
          Cierre: <strong className="text-foreground">24 de julio, 2026 — 11:59 PM</strong> · Desembolso en <strong className="text-gold">24 horas</strong>
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
          { icon: Clock, label: "Plazo", val: "24 horas" },
          { icon: Lock, label: "Mínimo", val: "$50 USDT" },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
            <Icon className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-gold">{val}</p>
          </div>
        ))}
      </motion.div>

      {/* Formulario de depósito o estado de participación */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className={`rounded-xl border border-border bg-card p-5 space-y-4 ${existingParticipation ? "order-first" : ""}`}
      >
        {existingParticipation ? (
          /* Ya participó — mostrar resumen de su participación */
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-400">¡Ya estás participando!</h2>
              <p className="text-sm text-muted-foreground mt-1">Tu inversión en Oportunidad Activa está registrada y activa.</p>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto registrado</span>
                <span className="font-mono font-bold text-emerald-400">${existingParticipation.amount?.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ganancia mínima (10%)</span>
                <span className="font-mono font-bold text-emerald-300">+${(existingParticipation.amount * 0.10).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-sm border-t border-emerald-500/20 pt-2">
                <span className="font-semibold">Total a recibir</span>
                <span className="font-mono font-bold text-emerald-400">${(existingParticipation.amount * 1.10).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Estado</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Activa</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <span>El capital más las ganancias serán desembolsados a tu balance en las próximas 24 horas.</span>
            </div>
          </div>
        ) : (
          /* Formulario de participación */
          <>
            <h2 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" /> Participar en Oportunidad Activa
            </h2>

            <div className="rounded-lg border border-gold/20 bg-gold/5 p-3">
              <p className="text-xs text-muted-foreground">Balance disponible</p>
              <p className="mt-1 font-mono text-lg font-bold text-gold">${Number(user.balance || 0).toFixed(2)} USDT</p>
            </div>

            {/* Monto */}
            <div>
              <Label className="text-xs text-muted-foreground">Monto a activar desde tu balance — mínimo $50</Label>
              <Input type="number" placeholder="Ej: 200" value={amount}
                onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                className="mt-1.5 bg-secondary border-border font-mono" />
              {formError && <p className="mt-2 text-xs font-semibold text-destructive">{formError}</p>}
            </div>

            {/* Preview de ganancia */}
            {Number(amount) >= 50 && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs space-y-1">
                <p className="text-emerald-400 font-semibold">Proyección estimada en 24 horas:</p>
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

            <Button onClick={handleSubmit} disabled={submitting || !amount}
              className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11 text-base">
              {submitting ? "Activando oportunidad..." : "🚀 Activar con mi balance"}
            </Button>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <span>El capital más las ganancias serán desembolsados directamente a tu balance en las próximas <strong className="text-gold">24 horas</strong> tras confirmar la oportunidad.</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
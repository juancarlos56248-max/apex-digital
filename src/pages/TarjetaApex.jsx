import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CreditCard, Lock, Shield, CheckCircle, Star, Wifi, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BENEFITS = [
  "Compras en línea con saldo USDT directamente",
  "Aceptada en miles de comercios internacionales",
  "Sin comisiones en compras hasta $500/mes",
  "Límite de gasto ajustable desde tu dashboard",
  "Notificaciones en tiempo real de cada transacción",
  "Respaldada por tu inversión activa en APEX",
];

function ApexCard({ user, cardNumber }) {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" style={{ aspectRatio: "1.586" }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1200 0%, #3d2b00 40%, #c8960a 100%)" }}>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)" }} />
        {/* Circles deco */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-gold/20" />
        <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full border border-gold/10" />

        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-black font-black text-sm">A</span>
              </div>
              <span className="text-white font-bold text-sm tracking-wide">APEX</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-4 h-4 text-gold/70 rotate-90" />
              <span className="text-[10px] text-gold/60 uppercase tracking-wider">DIGITAL</span>
            </div>
          </div>

          {/* Chip + number */}
          <div className="space-y-3">
            <div className="w-10 h-7 rounded bg-gradient-to-br from-gold-light to-gold-dark opacity-80" />
            <p className="font-mono text-white text-base tracking-[0.2em]">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
          </div>

          {/* Bottom */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Titular</p>
              <p className="text-white font-semibold text-sm uppercase tracking-wide truncate max-w-[160px]">
                {user?.full_name || "APEX USER"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Válida</p>
              <p className="text-white font-mono text-sm">12/29</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TarjetaApex() {
  const { user } = useOutletContext();
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [form, setForm] = useState({ address: "", city: "", phone: user?.phone || "" });
  const [submitting, setSubmitting] = useState(false);

  const MIN_INVESTMENT = 1000;

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Investment.filter({ user_email: user.email, status: "active" })
      .then(invs => {
        const total = invs.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        setTotalInvested(total);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const hasAccess = totalInvested >= MIN_INVESTMENT || user?.role === "admin";

  // Generar número de tarjeta visual basado en el email (no real, solo visual)
  const cardNumber = user?.email
    ? `4${Math.abs(user.email.charCodeAt(0) % 9 + 1)}${Math.abs(user.email.charCodeAt(1) % 9)}1 ${Math.abs(user.email.charCodeAt(2) % 9)}${Math.abs(user.email.charCodeAt(3) % 9)}${Math.abs(user.email.charCodeAt(4) % 9 + 1)}2 8${Math.abs(user.email.charCodeAt(5) % 9)}${Math.abs(user.email.charCodeAt(6) % 9 + 1)}1 ${Math.abs(user.email.charCodeAt(7) % 9 + 3)}${Math.abs(user.email.charCodeAt(8) % 9)}0${Math.abs(user.email.charCodeAt(9) % 9 + 1)}`
    : null;

  const handleRequest = async () => {
    if (!form.address || !form.city || !form.phone) {
      toast.error("Completa todos los campos");
      return;
    }
    setSubmitting(true);
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: "deposit",
      amount: 0,
      status: "pending",
      notes: `SOLICITUD TARJETA APEX — Dirección: ${form.address}, ${form.city} — Tel: ${form.phone}`,
    });
    toast.success("✅ Solicitud enviada. Recibirás tu tarjeta en 5–10 días hábiles.");
    setRequested(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-bold">Tarjeta APEX</h1>
          <span className="text-[10px] bg-gold/20 text-gold border border-gold/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Exclusiva</span>
        </div>
        <p className="text-sm text-muted-foreground">Solicita tu tarjeta y úsala en miles de comercios</p>
      </motion.div>

      {/* Card visual */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <ApexCard user={user} cardNumber={hasAccess ? cardNumber : null} />
      </motion.div>

      {!hasAccess ? (
        /* Locked state */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold">Acceso Exclusivo — $1,000+ invertidos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              La Tarjeta APEX está disponible para inversores con <strong className="text-foreground">$1,000 USDT o más</strong> en inversiones activas.
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-xl bg-secondary/50 border border-border p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tu inversión activa</span>
              <span className="font-mono font-bold">${totalInvested.toLocaleString()} / $1,000</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalInvested / MIN_INVESTMENT) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground text-right">
              Te faltan <strong className="text-foreground">${Math.max(0, MIN_INVESTMENT - totalInvested).toLocaleString()}</strong> para desbloquear
            </p>
          </div>

          <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black font-bold">
            <a href="/investments">Ver Planes de Inversión <ChevronRight className="w-4 h-4 ml-1" /></a>
          </Button>
        </motion.div>
      ) : requested ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-emerald-400">¡Solicitud enviada exitosamente!</h2>
          <p className="text-sm text-muted-foreground">Tu Tarjeta APEX será enviada en <strong className="text-foreground">5–10 días hábiles</strong> a la dirección indicada. Te notificaremos por email cuando sea despachada.</p>
        </motion.div>
      ) : (
        <>
          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-2"
          >
            <p className="text-sm font-bold flex items-center gap-2 text-gold">
              <Crown className="w-4 h-4" /> Beneficios exclusivos
            </p>
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </motion.div>

          {/* Request form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5 space-y-4"
          >
            <h2 className="text-base font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" /> Solicitar mi Tarjeta APEX
            </h2>
            <p className="text-xs text-muted-foreground">Tienes acceso desbloqueado. Ingresa tus datos de envío:</p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Dirección de envío</Label>
                <Input placeholder="Ej: Av. Javier Prado 1234, Piso 3" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ciudad / Distrito</Label>
                <Input placeholder="Ej: Lima, Miraflores" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Teléfono de contacto</Label>
                <Input placeholder="Ej: +51 912 345 678" value={form.phone} type="tel"
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="mt-1.5 bg-secondary border-border font-mono" />
              </div>
            </div>

            <Button onClick={handleRequest} disabled={submitting}
              className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11">
              {submitting ? "Enviando solicitud..." : "📨 Solicitar Tarjeta APEX"}
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span>Tu información es privada y solo se usa para el envío físico de tu tarjeta.</span>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
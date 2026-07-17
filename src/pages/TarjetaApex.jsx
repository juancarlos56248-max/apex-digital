import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Lock, Shield, CheckCircle, Wifi, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff, Zap,
  ShoppingBag, Globe, Smartphone, Star, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MIN_INVESTMENT = 1000;

const QUICK_ACTIONS = [
  { icon: Plus, label: "Cargar", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { icon: ArrowUpRight, label: "Pagar", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: ArrowDownLeft, label: "Recibir", color: "text-gold", bg: "bg-gold/10 border-gold/20" },
  { icon: Globe, label: "Internacional", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
];

const BENEFITS = [
  { icon: ShoppingBag, label: "5% Cashback", desc: "En todas tus compras, acreditado en USDT" },
  { icon: Globe, label: "Aceptada mundial", desc: "Miles de comercios internacionales" },
  { icon: Zap, label: "Sin comisiones", desc: "Compras hasta $500/mes sin costo" },
  { icon: Smartphone, label: "Pagos digitales", desc: "Compatible con Apple Pay & Google Pay" },
  { icon: Shield, label: "Respaldada", desc: "Por tu inversión activa en APEX" },
];

const MOCK_MOVEMENTS = [
  { desc: "Netflix", amount: -15.99, type: "compra", date: "Hoy, 09:41", icon: ShoppingBag, cashback: 0.80 },
  { desc: "Amazon", amount: -89.00, type: "compra", date: "Ayer, 14:22", icon: ShoppingBag, cashback: 4.45 },
  { desc: "Cashback acreditado", amount: +5.25, type: "cashback", date: "Ayer, 14:22", icon: Star },
  { desc: "Spotify Premium", amount: -9.99, type: "compra", date: "15 jul, 11:05", icon: ShoppingBag, cashback: 0.50 },
];

function ApexCard({ user, cardNumber, balance, hideBalance, onToggleBalance }) {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" style={{ aspectRatio: "1.586" }}>
      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ background: "linear-gradient(135deg, #0d0900 0%, #2a1d00 45%, #b8820a 100%)" }}>

        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(200,150,10,0.4) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-10"
          style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.02) 15px, rgba(255,255,255,0.02) 30px)" }} />

        {/* Decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border border-gold/10" />
        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border border-gold/15" />

        <div className="relative h-full flex flex-col justify-between p-5 md:p-6">
          {/* Top */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center shadow-lg">
                <span className="text-black font-black text-sm">A</span>
              </div>
              <span className="text-white font-bold tracking-widest text-sm">APEX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-gold/60 rotate-90" />
              <span className="text-[10px] text-gold/50 uppercase tracking-widest font-medium">DIGITAL</span>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-0.5">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Saldo disponible</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-white font-mono tracking-tight">
                {hideBalance ? "••••••" : `$${(balance || 0).toFixed(2)}`}
              </p>
              <button onClick={onToggleBalance} className="text-white/30 hover:text-white/60 transition-colors">
                {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gold/50 font-mono">USDT</p>
          </div>

          {/* Chip + number */}
          <div className="space-y-2">
            <div className="w-9 h-6 rounded-md bg-gradient-to-br from-gold-light/80 to-gold-dark/80" />
            <p className="font-mono text-white/80 text-sm tracking-[0.22em]">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
          </div>

          {/* Bottom */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] text-white/30 uppercase tracking-widest mb-0.5">Titular</p>
              <p className="text-white font-semibold text-xs uppercase tracking-wider truncate max-w-[140px]">
                {user?.full_name || "APEX USER"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/30 uppercase tracking-widest mb-0.5">Válida</p>
              <p className="text-white font-mono text-xs">12/29</p>
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
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

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

  /* ── LOCKED STATE ── */
  if (!hasAccess) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-gold" />
            <h1 className="text-xl font-bold">Billetera Digital</h1>
            <span className="text-[10px] bg-gold/20 text-gold border border-gold/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Exclusiva</span>
          </div>
          <p className="text-sm text-muted-foreground">Solicita tu tarjeta · <span className="text-gold font-semibold">5% cashback</span> en cada compra</p>
        </motion.div>

        {/* Blurred card preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="relative">
          <div className="blur-sm opacity-50 pointer-events-none">
            <ApexCard user={user} cardNumber={null} balance={0} hideBalance={true} onToggleBalance={() => {}} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-border">
              <Lock className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-sm font-bold">Desbloquea con $1,000 invertidos</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
          <div className="rounded-xl bg-secondary/50 border border-border p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-mono font-bold">${totalInvested.toLocaleString()} / $1,000</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalInvested / MIN_INVESTMENT) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-right">
              Faltan <strong className="text-foreground">${Math.max(0, MIN_INVESTMENT - totalInvested).toLocaleString()}</strong> USDT
            </p>
          </div>

          {/* Benefits preview */}
          <div className="grid grid-cols-2 gap-2">
            {BENEFITS.slice(0, 4).map(b => (
              <div key={b.label} className="rounded-xl bg-secondary/40 border border-border/50 p-3 flex items-center gap-2">
                <b.icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <p className="text-xs font-medium">{b.label}</p>
              </div>
            ))}
          </div>

          <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11">
            <a href="/investments">Invertir ahora <ChevronRight className="w-4 h-4 ml-1" /></a>
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ── WALLET MAIN VIEW ── */
  return (
    <div className="space-y-5 max-w-md mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Billetera Digital
            <span className="text-[9px] bg-gold/20 text-gold border border-gold/30 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wider">APEX</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tu wallet con cashback del 5%</p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Activa</span>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
        <ApexCard
          user={user}
          cardNumber={requested ? cardNumber : null}
          balance={user?.balance || 0}
          hideBalance={hideBalance}
          onToggleBalance={() => setHideBalance(h => !h)}
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map(({ icon: Icon, label, color, bg }) => (
          <button key={label}
            onClick={() => toast.info(`${label}: próximamente disponible`)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${bg} transition-all active:scale-95`}>
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Cashback banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl bg-gradient-to-r from-gold/15 via-gold/10 to-transparent border border-gold/25 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Cashback acumulado</p>
          <p className="text-2xl font-black text-gold font-mono">$0.00</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">USDT · 5% en cada compra</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center">
          <Star className="w-6 h-6 text-gold fill-gold/30" />
        </div>
      </motion.div>

      {/* Solicitar tarjeta — visible siempre */}
      {!requested ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-gold/25 bg-card p-5 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Crown className="w-4 h-4 text-gold" /> Solicitar Tarjeta Física
          </h2>
          <p className="text-xs text-muted-foreground">Acceso desbloqueado. Ingresa tus datos de envío:</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Dirección de envío</Label>
              <Input placeholder="Av. Javier Prado 1234, Piso 3" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ciudad / Distrito</Label>
              <Input placeholder="Lima, Miraflores" value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Teléfono</Label>
              <Input placeholder="+51 912 345 678" value={form.phone} type="tel"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="mt-1.5 bg-secondary border-border font-mono" />
            </div>
          </div>
          <Button onClick={handleRequest} disabled={submitting}
            className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11">
            {submitting ? "Enviando..." : "Solicitar mi Tarjeta APEX"}
          </Button>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>Información privada. Solo usada para el envío físico.</span>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-emerald-400">¡Solicitud enviada!</h2>
          <p className="text-sm text-muted-foreground">Tu Tarjeta APEX física llegará en <strong className="text-foreground">5–10 días hábiles</strong>.</p>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="flex gap-1 bg-secondary rounded-xl p-1">
        {["inicio", "beneficios"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "inicio" && (
          <motion.div key="inicio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Últimos movimientos</p>
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">Sin movimientos aún</p>
              <p className="text-xs text-muted-foreground/60">Tus transacciones aparecerán aquí</p>
            </div>
          </motion.div>
        )}

        {activeTab === "beneficios" && (
          <motion.div key="beneficios" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />
              </div>
            ))}
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  );
}
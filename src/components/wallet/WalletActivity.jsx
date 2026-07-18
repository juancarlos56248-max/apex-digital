import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Globe, Shield, ShoppingBag, Smartphone, Zap } from "lucide-react";

const benefits = [
  [ShoppingBag, "5% Cashback", "En todas tus compras, acreditado en USDT"],
  [Globe, "Aceptada mundial", "Miles de comercios internacionales"],
  [Zap, "Sin comisiones", "Compras hasta $500/mes sin costo"],
  [Smartphone, "Pagos digitales", "Compatible con Apple Pay & Google Pay"],
  [Shield, "Respaldada", "Por tu inversión activa en APEX"],
];

export const CASHBACK_RATE = 0.05;

export const cardMovements = [
  [Smartphone, "Netflix", 16.39],
  [ShoppingBag, "Compra en Infiniti", 248],
];

export const totalCashback = cardMovements.reduce(
  (total, [, , amount]) => total + amount * CASHBACK_RATE,
  0
);

export default function WalletActivity({ activeTab, setActiveTab }) {
  return <div>
    <div className="grid grid-cols-2 rounded-xl border border-border bg-secondary/40 p-1">
      {["inicio", "beneficios"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "border border-gold/30 bg-gold/10 text-gold" : "text-muted-foreground"}`}>{tab}</button>)}
    </div>
    <AnimatePresence mode="wait">
      {activeTab === "inicio" ? <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Últimos movimientos</p>
        <div className="mt-4 divide-y divide-border">{cardMovements.map(([Icon, name, amount]) => <div key={name} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><div className="rounded-xl border border-gold/20 bg-gold/10 p-2.5"><Icon className="h-4 w-4 text-gold" /></div><div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-success">Cashback +${(amount * CASHBACK_RATE).toFixed(2)}</p></div><p className="ml-auto font-mono text-sm font-bold text-foreground">-${amount.toFixed(2)}</p></div>)}</div>
      </motion.div> : <motion.div key="beneficios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 grid gap-2">
        {benefits.map(([Icon, label, desc]) => <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"><div className="rounded-xl border border-gold/25 bg-gold/10 p-2.5"><Icon className="h-4 w-4 text-gold" /></div><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div><CheckCircle className="ml-auto h-4 w-4 text-success" /></div>)}
      </motion.div>}
    </AnimatePresence>
  </div>;
}
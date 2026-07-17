import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Globe, Shield, ShoppingBag, Smartphone, Zap } from "lucide-react";

const benefits = [
  [ShoppingBag, "5% Cashback", "En todas tus compras, acreditado en USDT"],
  [Globe, "Aceptada mundial", "Miles de comercios internacionales"],
  [Zap, "Sin comisiones", "Compras hasta $500/mes sin costo"],
  [Smartphone, "Pagos digitales", "Compatible con Apple Pay & Google Pay"],
  [Shield, "Respaldada", "Por tu inversión activa en APEX"],
];

export default function WalletActivity({ activeTab, setActiveTab }) {
  return <div>
    <div className="grid grid-cols-2 rounded-xl border border-border bg-secondary/40 p-1">
      {["inicio", "beneficios"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "border border-chart-3/30 bg-chart-3/10 text-chart-3" : "text-muted-foreground"}`}>{tab}</button>)}
    </div>
    <AnimatePresence mode="wait">
      {activeTab === "inicio" ? <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border border-chart-4/20 bg-card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Últimos movimientos</p>
        <div className="flex flex-col items-center py-10 text-center"><div className="rounded-2xl border border-chart-3/15 bg-chart-3/5 p-4"><ShoppingBag className="h-6 w-6 text-chart-3/50" /></div><p className="mt-3 text-sm font-semibold">Sin movimientos aún</p><p className="mt-1 text-xs text-muted-foreground">Tus transacciones aparecerán aquí</p></div>
      </motion.div> : <motion.div key="beneficios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 grid gap-2">
        {benefits.map(([Icon, label, desc]) => <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"><div className="rounded-xl border border-chart-3/25 bg-chart-3/10 p-2.5"><Icon className="h-4 w-4 text-chart-3" /></div><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div><CheckCircle className="ml-auto h-4 w-4 text-success" /></div>)}
      </motion.div>}
    </AnimatePresence>
  </div>;
}
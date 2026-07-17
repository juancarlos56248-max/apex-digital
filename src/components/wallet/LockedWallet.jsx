import { ChevronRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CyberCard from "@/components/wallet/CyberCard";

export default function LockedWallet({ user, totalInvested, minimum }) {
  const requiredAmount = minimum + 0.01;
  const remaining = Math.max(0, requiredAmount - totalInvested);
  const progress = Math.min(100, (totalInvested / requiredAmount) * 100);
  return <div className="mx-auto max-w-md space-y-5">
    <div><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">APEX // DIGITAL VAULT</p><div className="mt-2 flex items-center gap-2"><h1 className="text-2xl font-black">Billetera Digital</h1><span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9px] font-bold text-gold">EXCLUSIVA</span></div><p className="mt-1 text-sm text-muted-foreground">Solicita tu tarjeta · <span className="text-gold">5% cashback</span> en cada compra</p></div>
    <div className="relative"><div className="pointer-events-none opacity-40 blur-sm"><CyberCard user={user} balance={0} hideBalance onToggleBalance={() => {}} /></div><div className="absolute inset-0 flex items-center justify-center"><div className="rounded-2xl border border-gold/30 bg-background/90 px-6 py-4 text-center backdrop-blur-xl"><Lock className="mx-auto h-5 w-5 text-gold" /><p className="mt-2 text-sm font-bold">Requiere una inversión superior a $1,000</p></div></div></div>
    <div className="rounded-2xl border border-gold/20 bg-card p-5">
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Nivel de acceso</span><span className="font-mono font-bold">${totalInvested.toLocaleString()} / más de $1,000</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-gold to-gold" /></div>
      <p className="mt-2 text-right text-[11px] text-muted-foreground">Realiza una inversión superior a $1,000 · Faltan <strong className="text-foreground">${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> USDT</p>
      <div className="my-5 grid grid-cols-2 gap-2">{["5% Cashback", "Aceptada mundial", "Sin comisiones", "Pagos digitales"].map(item => <div key={item} className="rounded-lg border border-border bg-secondary/40 p-3 text-xs">{item}</div>)}</div>
      <Button asChild className="h-11 w-full bg-gold font-bold text-background hover:bg-gold/90"><Link to="/investments">Invertir ahora <ChevronRight className="h-4 w-4" /></Link></Button>
    </div>
  </div>;
}
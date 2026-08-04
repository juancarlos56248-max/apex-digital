import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BonoDepositoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-r from-gold/20 via-gold/10 to-gold-dark/15 p-5 shadow-lg shadow-gold/10"
    >
      <div className="absolute inset-0 gold-shimmer" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/15">
          <Gift className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">Bono exclusivo</span>
          <h2 className="mt-2 text-lg font-black text-gold-light">¡Bonificación del 50% por depósito!</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Deposita más de $100 USDT y obtén un bono del 50% adicional sobre tu depósito, válido una sola vez.</p>
        </div>
        <Link to="/deposit" className="flex-shrink-0">
          <Button className="w-full font-bold sm:w-auto">Depositar ahora <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </motion.div>
  );
}
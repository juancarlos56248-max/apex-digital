import { Eye, EyeOff, Wifi } from "lucide-react";

export default function CyberCard({ user, cardNumber, balance, hideBalance, onToggleBalance }) {
  return (
    <div className="relative mx-auto aspect-[1.586] w-full max-w-md select-none">
      <div className="absolute -inset-1 rounded-[1.8rem] bg-gradient-to-r from-gold/40 via-gold-dark/30 to-gold/40 blur-lg" />
      <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-gold/40 bg-card shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-background to-gold-dark/20" />
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-gold/20" />
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-gold-dark/20" />
        <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-sm font-black text-gold">A</div>
              <div><p className="text-sm font-black tracking-[0.24em]">APEX</p><p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">Quantum wallet</p></div>
            </div>
            <div className="flex items-center gap-2 text-gold"><Wifi className="h-4 w-4 rotate-90" /><span className="text-[9px] tracking-[0.2em]">DIGITAL</span></div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Saldo disponible</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-mono text-2xl font-black tracking-tight md:text-3xl">{hideBalance ? "••••••" : `$${(balance || 0).toFixed(2)}`}</p>
              <button onClick={onToggleBalance} className="rounded-lg border border-border bg-secondary/60 p-1.5 text-muted-foreground hover:text-gold">
                {hideBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="font-mono text-[9px] text-gold">USDT // SECURED</p>
          </div>
          <div className="flex items-end justify-between">
            <div><p className="font-mono text-xs tracking-[0.16em] text-foreground/80">{cardNumber || "•••• •••• •••• ••••"}</p><p className="mt-2 max-w-[170px] truncate text-[9px] uppercase tracking-widest text-muted-foreground">{user?.full_name || "APEX USER"}</p></div>
            <div className="text-right"><p className="text-[8px] uppercase tracking-widest text-muted-foreground">Válida</p><p className="font-mono text-xs">12/29</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
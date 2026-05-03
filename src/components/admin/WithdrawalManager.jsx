import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCcw, Copy, CheckCheck } from "lucide-react";
import moment from "moment";

function CopyAddress({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border">
      <span className="font-mono text-xs text-foreground flex-1 break-all">{value}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Dirección copiada");
          setTimeout(() => setCopied(false), 2000);
        }}
        className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${copied ? "text-emerald-400" : "text-muted-foreground hover:text-gold"}`}
      >
        {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function WithdrawalManager() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.filter({ type: "withdrawal" }, "-created_date", 50);
    setWithdrawals(txs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (w) => {
    await base44.entities.Transaction.update(w.id, { status: "approved" });
    toast.success(`Retiro de $${w.amount} aprobado`);
    load();
  };

  const handleReject = async (w) => {
    await base44.entities.Transaction.update(w.id, { status: "rejected" });
    const users = await base44.entities.User.filter({ email: w.user_email });
    if (users.length > 0) {
      await base44.entities.User.update(users[0].id, {
        balance: (users[0].balance || 0) + w.amount,
      });
    }
    toast.info("Retiro rechazado, balance restaurado");
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  const pending = withdrawals.filter(w => w.status === "pending");
  const rest = withdrawals.filter(w => w.status !== "pending");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{pending.length} pendientes · {withdrawals.length} total</p>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-xs h-7">
          <RefreshCcw className="w-3 h-3" /> Refrescar
        </Button>
      </div>

      {withdrawals.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No hay retiros registrados</p>
      )}

      {/* Pendientes primero */}
      {[...pending, ...rest].map((w) => (
        <div key={w.id} className={`rounded-xl border p-4 space-y-3 ${
          w.status === "pending" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border bg-card"
        }`}>
          {/* Fila superior */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground line-through opacity-60">${w.amount?.toLocaleString()} bruto</p>
              <p className="text-sm font-bold font-mono text-emerald-400">${(w.amount * 0.92).toFixed(2)} USDT <span className="text-[10px] text-muted-foreground font-normal">(neto -8%)</span></p>
              <p className="text-[11px] text-muted-foreground">{w.user_email} · {moment(w.created_date).format("DD/MM HH:mm")}</p>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${
              w.status === "pending"  ? "bg-yellow-500/15 text-yellow-400" :
              w.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                                        "bg-red-500/15 text-red-400"
            }`}>
              {w.status === "pending" ? "Pendiente" : w.status === "approved" ? "Aprobado" : "Rechazado"}
            </span>
          </div>

          {/* Red + dirección */}
          <div className="space-y-1.5">
            {w.network && (
              <p className="text-[11px] text-muted-foreground">Red: <span className="font-mono font-bold text-foreground">{w.network}</span></p>
            )}
            <CopyAddress value={w.wallet_address} />
          </div>

          {/* Acciones */}
          {w.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => handleApprove(w)}
                className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 h-8 text-xs font-bold gap-1">
                <Check className="w-3.5 h-3.5" /> Pagado
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleReject(w)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 h-8 text-xs font-bold gap-1">
                <X className="w-3.5 h-3.5" /> Rechazar
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
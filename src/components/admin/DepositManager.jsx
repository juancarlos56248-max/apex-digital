import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, RefreshCcw } from "lucide-react";
import moment from "moment";

export default function DepositManager() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDeposits = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.filter({ type: "deposit" }, "-created_date", 50);
    setDeposits(txs);
    setLoading(false);
  };

  useEffect(() => { loadDeposits(); }, []);

  const handleApprove = async (deposit) => {
    await base44.entities.Transaction.update(deposit.id, { status: "approved" });
    const users = await base44.entities.User.filter({ email: deposit.user_email });
    if (users.length > 0) {
      const u = users[0];
      // Check if deposit was made on April 9, 2026 (Lima time)
      const depositDate = new Date(deposit.created_date);
      const isPromoDay = depositDate.getFullYear() === 2026 &&
        depositDate.getMonth() === 3 && // April = 3
        depositDate.getDate() === 9;
      const bonus = isPromoDay ? deposit.amount * 0.20 : 0;
      const total = deposit.amount + bonus;
      await base44.entities.User.update(u.id, {
        balance: (u.balance || 0) + total,
      });
      if (bonus > 0) {
        await base44.entities.Transaction.create({
          user_email: deposit.user_email,
          type: "dividend",
          amount: parseFloat(bonus.toFixed(2)),
          status: "completed",
          notes: "🎁 Bono promocional 20% — 9 de Abril",
        });
        toast.success(`✅ Depósito aprobado + Bono 20% ($${bonus.toFixed(2)}) acreditado a ${deposit.user_email}`);
      } else {
        toast.success(`Depósito de $${deposit.amount} acreditado a ${deposit.user_email}`);
      }
    }
    loadDeposits();
  };

  const handleReject = async (deposit) => {
    await base44.entities.Transaction.update(deposit.id, { status: "rejected" });
    toast.info("Depósito rechazado");
    loadDeposits();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Monitor de Depósitos</h3>
        <Button variant="ghost" size="sm" onClick={loadDeposits} className="gap-1.5 text-xs">
          <RefreshCcw className="w-3 h-3" /> Refrescar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Red</th>
              <th className="px-4 py-3 text-left">TXID</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs">{d.user_email}</td>
                <td className="px-4 py-3 font-mono font-medium">${d.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{d.network || "—"}</td>
                <td className="px-4 py-3">
                  {d.txid ? (
                    <span className="font-mono text-[11px] text-muted-foreground">{d.txid.slice(0, 16)}...</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{moment(d.created_date).format("DD/MM HH:mm")}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    d.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                    d.status === "approved" ? "bg-success/10 text-success" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {d.status === "pending" ? "Pendiente" : d.status === "approved" ? "Aprobado" : "Rechazado"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {d.status === "pending" && (
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleApprove(d)} className="h-7 px-2 text-success hover:text-success">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(d)} className="h-7 px-2 text-destructive hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No hay depósitos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCcw } from "lucide-react";
import moment from "moment";

export default function WithdrawalManager() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWithdrawals = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.filter({ type: "withdrawal" }, "-created_date", 50);
    setWithdrawals(txs);
    setLoading(false);
  };

  useEffect(() => { loadWithdrawals(); }, []);

  const handleApprove = async (w) => {
    await base44.entities.Transaction.update(w.id, { status: "approved" });
    toast.success(`Retiro de $${w.amount} aprobado para ${w.user_email}`);
    loadWithdrawals();
  };

  const handleReject = async (w) => {
    // Reject and return balance
    await base44.entities.Transaction.update(w.id, { status: "rejected" });
    const users = await base44.entities.User.filter({ email: w.user_email });
    if (users.length > 0) {
      await base44.entities.User.update(users[0].id, {
        balance: (users[0].balance || 0) + w.amount,
      });
    }
    toast.info("Retiro rechazado, balance restaurado");
    loadWithdrawals();
  };

  const handleBulkApprove = async () => {
    const pending = withdrawals.filter(w => w.status === "pending");
    for (const w of pending) {
      await base44.entities.Transaction.update(w.id, { status: "approved" });
    }
    toast.success(`${pending.length} retiros aprobados`);
    loadWithdrawals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">Gestor de Pagos</h3>
          <p className="text-[11px] text-muted-foreground">{pendingCount} retiros pendientes de aprobación</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button size="sm" onClick={handleBulkApprove} className="bg-gold hover:bg-gold-dark text-black text-xs h-7">
              Aprobar Todos ({pendingCount})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={loadWithdrawals} className="gap-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" /> Refrescar
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Red</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs">{w.user_email}</td>
                <td className="px-4 py-3 font-mono font-medium text-destructive">-${w.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{w.network || "—"}</td>
                <td className="px-4 py-3">
                  {w.wallet_address ? (
                    <span className="font-mono text-[11px] text-muted-foreground">{w.wallet_address.slice(0, 16)}...</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{moment(w.created_date).format("DD/MM HH:mm")}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    w.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                    w.status === "approved" ? "bg-success/10 text-success" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {w.status === "pending" ? "Pending Compliance" : w.status === "approved" ? "Aprobado" : "Rechazado"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {w.status === "pending" && (
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleApprove(w)} className="h-7 px-2 text-success hover:text-success">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(w)} className="h-7 px-2 text-destructive hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No hay retiros registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
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

      <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {withdrawals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay retiros registrados</p>
        )}
        {withdrawals.map((w) => (
          <div key={w.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20">
            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{w.user_email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{moment(w.created_date).format("DD/MM HH:mm")}</span>
                <span className="text-[10px] text-muted-foreground">{w.network || "—"}</span>
                {w.wallet_address && (
                  <span className="font-mono text-[10px] text-muted-foreground">{w.wallet_address.slice(0, 10)}…</span>
                )}
              </div>
            </div>

            {/* Monto + estado */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-mono font-bold text-destructive">-${w.amount.toLocaleString()}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                w.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                w.status === "approved" ? "bg-success/10 text-success" :
                "bg-destructive/10 text-destructive"
              }`}>
                {w.status === "pending" ? "Pendiente" : w.status === "approved" ? "Aprobado" : "Rechazado"}
              </span>
            </div>

            {/* Acciones */}
            {w.status === "pending" && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => handleApprove(w)} className="h-7 w-7 p-0 text-success hover:text-success">
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleReject(w)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
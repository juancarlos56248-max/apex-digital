import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCcw, Copy, Wallet, Network, User } from "lucide-react";
import moment from "moment";

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copiado`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 p-1 rounded transition-colors ${copied ? "text-emerald-400" : "text-muted-foreground hover:text-gold"}`}
      title={`Copiar ${label}`}
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  );
}

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
      {/* Header */}
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

      <div className="divide-y divide-border">
        {withdrawals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay retiros registrados</p>
        )}

        {withdrawals.map((w) => (
          <div key={w.id} className={`px-5 py-5 space-y-4 ${w.status === "pending" ? "bg-yellow-500/3" : ""}`}>

            {/* Fila 1: Usuario + Monto + Estado */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground truncate">{w.user_email}</p>
                    <CopyButton value={w.user_email} label="email" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{moment(w.created_date).format("DD/MM/YYYY HH:mm")}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-mono font-black text-destructive">${w.amount?.toLocaleString()} USDT</p>
                <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold mt-0.5 ${
                  w.status === "pending" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                  w.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                  "bg-destructive/15 text-destructive border border-destructive/20"
                }`}>
                  {w.status === "pending" ? "⏳ Pendiente" : w.status === "approved" ? "✅ Aprobado" : "❌ Rechazado"}
                </span>
              </div>
            </div>

            {/* Fila 2: Datos de pago (el destino del dinero) */}
            <div className="rounded-xl border-2 border-gold/25 bg-gold/5 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">📤 Datos de pago — enviar a esta cuenta</p>

              {/* Red */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" /> Red blockchain
                </span>
                <span className="text-sm font-black font-mono text-gold bg-gold/10 px-2.5 py-0.5 rounded-md">
                  {w.network || "No especificada"}
                </span>
              </div>

              {/* Wallet */}
              <div className="space-y-1">
                <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Dirección de billetera destino
                </span>
                <div className="flex items-center gap-2 bg-background rounded-lg border border-border px-3 py-2.5">
                  <p className="text-sm font-mono text-foreground break-all flex-1 leading-relaxed">
                    {w.wallet_address || "No especificada"}
                  </p>
                  {w.wallet_address && (
                    <CopyButton value={w.wallet_address} label="dirección" />
                  )}
                </div>
              </div>

              {/* Monto a enviar destacado */}
              <div className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <span className="text-[12px] text-muted-foreground">Monto a enviar</span>
                <span className="text-base font-black font-mono text-destructive">${w.amount?.toLocaleString()} USDT</span>
              </div>
            </div>

            {/* Notas */}
            {w.notes && (
              <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Notas: </span>{w.notes}
              </div>
            )}

            {/* Acciones */}
            {w.status === "pending" && (
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={() => handleApprove(w)} className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 gap-1.5 h-9 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Marcar como pagado
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleReject(w)} className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 gap-1.5 h-9 font-semibold">
                  <X className="w-3.5 h-3.5" /> Rechazar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
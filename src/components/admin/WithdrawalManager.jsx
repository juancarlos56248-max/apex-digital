import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCcw, Copy } from "lucide-react";
import moment from "moment";

function CopyBtn({ value, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`${label} copiado`);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors flex-shrink-0 ${
        copied
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          : "bg-secondary text-muted-foreground border-border hover:text-gold hover:border-gold/30"
      }`}
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copiado" : "Copiar"}
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
    toast.success(`Retiro de $${w.amount} aprobado`);
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">Gestor de Pagos</h3>
          <p className="text-[11px] text-muted-foreground">{pendingCount} retiros pendientes</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button size="sm" onClick={handleBulkApprove} className="bg-gold hover:bg-gold-dark text-black text-xs h-8">
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
          <p className="text-sm text-muted-foreground text-center py-10">No hay retiros registrados</p>
        )}

        {withdrawals.map((w) => (
          <div key={w.id} className="p-5 space-y-4">

            {/* ── Bloque 1: Usuario y fecha ── */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Usuario</p>
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-sm font-semibold break-all">{w.user_email}</span>
                  <CopyBtn value={w.user_email} label="Email" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{moment(w.created_date).format("DD/MM/YYYY HH:mm")}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border flex-shrink-0 ${
                w.status === "pending"  ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                w.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                                          "bg-red-500/15 text-red-400 border-red-500/30"
              }`}>
                {w.status === "pending" ? "⏳ Pendiente" : w.status === "approved" ? "✅ Aprobado" : "❌ Rechazado"}
              </span>
            </div>

            {/* ── Bloque 2: Cuánto pagar ── */}
            <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 p-4 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">💸 Monto a pagar</p>
              <p className="text-3xl font-black font-mono text-destructive">${w.amount?.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-0.5">USDT</p>
            </div>

            {/* ── Bloque 3: A dónde enviar ── */}
            <div className="rounded-xl bg-gold/5 border-2 border-gold/25 p-4 space-y-3">
              <p className="text-[11px] text-gold font-bold uppercase tracking-wider">📤 Enviar a esta cuenta</p>

              {/* Red */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Red blockchain</span>
                <span className="text-sm font-black font-mono text-gold bg-gold/15 px-3 py-0.5 rounded-full">
                  {w.network || "—"}
                </span>
              </div>

              {/* Dirección */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Dirección de billetera destino</p>
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-sm font-mono text-foreground break-all leading-relaxed">
                    {w.wallet_address || "No especificada"}
                  </p>
                  {w.wallet_address && (
                    <div className="mt-2">
                      <CopyBtn value={w.wallet_address} label="Dirección" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notas opcionales */}
            {w.notes && (
              <p className="text-xs text-muted-foreground px-1">
                <span className="font-semibold text-foreground">Notas: </span>{w.notes}
              </p>
            )}

            {/* ── Acciones ── */}
            {w.status === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(w)}
                  className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 gap-1.5 h-10 font-bold text-sm"
                >
                  <Check className="w-4 h-4" /> Pagado ✓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReject(w)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 gap-1.5 h-10 font-bold text-sm"
                >
                  <X className="w-4 h-4" /> Rechazar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
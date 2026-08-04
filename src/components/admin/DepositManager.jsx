import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, RefreshCcw, Settings } from "lucide-react";
import moment from "moment";

export default function DepositManager() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeMin, setRangeMin] = useState("10");
  const [rangeMax, setRangeMax] = useState("50000");
  const [showRange, setShowRange] = useState(false);
  const [savingRange, setSavingRange] = useState(false);

  const loadRange = async () => {
    const configs = await base44.entities.AppConfig.filter({ key: "deposit_range" });
    if (configs.length > 0) {
      const val = JSON.parse(configs[0].value);
      setRangeMin(String(val.min));
      setRangeMax(String(val.max));
    }
  };

  const saveRange = async () => {
    setSavingRange(true);
    const configs = await base44.entities.AppConfig.filter({ key: "deposit_range" });
    const payload = { key: "deposit_range", value: JSON.stringify({ min: Number(rangeMin), max: Number(rangeMax) }) };
    if (configs.length > 0) {
      await base44.entities.AppConfig.update(configs[0].id, payload);
    } else {
      await base44.entities.AppConfig.create(payload);
    }
    setSavingRange(false);
    toast.success(`Rango guardado: $${rangeMin} – $${rangeMax}`);
    setShowRange(false);
  };

  const loadDeposits = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.filter({ type: "deposit" }, "-created_date", 50);
    setDeposits(txs);
    setLoading(false);
  };

  useEffect(() => { loadDeposits(); loadRange(); }, []);

  const handleApprove = async (deposit) => {
    await base44.entities.Transaction.update(deposit.id, { status: "approved" });
    const users = await base44.entities.User.filter({ email: deposit.user_email });
    if (users.length > 0) {
      const u = users[0];
      const bonusEligible = deposit.amount > 100 && u.deposit_bonus_claimed !== true;
      const bonusAmount = bonusEligible ? deposit.amount * 0.5 : 0;
      await base44.entities.User.update(u.id, {
        balance: (u.balance || 0) + deposit.amount + bonusAmount,
        ...(bonusEligible && { deposit_bonus_claimed: true }),
      });
      if (bonusEligible) {
        await base44.entities.Transaction.create({
          user_email: deposit.user_email,
          type: "deposit",
          amount: bonusAmount,
          status: "completed",
          notes: "Bonificación única del 50% por depósito",
        });
      }
      toast.success(bonusEligible
        ? `Depósito de $${deposit.amount} + bono de $${bonusAmount} acreditados a ${deposit.user_email}`
        : `Depósito de $${deposit.amount} acreditado a ${deposit.user_email}`
      );

      // Procesar bono de referido si el usuario fue referido (idempotency handled server-side)
      if (u.referral_code_used) {
        const amt = deposit.amount;
        const tier = amt >= 10000 ? "institutional" : amt >= 2000 ? "elite" : amt >= 500 ? "advance" : "starter";
        base44.functions.invoke('procesarReferido', {
          referral_code: u.referral_code_used,
          tier,
          referred_email: deposit.user_email,
        }).catch(() => {}); // fire-and-forget, server handles duplicates
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowRange(v => !v)} className="gap-1.5 text-xs text-gold">
            <Settings className="w-3 h-3" /> Rango
          </Button>
          <Button variant="ghost" size="sm" onClick={loadDeposits} className="gap-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" /> Refrescar
          </Button>
        </div>
      </div>

      {showRange && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
          <span className="text-xs text-muted-foreground font-medium">Rango de depósito permitido:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mín $</span>
            <Input type="number" value={rangeMin} onChange={e => setRangeMin(e.target.value)} className="h-7 w-24 text-xs font-mono bg-secondary border-border" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Máx $</span>
            <Input type="number" value={rangeMax} onChange={e => setRangeMax(e.target.value)} className="h-7 w-28 text-xs font-mono bg-secondary border-border" />
          </div>
          <Button size="sm" onClick={saveRange} disabled={savingRange} className="h-7 text-xs bg-gold hover:bg-gold-dark text-black">{savingRange ? "Guardando..." : "Guardar"}</Button>
          <span className="text-[11px] text-muted-foreground">Actual: <span className="text-gold font-mono">${rangeMin} – ${rangeMax}</span></span>
        </div>
      )}

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
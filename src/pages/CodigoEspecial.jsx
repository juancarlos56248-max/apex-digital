import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import SpecialCodeForm from "@/components/bonus/SpecialCodeForm";

export default function CodigoEspecial() {
  const { user } = useOutletContext();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(Boolean(user?.bono_codigo_activado));
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ deposits: 0, referrals: 0 });

  const activate = async () => {
    if (user.bono_codigo_activado) return toast.error("Ya activaste un código especial");
    setLoading(true);
    try {
      const value = code.trim().toUpperCase();
      const codes = await base44.entities.BonoCodigo.filter({ codigo: value, status: "activo" });
      if (!codes[0]) return toast.error("Código inválido o ya utilizado");
      const bonus = codes[0];
      const [transactions, referrals] = await Promise.all([
        base44.entities.Transaction.filter({ user_email: user.email, type: "deposit", status: "approved" }),
        base44.entities.Referral.filter({ referrer_email: user.email, status: "credited" }),
      ]);
      const nextStats = { deposits: transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0), referrals: referrals.length };
      setResult(bonus); setStats(nextStats);
      if (nextStats.deposits < bonus.min_deposito || nextStats.referrals < bonus.min_referidos) return toast.error("Aún no cumples los requisitos del código");
      await Promise.all([
        base44.auth.updateMe({ balance: (user.balance || 0) + bonus.monto_bono, bono_codigo_activado: true }),
        base44.entities.BonoCodigo.update(bonus.id, { status: "usado", usado_por: user.email }),
        base44.entities.Transaction.create({ user_email: user.email, type: "dividend", amount: bonus.monto_bono, status: "completed", notes: `Bono código ${bonus.codigo}` }),
      ]);
      setActivated(true);
      toast.success(`Bono de $${bonus.monto_bono} USDT acreditado`);
    } catch {
      toast.error("No se pudo activar el código. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-auto max-w-xl space-y-5"><div><h1 className="text-2xl font-bold">Código Especial</h1><p className="mt-1 text-sm text-muted-foreground">Activa el código entregado por APEX para recibir tu beneficio.</p></div><SpecialCodeForm code={code} setCode={setCode} loading={loading} activated={activated} result={result} stats={stats} onSubmit={activate} /></div>;
}
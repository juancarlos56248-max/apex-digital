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
  const [stats, setStats] = useState({ nodeAmount: 0, referrals: 0 });

  const activate = async () => {
    if (user.bono_codigo_activado) return toast.error("Ya activaste un código especial");
    setLoading(true);
    try {
      const value = code.trim().toUpperCase();
      const bonus = { codigo: "APEX1000S", monto_bono: 1000, min_node: 300, min_referidos: 3 };
      if (value !== bonus.codigo) return toast.error("Código inválido");
      const [investments, referrals] = await Promise.all([
        base44.entities.Investment.filter({ user_email: user.email, status: "active" }),
        base44.entities.Referral.filter({ referrer_email: user.email, status: "credited" }),
      ]);
      const eligibleNode = investments.find((investment) => (investment.amount || 0) >= bonus.min_node);
      const nextStats = { nodeAmount: eligibleNode?.amount || 0, referrals: referrals.length };
      setResult(bonus); setStats(nextStats);
      if (!eligibleNode || nextStats.referrals < bonus.min_referidos) return toast.error("Necesitas un nodo activo de $300 USDT y 3 referidos activos");
      await Promise.all([
        base44.auth.updateMe({ balance: (user.balance || 0) + bonus.monto_bono, bono_codigo_activado: true }),
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
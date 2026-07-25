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
      const response = await base44.functions.invoke("activarCodigoEspecial", { code });
      const { bonus, stats: nextStats, eligible } = response.data;
      setResult(bonus);
      setStats(nextStats);
      if (!eligible) return toast.error("Necesitas un nodo activo de $300 USDT y 3 referidos con nodo activo");
      setActivated(true);
      toast.success(`Bono de $${bonus.monto_bono} USDT acreditado`);
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo activar el código. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-auto max-w-xl space-y-5"><div><h1 className="text-2xl font-bold">Código Especial</h1><p className="mt-1 text-sm text-muted-foreground">Activa el código entregado por APEX para recibir tu beneficio.</p></div><SpecialCodeForm code={code} setCode={setCode} loading={loading} activated={activated} result={result} stats={stats} onSubmit={activate} /></div>;
}
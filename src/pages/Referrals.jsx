import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Users, Gift, Share2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function Referrals() {
  const { user } = useOutletContext();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    base44.entities.Referral.filter({ referrer_email: user.email }, "-created_date").then((refs) => {
      setReferrals(refs);
      setLoading(false);
    });
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(user?.referral_code || "");
    toast.success("Código de referido copiado");
  };

  const copyLink = () => {
    const link = `${window.location.origin}/?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de referido copiado");
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const totalEarned = referrals.reduce((s, r) => s + (r.bonus_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Programa de Referidos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comparte tu código y recibe bonificaciones por cada referido que active un nodo
        </p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tu Código de Referido</h3>
            <p className="text-[11px] text-muted-foreground">Comparte este código con otros inversores</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-center">
            <p className="text-xl font-bold font-mono tracking-widest text-gold">{user.referral_code}</p>
          </div>
          <Button variant="outline" size="icon" onClick={copyCode} className="border-gold/20 hover:border-gold/40">
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={copyLink} variant="outline" className="w-full border-gold/20 hover:border-gold/40 text-gold">
          Copiar Enlace de Invitación
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3">
            <Users className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Referidos</p>
          <p className="text-2xl font-bold mt-1">{referrals.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3">
            <Gift className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Bonos Ganados</p>
          <p className="text-2xl font-bold mt-1 font-mono">${totalEarned.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Bonus Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-semibold mb-1">Tabla de Bonificaciones</h3>
        <p className="text-[11px] text-muted-foreground mb-4">Bono único por cada referido que active un nodo</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tier: "Starter", bonus: "$5" },
            { tier: "Pro", bonus: "$25" },
            { tier: "Elite", bonus: "$50" },
            { tier: "Institutional", bonus: "$100" },
          ].map((item) => (
            <div key={item.tier} className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">{item.tier}</p>
              <p className="text-lg font-bold font-mono text-gold mt-1">{item.bonus}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Referrals History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-semibold mb-4">Historial de Referidos</h3>
        {referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Aún no tienes referidos</p>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div>
                  <p className="text-sm font-medium">{ref.referred_email}</p>
                  <p className="text-[11px] text-muted-foreground">{ref.investment_tier?.toUpperCase()} — {moment(ref.created_date).format("DD/MM/YYYY")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-success">+${(ref.bonus_amount || 0).toFixed(2)}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ref.status === "credited" ? "bg-success/10 text-success" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {ref.status === "credited" ? "Acreditado" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
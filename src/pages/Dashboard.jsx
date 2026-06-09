import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Wallet, TrendingUp, DollarSign, Gift, ArrowRight, ArrowDownToLine, ArrowUpFromLine, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import StatsCard from "../components/dashboard/StatsCard";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ActiveInvestments from "../components/dashboard/ActiveInvestments";
import MarketAlerts from "../components/dashboard/MarketAlerts";
import { motion } from "framer-motion";

const quickActions = [
  { label: "Depositar", desc: "Añade fondos ahora", icon: ArrowDownToLine, to: "/deposit", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20 hover:border-emerald-500/40" },
  { label: "Invertir", desc: "Activa un nodo", icon: TrendingUp, to: "/investments", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20 hover:border-gold/40" },
  { label: "Retirar", desc: "Liquidar ganancias", icon: ArrowUpFromLine, to: "/withdraw", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20 hover:border-blue-500/40" },
  { label: "Referidos", desc: "Gana comisiones", icon: Users, to: "/referrals", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20 hover:border-purple-500/40" },
];

export default function Dashboard() {
  const { user } = useOutletContext();
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Investment.filter({ user_email: user.email, status: "active" }),
      base44.entities.Transaction.filter({ user_email: user.email }, "-created_date", 10),
    ]).then(([invs, txs]) => {
      setInvestments(invs);
      setTransactions(txs);
      setLoadingData(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const totalActive = investments.reduce((s, i) => s + i.amount, 0);
  const totalDividends = investments.reduce((s, i) => s + (i.total_earned || 0), 0);
  const hasInvestments = investments.length > 0;

  return (
    <div className="space-y-6">
      <MarketAlerts />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, <span className="text-gold-gradient">{user.full_name?.split(" ")[0] || "Inversor"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Panel de gestión de activos digitales</p>
        </div>
        <Link to="/investments">
          <Button className="bg-gold hover:bg-gold-dark text-black font-semibold gap-2 shadow-lg shadow-gold/20">
            <Zap className="w-4 h-4" />
            Activar Nodo
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </motion.div>

      {/* Bono de bienvenida banner (solo si no ha invertido) */}
      {!hasInvestments && (user.balance || 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gold">¡Tienes ${(user.balance || 0).toFixed(2)} USDT disponibles!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Activa tu primer nodo de inversión y empieza a generar rendimientos del 10% diario automáticamente.</p>
          </div>
          <Link to="/investments" className="flex-shrink-0">
            <Button size="sm" className="bg-gold hover:bg-gold-dark text-black font-bold gap-1.5 shadow-md shadow-gold/20">
              Comenzar <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Wallet} label="Balance disponible" value={`$${(user.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={0} />
        <StatsCard icon={TrendingUp} label="Activos invertidos" value={`$${totalActive.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend={hasInvestments ? 2.4 : null} delay={0.1} />
        <StatsCard icon={DollarSign} label="Rendimiento Activo" value={`$${totalDividends.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend={hasInvestments ? 5.1 : null} delay={0.2} />
        <StatsCard icon={Users} label="Total ganado" value={`$${(user.total_earned || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={0.3} />
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Acciones rápidas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <Link key={a.to} to={a.to}>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className={`rounded-xl border ${a.border} bg-card p-4 flex flex-col gap-2 cursor-pointer transition-all hover:bg-secondary/40 group`}
              >
                <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <a.icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Chart */}
      <PerformanceChart />

      {/* Active Investments & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActiveInvestments investments={investments} loading={loadingData} />
        <RecentTransactions transactions={transactions} loading={loadingData} />
      </div>
    </div>
  );
}
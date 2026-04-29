import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Wallet, TrendingUp, DollarSign, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import StatsCard from "../components/dashboard/StatsCard";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ActiveInvestments from "../components/dashboard/ActiveInvestments";
import MarketAlerts from "../components/dashboard/MarketAlerts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, setUser } = useOutletContext();
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [invs, txs] = await Promise.all([
        base44.entities.Investment.filter({ user_email: user.email, status: "active" }),
        base44.entities.Transaction.filter({ user_email: user.email }, "-created_date", 10),
      ]);
      setInvestments(invs);
      setTransactions(txs);
      setLoading(false);
    };
    load();
  }, [user]);


  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const totalActive = investments.reduce((s, i) => s + i.amount, 0);
  const totalDividends = investments.reduce((s, i) => s + (i.total_earned || 0), 0);

  return (
    <div className="space-y-6">
      <MarketAlerts />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, <span className="text-gold-gradient">{user.full_name?.split(" ")[0] || "Inversor"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Panel de gestión de activos digitales</p>
        </div>
        <Link to="/investments">
          <Button className="bg-gold hover:bg-gold-dark text-black font-semibold gap-2">
            <TrendingUp className="w-4 h-4" />
            Explorar Nodos
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Wallet} label="Balance disponible" value={`$${(user.balance || 0).toLocaleString()}`} delay={0} />
        <StatsCard icon={TrendingUp} label="Activos invertidos" value={`$${totalActive.toLocaleString()}`} trend={2.4} delay={0.1} />
        <StatsCard icon={DollarSign} label="Ganancias" value={`$${totalDividends.toFixed(2)}`} trend={5.1} delay={0.2} />
        <StatsCard icon={Users} label="Total ganado" value={`$${(user.total_earned || 0).toLocaleString()}`} delay={0.3} />
      </div>

      {/* Chart */}
      <PerformanceChart />

      {/* Active Investments & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActiveInvestments investments={investments} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
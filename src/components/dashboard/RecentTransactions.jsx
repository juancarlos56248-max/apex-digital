import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, Users } from "lucide-react";
import moment from "moment";

const typeConfig = {
  deposit: { icon: ArrowDownToLine, label: "Depósito", color: "text-success" },
  withdrawal: { icon: ArrowUpFromLine, label: "Retiro", color: "text-destructive" },
  dividend: { icon: DollarSign, label: "Dividendo", color: "text-gold" },
  referral_bonus: { icon: Users, label: "Bono Referido", color: "text-blue-400" },
};

const statusLabels = {
  pending: { label: "Pendiente", cls: "bg-yellow-500/10 text-yellow-500" },
  approved: { label: "Aprobado", cls: "bg-success/10 text-success" },
  rejected: { label: "Rechazado", cls: "bg-destructive/10 text-destructive" },
  completed: { label: "Completado", cls: "bg-success/10 text-success" },
};

export default function RecentTransactions({ transactions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="text-sm font-semibold mb-4">Transacciones Recientes</h3>
      
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Sin transacciones</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const config = typeConfig[tx.type] || typeConfig.deposit;
            const status = statusLabels[tx.status] || statusLabels.pending;
            const Icon = config.icon;
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-[11px] text-muted-foreground">{moment(tx.created_date).fromNow()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-medium ${config.color}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
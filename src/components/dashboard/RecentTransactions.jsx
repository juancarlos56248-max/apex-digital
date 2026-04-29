import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, Users, History, ChevronRight } from "lucide-react";
import moment from "moment";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

function TxRow({ tx }) {
  const config = typeConfig[tx.type] || typeConfig.deposit;
  const status = statusLabels[tx.status] || statusLabels.pending;
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
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
}

export default function RecentTransactions({ transactions }) {
  const [open, setOpen] = useState(false);
  const preview = transactions.slice(0, 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Transacciones Recientes</h3>
          {transactions.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold transition-colors"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sin transacciones</p>
        ) : (
          <div className="space-y-2">
            {preview.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            {transactions.length > 3 && (
              <button
                onClick={() => setOpen(true)}
                className="w-full py-2 text-[11px] text-muted-foreground hover:text-gold transition-colors text-center border border-dashed border-border/50 rounded-lg hover:border-gold/30"
              >
                +{transactions.length - 3} transacciones más
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Sheet historial completo */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="bg-card border-l border-border w-full max-w-sm overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-gold" />
              Historial de Transacciones
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sin transacciones</p>
            ) : (
              transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
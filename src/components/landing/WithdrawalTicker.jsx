import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpFromLine } from "lucide-react";

// Mask email: john***@gmail.com
function maskEmail(email) {
  if (!email) return "us***@****.com";
  const [user, domain] = email.split("@");
  const masked = user.slice(0, 2) + "***";
  return `${masked}@${domain}`;
}

export default function WithdrawalTicker() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [visible, setVisible] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const txs = await base44.entities.Transaction.filter(
        { type: "withdrawal", status: "approved" },
        "-updated_date",
        20
      );
      if (txs.length > 0) setWithdrawals(txs);
    };
    load();
  }, []);

  useEffect(() => {
    if (withdrawals.length === 0) return;
    // Show one item at a time, cycling every 3s
    setVisible(withdrawals[idx % withdrawals.length]);
    const timer = setTimeout(() => {
      setIdx(i => i + 1);
    }, 3500);
    return () => clearTimeout(timer);
  }, [idx, withdrawals]);

  if (!visible) return null;

  return (
    <div className="w-full flex justify-center px-4 py-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={visible.id + idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <ArrowUpFromLine className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{maskEmail(visible.user_email)}</span>
            {" "}retiró{" "}
            <span className="text-emerald-400 font-mono font-semibold">${visible.amount?.toLocaleString()} USDT</span>
            {" "}exitosamente
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
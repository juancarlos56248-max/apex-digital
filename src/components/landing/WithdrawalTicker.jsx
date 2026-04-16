import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpFromLine } from "lucide-react";
import moment from "moment";

// Fallback data cuando no hay retiros reales
const FALLBACK = [
  { id: "f1", user_email: "carlos.m***@gmail.com", amount: 1200, updated_date: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "f2", user_email: "ana.r***@hotmail.com", amount: 3500, updated_date: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "f3", user_email: "pedro.l***@yahoo.com", amount: 800, updated_date: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "f4", user_email: "lucia.v***@gmail.com", amount: 5200, updated_date: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: "f5", user_email: "jose.m***@outlook.com", amount: 2100, updated_date: new Date(Date.now() - 45 * 60000).toISOString() },
];

function maskEmail(email) {
  if (!email) return "us***@****.com";
  if (email.includes("***")) return email; // already masked (fallback)
  const [user, domain] = email.split("@");
  const masked = user.slice(0, 2) + "***";
  return `${masked}@${domain}`;
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return "hace unos segundos";
  if (diff === 1) return "hace 1 min";
  if (diff < 60) return `hace ${diff} min`;
  const h = Math.floor(diff / 60);
  return `hace ${h}h`;
}

export default function WithdrawalTicker() {
  const [items, setItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [displayed, setDisplayed] = useState([]);

  useEffect(() => {
    const load = async () => {
      const txs = await base44.entities.Transaction.filter(
        { type: "withdrawal", status: "approved" },
        "-updated_date",
        30
      );
      const source = txs.length >= 3 ? txs : FALLBACK;
      setQueue(source);
      // Show first 4 immediately
      setDisplayed(source.slice(0, 4));
    };
    load();
  }, []);

  // Rotate: every 4s add a new item at top, remove last
  useEffect(() => {
    if (queue.length === 0) return;
    const timer = setInterval(() => {
      setDisplayed(prev => {
        const nextIdx = Math.floor(Math.random() * queue.length);
        const next = queue[nextIdx];
        const newList = [next, ...prev.slice(0, 3)];
        return newList;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [queue]);

  if (displayed.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-3 space-y-2 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Retiros en vivo</span>
      </div>
      <AnimatePresence initial={false}>
        {displayed.map((item, i) => (
          <motion.div
            key={item.id + i}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ArrowUpFromLine className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium truncate">{maskEmail(item.user_email)}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo(item.updated_date)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-mono font-bold text-emerald-400">+${item.amount?.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">USDT</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
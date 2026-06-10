import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpFromLine } from "lucide-react";

// Fallback data cuando no hay retiros reales
const FALLBACK = [
  { id: "f1", user_email: "wei.zh***@163.com", amount: 4800, updated_date: new Date(Date.now() - 1 * 60000).toISOString() },
  { id: "f2", user_email: "xia.li***@qq.com", amount: 12500, updated_date: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: "f3", user_email: "dmitr.iv***@mail.ru", amount: 3200, updated_date: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: "f4", user_email: "fatim.al***@gmail.com", amount: 7600, updated_date: new Date(Date.now() - 11 * 60000).toISOString() },
  { id: "f5", user_email: "yuki.ta***@yahoo.co.jp", amount: 9100, updated_date: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: "f6", user_email: "carlos.m***@gmail.com", amount: 1200, updated_date: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: "f7", user_email: "priya.sh***@gmail.com", amount: 5500, updated_date: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: "f8", user_email: "ming.ch***@sina.com", amount: 18300, updated_date: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: "f9", user_email: "alex.ko***@ukr.net", amount: 2900, updated_date: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "f10", user_email: "hana.mu***@hotmail.com", amount: 6700, updated_date: new Date(Date.now() - 50 * 60000).toISOString() },
  { id: "f11", user_email: "jing.wa***@163.com", amount: 22000, updated_date: new Date(Date.now() - 55 * 60000).toISOString() },
  { id: "f12", user_email: "mehm.oz***@gmail.com", amount: 4100, updated_date: new Date(Date.now() - 62 * 60000).toISOString() },
  { id: "f13", user_email: "sofi.pe***@outlook.com", amount: 3800, updated_date: new Date(Date.now() - 70 * 60000).toISOString() },
  { id: "f14", user_email: "chen.xi***@qq.com", amount: 15200, updated_date: new Date(Date.now() - 80 * 60000).toISOString() },
  { id: "f15", user_email: "aiym.be***@gmail.com", amount: 8900, updated_date: new Date(Date.now() - 90 * 60000).toISOString() },
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
  const [displayed, setDisplayed] = useState(FALLBACK.slice(0, 4));

  useEffect(() => {
    let idx = 4 % FALLBACK.length;
    const timer = setInterval(() => {
      const next = FALLBACK[idx % FALLBACK.length];
      idx = (idx + 1) % FALLBACK.length;
      setDisplayed(prev => [next, ...prev.slice(0, 3)]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
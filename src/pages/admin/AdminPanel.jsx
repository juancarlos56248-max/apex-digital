import { useState } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowDownToLine, ArrowUpFromLine, Users, Wallet,
  TrendingDown, Mail, Megaphone, ChevronRight
} from "lucide-react";
import DepositManager from "../../components/admin/DepositManager";
import WithdrawalManager from "../../components/admin/WithdrawalManager";
import UserConsole from "../../components/admin/UserConsole";
import AnnouncementManager from "../../components/admin/AnnouncementManager";
import BalanceManager from "../../components/admin/BalanceManager";
import MarketCrashManager from "../../components/admin/MarketCrashManager";
import EmailMasivoManager from "../../components/admin/EmailMasivoManager";

const SECTIONS = [
  {
    group: "Finanzas",
    items: [
      { id: "deposits", label: "Depósitos", icon: ArrowDownToLine },
      { id: "withdrawals", label: "Retiros", icon: ArrowUpFromLine },
      { id: "balances", label: "Saldos", icon: Wallet },
    ],
  },
  {
    group: "Usuarios",
    items: [
      { id: "users", label: "Consola de Usuarios", icon: Users },
    ],
  },
  {
    group: "Comunicación",
    items: [
      { id: "announcements", label: "Anuncios", icon: Megaphone },
      { id: "email", label: "Email Masivo", icon: Mail },
    ],
  },
  {
    group: "Mercado",
    items: [
      { id: "market", label: "Control de Mercado", icon: TrendingDown, danger: true },
    ],
  },
];

const CONTENT_MAP = {
  deposits: <DepositManager />,
  withdrawals: <WithdrawalManager />,
  balances: <BalanceManager />,
  users: <UserConsole />,
  announcements: <AnnouncementManager />,
  email: <EmailMasivoManager />,
  market: <MarketCrashManager />,
};

const TITLES = {
  deposits: { label: "Depósitos", icon: ArrowDownToLine },
  withdrawals: { label: "Retiros", icon: ArrowUpFromLine },
  balances: { label: "Saldos", icon: Wallet },
  users: { label: "Consola de Usuarios", icon: Users },
  announcements: { label: "Anuncios", icon: Megaphone },
  email: { label: "Email Masivo", icon: Mail },
  market: { label: "Control de Mercado", icon: TrendingDown, danger: true },
};

export default function AdminPanel() {
  const { user } = useOutletContext();
  const [active, setActive] = useState(null);

  if (!user) return null;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  const current = active ? TITLES[active] : null;
  const CurrentIcon = current?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Back-Office de control operativo</p>
          </div>
        </div>
      </motion.div>

      {/* Layout dos columnas */}
      <div className="flex gap-5 items-start">
        {/* Sidebar nav */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card overflow-hidden w-52 flex-shrink-0"
        >
          {SECTIONS.map((section) => (
            <div key={section.group}>
              <p className="px-4 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {section.group}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(isActive ? null : item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all
                      ${isActive
                        ? item.danger
                          ? "bg-destructive/10 text-destructive"
                          : "bg-gold/10 text-gold"
                        : item.danger
                          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? "rotate-90 opacity-80" : "opacity-40"}`} />
                  </button>
                );
              })}
              <div className="border-b border-border/50 mx-4 last:hidden" />
            </div>
          ))}
        </motion.div>

        {/* Contenido inline */}
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2 mb-3">
              {CurrentIcon && (
                <CurrentIcon className={`w-4 h-4 ${current?.danger ? "text-destructive" : "text-gold"}`} />
              )}
              <h2 className="text-sm font-semibold">{current?.label}</h2>
            </div>
            {CONTENT_MAP[active]}
          </motion.div>
        )}
      </div>
    </div>
  );
}
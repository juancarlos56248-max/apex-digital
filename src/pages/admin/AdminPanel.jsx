import { useState } from "react";
import { useOutletContext, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowDownToLine, ArrowUpFromLine, Users, Wallet,
  TrendingDown, Mail, Megaphone, ChevronRight, MessageCircle, X, BarChart2, ClipboardList, Activity
} from "lucide-react";
import DepositManager from "../../components/admin/DepositManager";
import WithdrawalManager from "../../components/admin/WithdrawalManager";
import UserConsole from "../../components/admin/UserConsole";
import AnnouncementManager from "../../components/admin/AnnouncementManager";
import BalanceManager from "../../components/admin/BalanceManager";
import MarketCrashManager from "../../components/admin/MarketCrashManager";
import EmailMasivoManager from "../../components/admin/EmailMasivoManager";
import SupportManager from "../../components/admin/SupportManager";
import TradingManager from "../../components/admin/TradingManager";
import AdminLogViewer from "../../components/admin/AdminLogViewer";
import NodeProgressManager from "../../components/admin/NodeProgressManager";
import UserTierRangeManager from "../../components/admin/UserTierRangeManager";

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
      { id: "nodes", label: "Progreso de Nodos", icon: Activity },
      { id: "tierranges", label: "Rangos por Usuario", icon: Wallet },
    ],
  },
  {
    group: "Comunicación",
    items: [
      { id: "announcements", label: "Anuncios", icon: Megaphone },
      { id: "email", label: "Email Masivo", icon: Mail },
      { id: "support", label: "Soporte", icon: MessageCircle },
    ],
  },
  {
    group: "Trading",
    items: [
      { id: "trading", label: "Control de Trading", icon: BarChart2 },
      { id: "adminlog", label: "Bitácora de Ajustes", icon: ClipboardList },
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
  deposits: DepositManager,
  withdrawals: WithdrawalManager,
  balances: BalanceManager,
  users: UserConsole,
  announcements: AnnouncementManager,
  email: EmailMasivoManager,
  support: SupportManager,
  trading: TradingManager,
  market: MarketCrashManager,
  adminlog: AdminLogViewer,
  nodes: NodeProgressManager,
  tierranges: UserTierRangeManager,
};

const TITLES = {
  deposits: { label: "Depósitos", icon: ArrowDownToLine },
  withdrawals: { label: "Retiros", icon: ArrowUpFromLine },
  balances: { label: "Saldos", icon: Wallet },
  users: { label: "Consola de Usuarios", icon: Users },
  announcements: { label: "Anuncios", icon: Megaphone },
  email: { label: "Email Masivo", icon: Mail },
  support: { label: "Soporte", icon: MessageCircle },
  trading: { label: "Control de Trading", icon: BarChart2 },
  market: { label: "Control de Mercado", icon: TrendingDown, danger: true },
  adminlog: { label: "Bitácora de Ajustes", icon: ClipboardList },
  nodes: { label: "Progreso de Nodos", icon: Activity },
  tierranges: { label: "Rangos por Usuario", icon: Wallet },
};

export default function AdminPanel() {
  const { user } = useOutletContext();
  const location = useLocation();
  const [active, setActive] = useState(location.state?.section || null);

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

      {/* Menu grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-5"
      >
        {SECTIONS.map((section) => (
          <div key={section.group}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">
              {section.group}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl border bg-card transition-all text-left group
                      ${item.danger
                        ? "border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                        : "border-border hover:bg-secondary/60 hover:border-gold/30"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                        ${item.danger ? "bg-destructive/10" : "bg-gold/10"}`}>
                        <Icon className={`w-4 h-4 ${item.danger ? "text-destructive" : "text-gold"}`} />
                      </div>
                      <span className={`text-sm font-semibold ${item.danger ? "text-destructive" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Full-screen modal */}
      <AnimatePresence>
        {active && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-background rounded-t-2xl border-t border-border overflow-hidden pb-safe"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card flex-shrink-0">
                <div className="flex items-center gap-3">
                  {CurrentIcon && (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${current?.danger ? "bg-destructive/10" : "bg-gold/10"}`}>
                      <CurrentIcon className={`w-4 h-4 ${current?.danger ? "text-destructive" : "text-gold"}`} />
                    </div>
                  )}
                  <h2 className="text-base font-bold">{current?.label}</h2>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal content */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 pb-24">
                {active && (() => { const C = CONTENT_MAP[active]; return C ? <C /> : null; })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
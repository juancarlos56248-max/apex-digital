import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, 
  Users, Shield, X, LogOut, ChevronRight, MessageSquare, Headphones, Trash2, BarChart2, Zap, CreditCard
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/investments", label: "Inversiones", icon: TrendingUp },
  { path: "/sesion-especial", label: "Sesión Especial", icon: Zap, highlight: true },
  { path: "/trading", label: "Trading", icon: BarChart2 },
  { path: "/tarjeta", label: "Billetera Digital", icon: CreditCard },
  { path: "/deposit", label: "Depósito", icon: ArrowDownToLine },
  { path: "/withdraw", label: "Retiro", icon: ArrowUpFromLine },
  { path: "/referrals", label: "Referidos", icon: Users },
  { path: "/comunidad", label: "Comunidad", icon: MessageSquare },
  { path: "/soporte", label: "Atención al Cliente", icon: Headphones },
];

const adminItems = [
  { path: "/admin", label: "Panel Admin", icon: Shield },
];

export default function Sidebar({ open, onClose, user }) {
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-72 bg-sidebar/90 backdrop-blur-xl border-r border-gold/15
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
              <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-gold font-bold text-lg tracking-tight">APEX</h1>
                <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Digital Assets</p>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-3 mb-3">Principal</p>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : item.highlight ? "text-primary hover:text-foreground hover:bg-primary/10 border border-primary/15 bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-3">Administración</p>
                </div>
                {adminItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${active 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || "Usuario"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => base44.auth.logout()}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Delete Account */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar cuenta
              </button>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                <p className="text-xs text-destructive font-medium">¿Eliminar cuenta permanentemente?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 text-xs py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await base44.auth.updateMe({ deleted: true, deleted_at: new Date().toISOString() });
                      } catch(_) {}
                      base44.auth.logout();
                    }}
                    className="flex-1 text-xs py-1.5 rounded-md bg-destructive text-white font-semibold hover:bg-destructive/90 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
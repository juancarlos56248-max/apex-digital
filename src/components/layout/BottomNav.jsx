import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Zap, CreditCard } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { path: "/investments", label: "Nodos", icon: TrendingUp },
  { path: "/sesion-especial", label: "🚨 Sesión", icon: Zap, highlight: true },
  { path: "/deposit", label: "Depósito", icon: ArrowDownToLine },
  { path: "/tarjeta", label: "Billetera", icon: CreditCard },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} className="fixed inset-x-0 bottom-0 z-[9999] border-t border-gold/20 bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active ? "border border-gold/20 bg-gold/10 text-gold shadow-[0_0_18px_hsl(var(--gold)/0.08)]" : item.highlight ? "text-amber-400" : "border border-transparent text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-gold" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
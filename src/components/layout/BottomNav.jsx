import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Users, LineChart } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { path: "/investments", label: "Nodos", icon: TrendingUp },
  { path: "/market", label: "Mercado", icon: LineChart },
  { path: "/deposit", label: "Depósito", icon: ArrowDownToLine },
  { path: "/withdraw", label: "Retiro", icon: ArrowUpFromLine },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border" style={{paddingBottom: 'env(safe-area-inset-bottom, 0px)'}}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active ? "text-gold" : "text-muted-foreground"
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
import { ChevronLeft, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationMenu from "@/components/layout/NotificationMenu";
import UserMenu from "@/components/layout/UserMenu";

const pages = { "/dashboard": ["Dashboard", "Resumen financiero"], "/investments": ["Inversiones", "Gestión de capital"], "/trading": ["Trading", "Terminal financiera"], "/deposit": ["Depósitos", "Añadir fondos"], "/withdraw": ["Retiros", "Retirar fondos"], "/referrals": ["Referidos", "Comisiones y actividad"], "/comunidad": ["Comunidad", "Actividad de inversores"], "/soporte": ["Soporte", "Centro de ayuda"], "/sesion-especial": ["Oportunidad Activa", "Participación temporal"], "/tarjeta": ["Billetera Digital", "Cuenta y tarjeta"], "/admin": ["Administración", "Control operativo"] };

export default function AppHeader({ user, onMenu, isRootTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, description] = pages[location.pathname] || ["APEX", "Plataforma financiera"];
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={isRootTab ? onMenu : () => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground lg:hidden">{isRootTab ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button>
        <div><h1 className="text-sm font-semibold md:text-base">{title}</h1><p className="hidden text-xs text-muted-foreground sm:block">{description}</p></div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <select aria-label="Idioma" defaultValue="es" className="h-9 rounded-lg border border-border bg-secondary px-2 text-xs text-muted-foreground outline-none focus:border-primary/50"><option value="es">ES</option></select>
        <NotificationMenu />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
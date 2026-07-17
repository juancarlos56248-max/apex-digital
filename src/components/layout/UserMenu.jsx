import { useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-2 py-1.5 transition-colors hover:border-primary/30">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">{user?.full_name?.charAt(0) || "U"}</span>
        <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{user?.full_name || "Usuario"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-popover p-2 shadow-xl">
          <div className="border-b border-border px-3 py-2"><p className="truncate text-xs font-medium">{user?.full_name}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email}</p></div>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground"><User className="h-4 w-4" /> Cuenta verificada</div>
          <button onClick={() => base44.auth.logout()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
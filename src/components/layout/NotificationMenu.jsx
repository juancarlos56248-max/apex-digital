import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Notificaciones" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
        <Bell className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-border bg-popover p-4 shadow-xl">
          <p className="text-sm font-semibold">Notificaciones</p>
          <p className="mt-3 rounded-lg bg-secondary p-4 text-center text-xs text-muted-foreground">No hay notificaciones nuevas</p>
        </div>
      )}
    </div>
  );
}
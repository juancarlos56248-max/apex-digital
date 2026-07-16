import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCcw, Crown, Trash2, CreditCard, Phone } from "lucide-react";
import moment from "moment";

export default function UserConsole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminListarUsuarios', {});
      const all = (res.data?.users || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setUsers(all);
    } catch {
      toast.error("Error al cargar usuarios");
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    await base44.entities.User.update(userId, { role: newRole });
    toast.success("Nivel de acceso actualizado");
    loadUsers();
  };

  const handleDeleteInactive = async () => {
    if (!window.confirm("¿Eliminar todos los usuarios sin actividad (balance $0, sin transacciones ni inversiones)? Esta acción es irreversible.")) return;

    setLoading(true);
    try {
      // Obtener todos los usuarios con balance $0
      const candidates = users.filter(u => u.role !== "admin" && !(u.balance > 0));

      // Verificar cuáles tienen transacciones o inversiones
      const inactive = [];
      await Promise.all(candidates.map(async (u) => {
        const [txs, invs] = await Promise.all([
          base44.entities.Transaction.filter({ user_email: u.email }),
          base44.entities.Investment.filter({ user_email: u.email }),
        ]);
        if (txs.length === 0 && invs.length === 0) inactive.push(u.id);
      }));

      if (inactive.length === 0) {
        toast.info("No se encontraron usuarios inactivos.");
        setLoading(false);
        return;
      }

      await Promise.all(inactive.map(id => base44.entities.User.delete(id)));
      toast.success(`${inactive.length} usuario(s) inactivo(s) eliminado(s).`);
      loadUsers();
    } catch {
      toast.error("Error al eliminar usuarios inactivos.");
      setLoading(false);
    }
  };

  const filtered = users.filter(u => 
    !search || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Consola de Usuarios ({users.length})</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-secondary border-border"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={loadUsers} className="gap-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteInactive} className="gap-1.5 text-xs">
            <Trash2 className="w-3 h-3" /> Limpiar inactivos
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">DNI / Teléfono</th>
              <th className="px-4 py-3 text-left">Balance</th>
              <th className="px-4 py-3 text-left">Invertido</th>
              <th className="px-4 py-3 text-left">Ganado</th>
              <th className="px-4 py-3 text-left">Registro</th>
              <th className="px-4 py-3 text-left">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      {u.full_name || "Sin nombre"}
                      {u.role === "vip" && <Crown className="w-3 h-3 text-gold" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.dni ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-mono flex items-center gap-1"><CreditCard className="w-3 h-3 text-muted-foreground" />{u.dni}</p>
                      {u.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</p>}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-sm">${(u.balance || 0).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm">${(u.total_invested || 0).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-success">${(u.total_earned || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{moment(u.created_date).format("DD/MM/YYYY")}</td>
                <td className="px-4 py-3">
                  <Select value={u.role || "user"} onValueChange={(val) => handleRoleChange(u.id, val)}>
                    <SelectTrigger className="h-7 text-xs bg-secondary border-border w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
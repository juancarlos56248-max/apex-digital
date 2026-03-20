import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCcw, Crown } from "lucide-react";
import moment from "moment";

export default function UserConsole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const all = await base44.entities.User.list("-created_date", 100);
    setUsers(all);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    await base44.entities.User.update(userId, { role: newRole });
    toast.success("Nivel de acceso actualizado");
    loadUsers();
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Usuario</th>
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
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
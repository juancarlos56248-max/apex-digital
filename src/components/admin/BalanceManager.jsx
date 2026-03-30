import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, DollarSign, RefreshCw, Check } from "lucide-react";

export default function BalanceManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // { userId, field, value }
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.User.list("-created_date", 100);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (userId, field, currentValue) => {
    setEditing({ userId, field, value: String(currentValue || 0) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(editing.userId + editing.field);
    const newVal = parseFloat(editing.value);
    if (isNaN(newVal)) { toast.error("Valor inválido"); setSaving(null); return; }
    await base44.asServiceRole.entities.User.update(editing.userId, { [editing.field]: newVal });
    toast.success("Saldo actualizado");
    setEditing(null);
    setSaving(null);
    load();
  };

  const EditableCell = ({ user, field, label }) => {
    const isEditing = editing?.userId === user.id && editing?.field === field;
    const isSaving = saving === user.id + field;
    return (
      <div className="flex items-center gap-1.5">
        {isEditing ? (
          <>
            <Input
              type="number"
              value={editing.value}
              onChange={e => setEditing(prev => ({ ...prev, value: e.target.value }))}
              className="h-7 w-28 text-xs bg-secondary border-gold/30 font-mono"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
            />
            <Button size="icon" className="h-7 w-7 bg-gold hover:bg-gold-dark text-black" onClick={saveEdit} disabled={isSaving}>
              <Check className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <button
            onClick={() => startEdit(user.id, field, user[field])}
            className="font-mono text-xs text-gold hover:text-gold-light underline decoration-dashed underline-offset-2 transition-colors"
          >
            ${(user[field] || 0).toFixed(2)}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm bg-secondary border-border"
          />
        </div>
        <Button size="sm" variant="outline" onClick={load} className="h-8 gap-1.5 border-border">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-secondary/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <span>Usuario</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Balance</span>
          <span>Total Invertido</span>
          <span>Total Ganado</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">Sin resultados</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(u => (
              <div key={u.id} className="grid grid-cols-4 gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium truncate">{u.full_name || "—"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <EditableCell user={u} field="balance" label="Balance" />
                <EditableCell user={u} field="total_invested" label="Total Invertido" />
                <EditableCell user={u} field="total_earned" label="Total Ganado" />
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">Haz clic en cualquier valor para editarlo.</p>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, RefreshCw, Check, Zap, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";

const TIERS = [
  { key: "prueba", label: "Prueba ($5)", amount: 5 },
  { key: "starter", label: "Starter", amount: null },
  { key: "advance", label: "Advance", amount: null },
  { key: "elite", label: "Elite", amount: null },
  { key: "institutional", label: "Institutional", amount: null },
];

export default function BalanceManager() {
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState({}); // { email: [inv, ...] }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(null); // user id expanded for node activation
  const [nodeForm, setNodeForm] = useState({}); // { [userId]: { tier, amount } }
  const [activating, setActivating] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.User.list("-created_date", 200);
    setUsers(data);
    // Load all investments grouped by email
    const allInvs = await base44.entities.Investment.list("-created_date", 500);
    const grouped = {};
    allInvs.forEach(inv => {
      if (!grouped[inv.user_email]) grouped[inv.user_email] = [];
      grouped[inv.user_email].push(inv);
    });
    setInvestments(grouped);
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

  const activateNode = async (user) => {
    const form = nodeForm[user.id] || {};
    const tier = form.tier || "starter";
    const tierConfig = TIERS.find(t => t.key === tier);
    const amount = tierConfig?.amount ?? parseFloat(form.amount || 0);
    if (!amount || isNaN(amount) || amount <= 0) { toast.error("Monto inválido"); return; }

    setActivating(user.id);
    try {
      await base44.asServiceRole.entities.Investment.create({
        user_email: user.email,
        tier,
        amount,
        status: "active",
        total_earned: 0,
        last_dividend_date: new Date().toISOString(),
      });
      toast.success(`Nodo ${tier.toUpperCase()} activado para ${user.full_name || user.email}`);
      setExpanded(null);
      load();
    } catch {
      toast.error("Error al activar nodo");
    }
    setActivating(null);
  };

  const EditableCell = ({ user, field }) => {
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

  const NodeForm = ({ user }) => {
    const form = nodeForm[user.id] || {};
    const tier = form.tier || "starter";
    const tierConfig = TIERS.find(t => t.key === tier);
    const isPrueba = tier === "prueba";
    return (
      <div className="flex flex-wrap items-center gap-2 mt-2 p-3 rounded-xl border border-gold/20 bg-gold/5">
        <Select value={tier} onValueChange={val => setNodeForm(prev => ({ ...prev, [user.id]: { ...prev[user.id], tier: val, amount: "" } }))}>
          <SelectTrigger className="h-7 text-xs bg-secondary border-border w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {isPrueba ? (
          <span className="text-xs font-mono text-gold">$5.00 USDT (fijo)</span>
        ) : (
          <Input
            type="number"
            placeholder="Monto USDT"
            value={form.amount || ""}
            onChange={e => setNodeForm(prev => ({ ...prev, [user.id]: { ...prev[user.id], amount: e.target.value } }))}
            className="h-7 w-32 text-xs bg-secondary border-gold/30 font-mono"
          />
        )}
        <Button size="sm" className="h-7 text-xs bg-gold hover:bg-gold-dark text-black gap-1" onClick={() => activateNode(user)} disabled={activating === user.id}>
          <Zap className="w-3 h-3" /> {activating === user.id ? "Activando..." : "Activar"}
        </Button>
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
        {/* Header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-secondary/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <span>Usuario</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Balance</span>
          <span>Invertido</span>
          <span>Ganado</span>
          <span>Acciones</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">Sin resultados</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(u => {
              const userInvs = investments[u.email] || [];
              const hasPrueba = userInvs.some(i => i.tier === "prueba");
              const activeNodes = userInvs.filter(i => i.status === "active");
              const isExpanded = expanded === u.id;
              return (
                <div key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <div className="grid grid-cols-5 gap-2 px-4 py-3 items-center">
                    <div>
                      <p className="text-sm font-medium truncate">{u.full_name || "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                      {/* Plan prueba badge */}
                      {hasPrueba ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                          <FlaskConical className="w-2.5 h-2.5" /> Plan prueba activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border mt-0.5">
                          <FlaskConical className="w-2.5 h-2.5" /> Sin plan prueba
                        </span>
                      )}
                    </div>
                    <EditableCell user={u} field="balance" />
                    <EditableCell user={u} field="total_invested" />
                    <EditableCell user={u} field="total_earned" />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-gold/30 text-gold hover:bg-gold/10"
                        onClick={() => setExpanded(isExpanded ? null : u.id)}
                      >
                        <Zap className="w-3 h-3" /> Nodo
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                      {activeNodes.length > 0 && (
                        <span className="text-[10px] text-muted-foreground text-center">{activeNodes.length} nodo(s) activo(s)</span>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3">
                      <NodeForm user={u} />
                      {activeNodes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {activeNodes.map(inv => (
                            <div key={inv.id} className="flex items-center gap-2 text-[11px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary/40 border border-border/50">
                              <span className="uppercase font-bold text-gold">{inv.tier}</span>
                              <span className="font-mono">${inv.amount.toFixed(2)}</span>
                              <span className="text-success">+${(inv.total_earned || 0).toFixed(2)} ganado</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">Haz clic en cualquier valor para editarlo. Usa el botón "Nodo" para activar inversiones directamente.</p>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, DollarSign, RefreshCw, Zap, ChevronDown, ChevronUp, FlaskConical, Pencil, Plus, Minus, Replace } from "lucide-react";

const TIERS = [
  { key: "prueba", label: "Prueba ($5)", amount: 5 },
  { key: "starter", label: "Starter", amount: null },
  { key: "advance", label: "Advance", amount: null },
  { key: "elite", label: "Elite", amount: null },
  { key: "institutional", label: "Institutional", amount: null },
];

const FIELDS = [
  { key: "balance", label: "Balance disponible" },
  { key: "total_invested", label: "Total invertido" },
  { key: "total_earned", label: "Total ganado" },
];

export default function BalanceManager() {
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal
  const [editModal, setEditModal] = useState(null); // { user, field }
  const [editMode, setEditMode] = useState("add"); // "add" | "subtract" | "replace"
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Node activation
  const [expanded, setExpanded] = useState(null);
  const [nodeForm, setNodeForm] = useState({});
  const [activating, setActivating] = useState(null);

  const load = async () => {
    setLoading(true);
    const [data, allInvs] = await Promise.all([
      base44.entities.User.list("-created_date", 200),
      base44.entities.Investment.list("-created_date", 500),
    ]);
    setUsers(data);
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

  const openEdit = (user, field) => {
    setEditModal({ user, field });
    setEditMode("add");
    setEditAmount("");
  };

  const computeNew = () => {
    const current = parseFloat(editModal?.user?.[editModal?.field] || 0);
    const val = parseFloat(editAmount);
    if (isNaN(val)) return null;
    if (editMode === "add") return parseFloat((current + val).toFixed(2));
    if (editMode === "subtract") return parseFloat((current - val).toFixed(2));
    if (editMode === "replace") return parseFloat(val.toFixed(2));
    return null;
  };

  const saveEdit = async () => {
    const newVal = computeNew();
    if (newVal === null) { toast.error("Ingresa un monto válido"); return; }
    setSaving(true);
    await base44.asServiceRole.entities.User.update(editModal.user.id, { [editModal.field]: newVal });
    // Update local state instantly
    setUsers(prev => prev.map(u => u.id === editModal.user.id ? { ...u, [editModal.field]: newVal } : u));
    toast.success(`${FIELDS.find(f => f.key === editModal.field)?.label} → $${newVal.toFixed(2)}`);
    setSaving(false);
    setEditModal(null);
  };

  const cancelNode = async (inv) => {
    await base44.asServiceRole.entities.Investment.update(inv.id, { status: "cancelled" });
    setInvestments(prev => ({
      ...prev,
      [inv.user_email]: prev[inv.user_email].map(i => i.id === inv.id ? { ...i, status: "cancelled" } : i),
    }));
    toast.success("Nodo cancelado");
  };

  const activateNode = async (user) => {
    const form = nodeForm[user.id] || {};
    const tier = form.tier || "starter";
    const tierConfig = TIERS.find(t => t.key === tier);
    const amount = tierConfig?.amount ?? parseFloat(form.amount || 0);
    if (!amount || isNaN(amount) || amount <= 0) { toast.error("Monto inválido"); return; }
    setActivating(user.id);
    try {
      const newInv = await base44.asServiceRole.entities.Investment.create({
        user_email: user.email,
        tier,
        amount,
        status: "active",
        total_earned: 0,
        last_dividend_date: new Date().toISOString(),
      });
      // Update local state instantly — no full reload
      setInvestments(prev => ({
        ...prev,
        [user.email]: [...(prev[user.email] || []), newInv],
      }));
      setExpanded(null);
      setNodeForm(prev => ({ ...prev, [user.id]: {} }));
      toast.success(`Nodo ${tier.toUpperCase()} activado ✓`);
    } catch {
      toast.error("Error al activar nodo");
    }
    setActivating(null);
  };

  const previewNew = computeNew();
  const currentVal = parseFloat(editModal?.user?.[editModal?.field] || 0);

  return (
    <div className="space-y-4">
      {/* Search + refresh */}
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

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
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
              const form = nodeForm[u.id] || {};
              const tier = form.tier || "starter";
              const isPrueba = tier === "prueba";

              return (
                <div key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <div className="grid grid-cols-5 gap-2 px-4 py-3 items-center">
                    {/* Name + badge */}
                    <div>
                      <p className="text-sm font-medium truncate">{u.full_name || "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                      {hasPrueba ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                          <FlaskConical className="w-2.5 h-2.5" /> Plan prueba ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border mt-0.5">
                          <FlaskConical className="w-2.5 h-2.5" /> Sin prueba
                        </span>
                      )}
                    </div>

                    {/* Balance */}
                    <button onClick={() => openEdit(u, "balance")} className="flex items-center gap-1.5 group text-left">
                      <span className="font-mono text-sm text-gold group-hover:text-gold-light transition-colors">${(u.balance || 0).toFixed(2)}</span>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Invested */}
                    <button onClick={() => openEdit(u, "total_invested")} className="flex items-center gap-1.5 group text-left">
                      <span className="font-mono text-sm group-hover:text-gold transition-colors">${(u.total_invested || 0).toFixed(2)}</span>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Earned */}
                    <button onClick={() => openEdit(u, "total_earned")} className="flex items-center gap-1.5 group text-left">
                      <span className="font-mono text-sm text-success group-hover:opacity-80 transition-opacity">${(u.total_earned || 0).toFixed(2)}</span>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Node button */}
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-gold/30 text-gold hover:bg-gold/10"
                        onClick={() => setExpanded(isExpanded ? null : u.id)}>
                        <Zap className="w-3 h-3" /> Nodo
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                      {activeNodes.length > 0 && (
                        <span className="text-[10px] text-muted-foreground text-center">{activeNodes.length} activo(s)</span>
                      )}
                    </div>
                  </div>

                  {/* Node expand panel */}
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-gold/20 bg-gold/5">
                        <Select value={tier} onValueChange={val => setNodeForm(prev => ({ ...prev, [u.id]: { ...prev[u.id], tier: val, amount: "" } }))}>
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
                            onChange={e => setNodeForm(prev => ({ ...prev, [u.id]: { ...prev[u.id], amount: e.target.value } }))}
                            className="h-7 w-32 text-xs bg-secondary border-gold/30 font-mono"
                          />
                        )}
                        <Button size="sm" className="h-7 text-xs bg-gold hover:bg-gold-dark text-black gap-1"
                          onClick={() => activateNode(u)} disabled={activating === u.id}>
                          <Zap className="w-3 h-3" /> {activating === u.id ? "Activando..." : "Activar"}
                        </Button>
                      </div>
                      {activeNodes.length > 0 && (
                        <div className="space-y-1">
                          {activeNodes.map(inv => (
                            <div key={inv.id} className="flex items-center gap-2 text-[11px] px-2 py-1 rounded-lg bg-secondary/40 border border-border/50">
                              <span className="uppercase font-bold text-gold">{inv.tier}</span>
                              <span className="font-mono">${inv.amount.toFixed(2)}</span>
                              <span className="text-success">+${(inv.total_earned || 0).toFixed(2)}</span>
                              <button
                                onClick={() => cancelNode(inv)}
                                className="ml-auto text-destructive hover:text-red-400 transition-colors text-[10px] font-semibold border border-destructive/30 rounded px-1.5 py-0.5"
                              >
                                Bloquear
                              </button>
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

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-gold" />
              Modificar {FIELDS.find(f => f.key === editModal?.field)?.label}
            </DialogTitle>
          </DialogHeader>

          {editModal && (
            <div className="space-y-4 py-1">
              {/* User info */}
              <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
                <p className="text-sm font-medium">{editModal.user.full_name || editModal.user.email}</p>
                <p className="text-[11px] text-muted-foreground">
                  Valor actual: <span className="font-mono text-gold font-bold">${currentVal.toFixed(2)} USDT</span>
                </p>
              </div>

              {/* Mode selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "add", label: "Sumar", icon: Plus, color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" },
                  { key: "subtract", label: "Restar", icon: Minus, color: "border-red-500/50 bg-red-500/10 text-red-400" },
                  { key: "replace", label: "Reemplazar", icon: Replace, color: "border-gold/50 bg-gold/10 text-gold" },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => { setEditMode(key); setEditAmount(""); }}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-all ${editMode === key ? color : "border-border text-muted-foreground hover:border-border/80"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {editMode === "add" ? "Monto a sumar" : editMode === "subtract" ? "Monto a restar" : "Nuevo valor"}
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="font-mono text-base bg-secondary border-border"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && saveEdit()}
                />
              </div>

              {/* Preview */}
              {previewNew !== null && (
                <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
                  <span className="text-xs text-muted-foreground">Resultado</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground line-through">${currentVal.toFixed(2)}</span>
                    <span className="text-gold font-black font-mono text-lg">${previewNew.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1">Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving || previewNew === null} className="flex-1 bg-gold hover:bg-gold-dark text-black font-bold">
              {saving ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-[11px] text-muted-foreground">Haz clic en cualquier valor para editarlo.</p>
    </div>
  );
}
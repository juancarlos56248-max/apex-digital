import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Save, RotateCcw } from "lucide-react";

const TIERS = [
  { key: "starter",     label: "Starter",     defaultMin: 10,    defaultMax: 499   },
  { key: "advance",     label: "Advance",     defaultMin: 500,   defaultMax: 1999  },
  { key: "elite",       label: "Elite",       defaultMin: 2000,  defaultMax: 9999  },
  { key: "institutional", label: "Institutional", defaultMin: 10000, defaultMax: null },
];

function TierRangeRow({ tierKey, label, defaultMin, defaultMax, value, onChange }) {
  const min = value?.min ?? defaultMin;
  const max = value?.max ?? defaultMax;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1 flex-1">
        <span className="text-[10px] text-muted-foreground">$</span>
        <Input
          type="number"
          value={min}
          onChange={(e) => onChange(tierKey, "min", e.target.value)}
          className="h-7 text-xs bg-secondary border-border font-mono w-24"
          placeholder="Min"
        />
        <span className="text-[10px] text-muted-foreground">–</span>
        <Input
          type="number"
          value={max ?? ""}
          onChange={(e) => onChange(tierKey, "max", e.target.value)}
          className="h-7 text-xs bg-secondary border-border font-mono w-24"
          placeholder="Sin límite"
        />
        <span className="text-[10px] text-muted-foreground">USDT</span>
      </div>
    </div>
  );
}

export default function UserTierRangeManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.User.list("-created_date", 100).then((all) => {
      setUsers(all);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getDraft = (userId, currentRanges) => {
    if (drafts[userId]) return drafts[userId];
    const base = {};
    TIERS.forEach(t => {
      base[t.key] = {
        min: currentRanges?.[t.key]?.min ?? t.defaultMin,
        max: currentRanges?.[t.key]?.max ?? t.defaultMax,
      };
    });
    return base;
  };

  const handleChange = (userId, tierKey, field, val) => {
    setDrafts(prev => ({
      ...prev,
      [userId]: {
        ...getDraft(userId, users.find(u => u.id === userId)?.tier_ranges),
        [tierKey]: {
          ...getDraft(userId, users.find(u => u.id === userId)?.tier_ranges)[tierKey],
          [field]: val === "" ? null : parseFloat(val),
        },
      },
    }));
  };

  const handleReset = (userId) => {
    const base = {};
    TIERS.forEach(t => { base[t.key] = { min: t.defaultMin, max: t.defaultMax }; });
    setDrafts(prev => ({ ...prev, [userId]: base }));
  };

  const handleSave = async (user) => {
    setSaving(user.id);
    const ranges = drafts[user.id] || getDraft(user.id, user.tier_ranges);
    await base44.entities.User.update(user.id, { tier_ranges: ranges });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, tier_ranges: ranges } : u));
    toast.success(`Rangos actualizados para ${user.full_name || user.email}`);
    setSaving(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((u) => {
          const isOpen = expanded === u.id;
          const draft = getDraft(u.id, u.tier_ranges);
          const hasCustom = !!u.tier_ranges;

          return (
            <div key={u.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : u.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div>
                    <p className="text-sm font-medium">{u.full_name || "Sin nombre"}</p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                  {hasCustom && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold/10 text-gold border border-gold/20 uppercase tracking-wider">
                      Personalizado
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rangos de inversión por plan</p>
                  <div className="space-y-2">
                    {TIERS.map(t => (
                      <TierRangeRow
                        key={t.key}
                        {...t}
                        value={draft[t.key]}
                        onChange={(tierKey, field, val) => handleChange(u.id, tierKey, field, val)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleReset(u.id)}
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar defaults
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs bg-gold hover:bg-gold-dark text-black font-semibold"
                      onClick={() => handleSave(u)}
                      disabled={saving === u.id}
                    >
                      <Save className="w-3 h-3" />
                      {saving === u.id ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
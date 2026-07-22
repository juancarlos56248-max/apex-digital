import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2, RefreshCcw } from "lucide-react";
import moment from "moment";

function genCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "APEX-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const STATUS_COLORS = {
  activo: "bg-success/10 text-success",
  usado: "bg-gold/10 text-gold",
  expirado: "bg-destructive/10 text-destructive",
};

export default function BonoCodigoManager() {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ codigo: genCodigo(), monto_bono: 1000, min_deposito: 300, min_referidos: 3, notas: "" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.BonoCodigo.list("-created_date", 100);
    setCodigos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.codigo.trim()) return toast.error("El código no puede estar vacío");
    setCreating(true);
    try {
      await base44.entities.BonoCodigo.create({
        codigo: form.codigo.trim().toUpperCase(),
        monto_bono: parseFloat(form.monto_bono),
        min_deposito: parseFloat(form.min_deposito),
        min_referidos: parseInt(form.min_referidos),
        notas: form.notas,
        status: "activo",
      });
      toast.success("Código creado");
      setForm({ codigo: genCodigo(), monto_bono: 1000, min_deposito: 300, min_referidos: 3, notas: "" });
      load();
    } catch {
      toast.error("Error al crear código");
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este código?")) return;
    await base44.entities.BonoCodigo.delete(id);
    setCodigos(prev => prev.filter(c => c.id !== id));
    toast.success("Código eliminado");
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Crear código */}
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-3">
        <p className="text-xs font-semibold text-gold uppercase tracking-wider">Crear nuevo código de bono</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 flex gap-2">
            <Input
              value={form.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              className="h-8 text-xs font-mono bg-secondary border-border flex-1"
              placeholder="Código"
            />
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setForm(f => ({ ...f, codigo: genCodigo() }))}>
              <RefreshCcw className="w-3 h-3" />
            </Button>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Monto bono ($)</p>
            <Input type="number" value={form.monto_bono} onChange={e => setForm(f => ({ ...f, monto_bono: e.target.value }))} className="h-8 text-xs bg-secondary border-border" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Depósito mín. ($)</p>
            <Input type="number" value={form.min_deposito} onChange={e => setForm(f => ({ ...f, min_deposito: e.target.value }))} className="h-8 text-xs bg-secondary border-border" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Referidos mín.</p>
            <Input type="number" value={form.min_referidos} onChange={e => setForm(f => ({ ...f, min_referidos: e.target.value }))} className="h-8 text-xs bg-secondary border-border" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Notas</p>
            <Input value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="h-8 text-xs bg-secondary border-border" placeholder="Opcional" />
          </div>
        </div>
        <Button size="sm" className="w-full bg-gold hover:bg-gold-dark text-black font-semibold gap-1.5 text-xs" onClick={handleCreate} disabled={creating}>
          <Plus className="w-3.5 h-3.5" /> {creating ? "Creando..." : "Crear Código"}
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {codigos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No hay códigos creados</p>
        )}
        {codigos.map(c => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-gold">{c.codigo}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[c.status] || ""}`}>{c.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Bono: <span className="text-foreground font-mono">${c.monto_bono}</span> · Dep. mín: <span className="text-foreground font-mono">${c.min_deposito}</span> · Ref. mín: <span className="text-foreground font-mono">{c.min_referidos}</span>
              </p>
              {c.usado_por && <p className="text-[10px] text-gold mt-0.5">Usado por: {c.usado_por}</p>}
              {c.notas && <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{c.notas}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {c.status === "activo" && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(c.codigo)}>
                  <Copy className="w-3 h-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle2, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function generateCode(prefix = "APEX") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix;
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function CodigoEspecialManager() {
  const [codigo, setCodigo] = useState("");
  const [monto, setMonto] = useState(1000);
  const [minDeposito, setMinDeposito] = useState(300);
  const [minReferidos, setMinReferidos] = useState(3);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    setCodigo(generateCode("APEX"));
  };

  const handleCopy = () => {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado al portapapeles");
  };

  const handleSave = async () => {
    if (!codigo.trim()) { setError("Ingresa o genera un código"); return; }
    setSaving(true);
    setError("");
    setSaved(null);
    try {
      const record = await base44.entities.BonoCodigo.create({
        codigo: codigo.trim().toUpperCase(),
        monto_bono: Number(monto),
        min_deposito: Number(minDeposito),
        min_referidos: Number(minReferidos),
        notas: notas.trim(),
        status: "activo",
      });
      setSaved(record);
      toast.success(`✅ Código "${record.codigo}" guardado exitosamente`);
      setCodigo("");
      setNotas("");
    } catch (e) {
      setError(e?.message || "Error al guardar el código");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
        <p className="text-sm font-bold text-gold flex items-center gap-2">
          <Key className="w-4 h-4" /> Generar Código Especial
        </p>
        <p className="text-xs text-muted-foreground">
          Crea un código único para entregar a usuarios. Define el bono, depósito mínimo y referidos requeridos.
        </p>
      </div>

      {/* Código */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Código</Label>
        <div className="flex gap-2">
          <Input
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError(""); }}
            placeholder="Ej: APEX2025X"
            className="font-mono font-bold text-gold tracking-widest"
          />
          <Button variant="outline" size="icon" onClick={handleGenerate} title="Generar aleatorio">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar" disabled={!codigo}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Bono (USDT)</Label>
          <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Depósito mín.</Label>
          <Input type="number" value={minDeposito} onChange={(e) => setMinDeposito(e.target.value)} className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Referidos mín.</Label>
          <Input type="number" value={minReferidos} onChange={(e) => setMinReferidos(e.target.value)} className="font-mono" />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Notas internas (opcional)</Label>
        <Input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: Código para usuario VIP julio 2026"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Código guardado
          </div>
          <div className="font-mono text-2xl font-black text-gold tracking-widest text-center py-2 bg-black/20 rounded-lg">
            {saved.codigo}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="rounded bg-black/20 p-2">
              <p className="text-muted-foreground">Bono</p>
              <p className="font-bold text-gold">${saved.monto_bono} USDT</p>
            </div>
            <div className="rounded bg-black/20 p-2">
              <p className="text-muted-foreground">Dep. mín.</p>
              <p className="font-bold">${saved.min_deposito}</p>
            </div>
            <div className="rounded bg-black/20 p-2">
              <p className="text-muted-foreground">Referidos</p>
              <p className="font-bold">{saved.min_referidos}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { navigator.clipboard.writeText(saved.codigo); toast.success("Copiado"); }}>
            <Copy className="w-3.5 h-3.5" /> Copiar código
          </Button>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || !codigo}
        className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11 text-base gap-2"
      >
        {saving ? "Guardando..." : <><Key className="w-4 h-4" /> Guardar Código</>}
      </Button>
    </div>
  );
}
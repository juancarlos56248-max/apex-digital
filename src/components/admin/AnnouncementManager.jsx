import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";
import moment from "moment";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const data = await base44.entities.Announcement.list("-created_date", 50);
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Completa título y mensaje.");
      return;
    }
    setSubmitting(true);
    await base44.entities.Announcement.create({ title: title.trim(), message: message.trim(), type, active: true });
    toast.success("Anuncio publicado");
    setTitle(""); setMessage(""); setType("info");
    await load();
    setSubmitting(false);
  };

  const toggleActive = async (ann) => {
    await base44.entities.Announcement.update(ann.id, { active: !ann.active });
    await load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Announcement.delete(id);
    toast.success("Anuncio eliminado");
    await load();
  };

  const typeColors = {
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    success: "text-green-400 bg-green-500/10 border-green-500/20",
    promo: "text-gold bg-gold/10 border-gold/20",
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold">Nuevo Anuncio</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Mantenimiento programado" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">ℹ️ Información</SelectItem>
                <SelectItem value="warning">⚠️ Advertencia</SelectItem>
                <SelectItem value="success">✅ Éxito / Buenas noticias</SelectItem>
                <SelectItem value="promo">🌟 Promoción</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Mensaje</Label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Escribe el mensaje para la comunidad..."
            rows={3}
            className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
        <Button onClick={handleCreate} disabled={submitting} className="bg-gold hover:bg-gold-dark text-black font-semibold gap-2">
          <Plus className="w-4 h-4" /> {submitting ? "Publicando..." : "Publicar Anuncio"}
        </Button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Anuncios Publicados</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay anuncios publicados</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className={`rounded-lg border p-4 flex items-start justify-between gap-3 ${typeColors[ann.type] || typeColors.info} ${!ann.active ? "opacity-40" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{ann.title}</p>
                  <p className="text-xs mt-0.5 text-muted-foreground leading-relaxed">{ann.message}</p>
                  <p className="text-[10px] mt-1 opacity-60">{moment(ann.created_date).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(ann)} className="p-1.5 rounded hover:bg-white/5 transition-colors" title={ann.active ? "Ocultar" : "Mostrar"}>
                    {ann.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
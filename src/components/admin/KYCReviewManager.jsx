import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, CheckCircle, XCircle, Eye, EyeOff, ScanFace, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};
const statusLabels = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" };

function PhotoViewer({ label, icon: Icon, uri }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (url) { setUrl(null); return; }
    setLoading(true);
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 86400 });
    setUrl(signed_url);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={toggle} disabled={loading}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {loading ? "Cargando..." : url ? `Ocultar ${label}` : `Ver ${label}`}
        {url ? <EyeOff className="w-3 h-3 ml-auto" /> : <Eye className="w-3 h-3 ml-auto" />}
      </Button>
      {url && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={url} alt={label} className="w-full max-h-64 object-contain bg-black" />
          <p className="text-[10px] text-muted-foreground text-center py-1">URL válida por 24 horas</p>
        </div>
      )}
    </div>
  );
}

export default function KYCReviewManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    base44.functions.invoke('adminListarUsuarios', {})
      .then(res => {
        const all = res.data?.users || [];
        setUsers(all.filter(u => u.dni_photo_uri || u.kyc_selfie_uri || u.kyc_status));
      })
      .catch(err => {
        console.error("KYC load error:", err);
        toast.error("Error al cargar usuarios: " + (err.message || "Error desconocido"));
      })
      .finally(() => setLoading(false));
  }, []);

  const updateKYC = async (userId, status) => {
    await base44.entities.User.update(userId, { kyc_status: status });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc_status: status } : u));
    toast.success(`KYC ${status === "approved" ? "aprobado ✅" : "rechazado ❌"}`);
  };

  const filtered = filter === "all" ? users : users.filter(u => (u.kyc_status || "pending") === filter);

  if (loading) return <div className="p-6 text-muted-foreground text-sm">Cargando verificaciones...</div>;

  const counts = {
    all: users.length,
    pending: users.filter(u => !u.kyc_status || u.kyc_status === "pending").length,
    approved: users.filter(u => u.kyc_status === "approved").length,
    rejected: users.filter(u => u.kyc_status === "rejected").length,
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-gold" />
        <h2 className="text-base font-bold">Revisión KYC — Identidad de Usuarios</h2>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[["all", "Todos"], ["pending", "Pendientes"], ["approved", "Aprobados"], ["rejected", "Rechazados"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === val ? "bg-gold text-black border-gold" : "border-border text-muted-foreground hover:border-gold/40"}`}>
            {lbl} ({counts[val]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No hay documentos en esta categoría.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(u => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{u.full_name || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">DNI: {u.dni || "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[u.kyc_status] || statusColors.pending}`}>
                    {statusLabels[u.kyc_status] || "Pendiente"}
                  </span>
                  {/* Indicadores de qué subió */}
                  <div className="flex gap-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${u.dni_photo_uri ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-secondary text-muted-foreground border-border"}`}>
                      DNI {u.dni_photo_uri ? "✓" : "✗"}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${u.kyc_selfie_uri ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-secondary text-muted-foreground border-border"}`}>
                      Selfie {u.kyc_selfie_uri ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fotos */}
              <div className="grid grid-cols-1 gap-2">
                {u.dni_photo_uri && (
                  <PhotoViewer label="Foto de DNI" icon={Camera} uri={u.dni_photo_uri} />
                )}
                {u.kyc_selfie_uri && (
                  <PhotoViewer label="Selfie con DNI" icon={ScanFace} uri={u.kyc_selfie_uri} />
                )}
              </div>

              {/* Acciones */}
              {u.kyc_status !== "approved" && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    onClick={() => updateKYC(u.id, "approved")}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 text-xs"
                    onClick={() => updateKYC(u.id, "rejected")}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                  </Button>
                </div>
              )}
              {u.kyc_status === "approved" && (
                <Button size="sm" variant="outline" className="w-full text-xs text-red-400 border-red-500/20"
                  onClick={() => updateKYC(u.id, "rejected")}>
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Revocar aprobación
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
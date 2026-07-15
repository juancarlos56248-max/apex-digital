import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabels = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" };

export default function KYCReviewManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingPhoto, setLoadingPhoto] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const all = await base44.asServiceRole.entities.User.list();
    // Solo usuarios que subieron foto de DNI
    setUsers(all.filter(u => u.dni_photo_uri));
    setLoading(false);
  };

  const viewPhoto = async (userId, uri) => {
    if (signedUrls[userId]) {
      setSignedUrls(p => ({ ...p, [userId]: null }));
      return;
    }
    setLoadingPhoto(p => ({ ...p, [userId]: true }));
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 86400 });
    setSignedUrls(p => ({ ...p, [userId]: signed_url }));
    setLoadingPhoto(p => ({ ...p, [userId]: false }));
  };

  const updateKYC = async (userId, status) => {
    await base44.asServiceRole.entities.User.update(userId, { kyc_status: status });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc_status: status } : u));
    toast.success(`KYC ${status === "approved" ? "aprobado" : "rechazado"} correctamente.`);
  };

  if (loading) return <div className="p-6 text-muted-foreground text-sm">Cargando verificaciones...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-gold" />
        <h2 className="text-base font-bold">Revisión KYC — Documentos de Identidad</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Solo administradores pueden ver estas fotos. Las URLs son temporales (5 min).</p>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay documentos pendientes de revisión.</p>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">DNI: {u.dni || "—"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[u.kyc_status] || statusColors.pending}`}>
                  {statusLabels[u.kyc_status] || "Pendiente"}
                </span>
              </div>

              {/* Foto del DNI */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => viewPhoto(u.id, u.dni_photo_uri)}
                disabled={loadingPhoto[u.id]}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                {loadingPhoto[u.id] ? "Cargando..." : signedUrls[u.id] ? "Ocultar foto" : "Ver foto de DNI"}
              </Button>

              {signedUrls[u.id] && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={signedUrls[u.id]} alt="DNI" className="w-full max-h-64 object-contain bg-black" />
                  <p className="text-[10px] text-muted-foreground text-center py-1">URL expira en 24 horas</p>
                </div>
              )}

              {/* Acciones */}
              {u.kyc_status !== "approved" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    onClick={() => updateKYC(u.id, "approved")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 text-xs"
                    onClick={() => updateKYC(u.id, "rejected")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
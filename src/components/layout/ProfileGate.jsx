import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Phone, Camera, X } from "lucide-react";
import { toast } from "sonner";

export default function ProfileGate({ user, onComplete }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [dni, setDni] = useState(user?.dni || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim() || !phone.trim()) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    setSaving(true);
    let photo_url = undefined;
    if (photoFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
      photo_url = file_url;
    }
    await base44.auth.updateMe({ full_name: fullName.trim(), dni: dni.trim(), phone: phone.trim(), ...(photo_url && { photo_url }) });
    toast.success("Perfil completado. ¡Bienvenido a Apex Digital!");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gold">APEX Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">Verificación de Identidad</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Completa tu perfil</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Para cumplir con los protocolos KYC/AML de nuestra división de Singapur, necesitamos verificar tu identidad antes de operar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <User className="w-3 h-3" /> Nombre Completo
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Carlos Pérez"
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3 h-3" /> DNI / Pasaporte
              </Label>
              <Input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 12345678A"
                className="bg-secondary border-border font-mono"
                maxLength={20}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3 h-3" /> Número de Teléfono
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +34 612 345 678"
                className="bg-secondary border-border font-mono"
                type="tel"
              />
            </div>

            {/* Foto de identificación */}
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Camera className="w-3 h-3" /> Foto de Identificación <span className="text-muted-foreground/50">(opcional)</span>
              </Label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              {photoPreview ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border">
                  <img src={photoPreview} alt="ID preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-lg border border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs">Subir foto de DNI o pasaporte</span>
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-gold hover:bg-gold-dark text-black font-semibold mt-2"
            >
              {saving ? "Verificando..." : "Confirmar Identidad y Continuar"}
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Tus datos están protegidos bajo cifrado AES-256 y nunca serán compartidos con terceros.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
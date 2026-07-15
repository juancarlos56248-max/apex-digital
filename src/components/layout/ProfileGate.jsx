import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Phone, Camera, X, Shield, ScanFace } from "lucide-react";
import { toast } from "sonner";

function PhotoUpload({ label, hint, icon: Icon, preview, onPreview, onFile, inputRef }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3" /> {label} <span className="text-red-400 text-[10px]">* obligatorio</span>
      </Label>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          onFile(file);
          onPreview(URL.createObjectURL(file));
        }}
      />
      {preview ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button type="button"
            onClick={() => { onPreview(null); onFile(null); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full h-20 rounded-lg border border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
        >
          <Icon className="w-5 h-5" />
          <span className="text-xs">{hint}</span>
        </button>
      )}
    </div>
  );
}

export default function ProfileGate({ user, onComplete }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [dni, setDni] = useState(user?.dni || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [dniPreview, setDniPreview] = useState(null);
  const [dniFile, setDniFile] = useState(null);
  const dniRef = useRef(null);

  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const selfieRef = useRef(null);

  const [saving, setSaving] = useState(false);

  // If user already completed the original profile (has dni+phone) but is missing the selfie,
  // skip the name/dni/phone fields and only ask for the selfie.
  const onlyNeedsSelfie = !!(user?.dni && user?.phone && !user?.kyc_selfie_uri);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onlyNeedsSelfie) {
      if (!fullName.trim() || !dni.trim() || !phone.trim()) {
        toast.error("Todos los campos son obligatorios.");
        return;
      }
      if (!dniFile) {
        toast.error("Debes subir una foto de tu DNI o pasaporte.");
        return;
      }
    }

    if (!selfieFile) {
      toast.error("Debes subir una selfie sosteniendo tu documento de identidad.");
      return;
    }

    setSaving(true);

    const updates = { kyc_status: "pending" };

    if (!onlyNeedsSelfie) {
      updates.full_name = fullName.trim();
      updates.dni = dni.trim();
      updates.phone = phone.trim();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: dniFile });
      updates.dni_photo_uri = file_uri;
    }

    const { file_uri: selfie_uri } = await base44.integrations.Core.UploadPrivateFile({ file: selfieFile });
    updates.kyc_selfie_uri = selfie_uri;

    await base44.auth.updateMe(updates);
    toast.success("Documentos enviados. ¡Bienvenido a Apex Digital!");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md py-8"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gold">APEX Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">Verificación de Identidad</p>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Aviso de seguridad:</strong> Para proteger tu cuenta y cumplir con las normativas KYC/AML, necesitamos verificar tu identidad. La revisión toma hasta <strong>24 horas hábiles</strong>. Las cuentas sin verificación completa serán suspendidas.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">Completa tu verificación</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!onlyNeedsSelfie && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <User className="w-3 h-3" /> Nombre Completo
                  </Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Juan Carlos Pérez" className="bg-secondary border-border" />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <CreditCard className="w-3 h-3" /> DNI / Pasaporte
                  </Label>
                  <Input value={dni} onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej: 12345678A" className="bg-secondary border-border font-mono" maxLength={20} />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3 h-3" /> Número de Teléfono
                  </Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: +51 912 345 678" className="bg-secondary border-border font-mono" type="tel" />
                </div>

                <PhotoUpload
                  label="Foto de tu DNI o Pasaporte"
                  hint="Subir foto del documento (ambos lados si es posible)"
                  icon={Camera}
                  preview={dniPreview}
                  onPreview={setDniPreview}
                  onFile={setDniFile}
                  inputRef={dniRef}
                />
              </>
            )}

            {/* Selfie con DNI */}
            <PhotoUpload
              label="Selfie sosteniendo tu DNI"
              hint="Foto de tu rostro con tu documento visible"
              icon={ScanFace}
              preview={selfiePreview}
              onPreview={setSelfiePreview}
              onFile={setSelfieFile}
              inputRef={selfieRef}
            />

            {/* Example hint */}
            <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2.5 flex items-start gap-2">
              <ScanFace className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                La selfie debe mostrar claramente <strong className="text-foreground/80">tu rostro y tu documento</strong> en la misma foto, con buena iluminación.
              </p>
            </div>

            <Button type="submit" disabled={saving}
              className="w-full bg-gold hover:bg-gold-dark text-black font-semibold mt-2">
              {saving ? "Enviando documentos..." : "Enviar Verificación"}
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
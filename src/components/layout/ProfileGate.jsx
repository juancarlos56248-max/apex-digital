import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ProfileGate({ user, onComplete }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [dni, setDni] = useState(user?.dni || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim() || !phone.trim()) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    setSaving(true);
    await base44.auth.updateMe({ dni: dni.trim(), phone: phone.trim() });
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
                disabled
              />
              <p className="text-[10px] text-muted-foreground mt-1">Tomado de tu cuenta registrada.</p>
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
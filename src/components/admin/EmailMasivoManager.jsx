import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailMasivoManager() {
  const [sending, setSending] = useState(false);
  const [sendingBienvenida, setSendingBienvenida] = useState(false);
  const [result, setResult] = useState(null);
  const [resultBienvenida, setResultBienvenida] = useState(null);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    const res = await base44.functions.invoke('enviarCorreoMasivo', {});
    const data = res.data;
    setResult(data);
    if (data.success) {
      toast.success(`✅ Correo enviado a ${data.sent} usuarios`);
    } else {
      toast.error("Error al enviar los correos");
    }
    setSending(false);
  };

  const handleSendBienvenida = async () => {
    setSendingBienvenida(true);
    setResultBienvenida(null);
    const res = await base44.functions.invoke('enviarBienvenidaMasivo', {});
    const data = res.data;
    setResultBienvenida(data);
    if (data.ok) {
      toast.success(`✅ Correo de bienvenida enviado a ${data.sent} usuarios`);
    } else {
      toast.error("Error al enviar los correos");
    }
    setSendingBienvenida(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
          <Mail className="w-4 h-4 text-gold" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Correo Masivo</h2>
          <p className="text-xs text-muted-foreground">Envía el comunicado oficial a todos los usuarios</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
        <p className="text-foreground font-semibold text-sm">Vista previa del mensaje:</p>
        <p>Estimados usuarios,</p>
        <p>Queremos expresar nuestro más sincero agradecimiento por haberse registrado en nuestra plataforma. Su confianza es fundamental para nosotros y nos motiva a seguir creciendo junto a ustedes.</p>
        <p>Nos complace informarles que actualmente el mercado presenta una <span className="text-emerald-400 font-semibold">tendencia al alza</span>, y nuestras alertas indican que es un <span className="text-gold font-semibold">buen momento para la compra de acciones</span>...</p>
        <p className="italic text-muted-foreground">Gracias por ser parte de este proyecto.</p>
      </div>

      {result && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="text-emerald-400 font-semibold">Envío completado</p>
            <p className="text-muted-foreground">Enviados: {result.sent} &bull; Fallidos: {result.failed} &bull; Total: {result.total}</p>
          </div>
        </div>
      )}

      <Button
        onClick={handleSend}
        disabled={sending}
        className="w-full bg-gold hover:bg-gold-dark text-black font-semibold gap-2"
      >
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando a todos los usuarios...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar Correo Masivo</>
        )}
      </Button>

      <div className="border-t border-border pt-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Correo de Bienvenida</h2>
            <p className="text-xs text-muted-foreground">Envía el correo explicativo del modelo de inversión APEX a todos los usuarios</p>
          </div>
        </div>

        {resultBienvenida && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-emerald-400 font-semibold">Envío completado</p>
              <p className="text-muted-foreground">Enviados: {resultBienvenida.sent} &bull; Fallidos: {resultBienvenida.failed} &bull; Total: {resultBienvenida.total}</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleSendBienvenida}
          disabled={sendingBienvenida}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
        >
          {sendingBienvenida ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando bienvenida...</>
          ) : (
            <><Send className="w-4 h-4" /> Enviar Bienvenida a Todos los Usuarios</>
          )}
        </Button>
      </div>
    </div>
  );
}
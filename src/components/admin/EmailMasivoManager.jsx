import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailMasivoManager() {
  const [sending, setSending] = useState(false);
  const [sendingBienvenida, setSendingBienvenida] = useState(false);
  const [sendingFeriado, setSendingFeriado] = useState(false);
  const [result, setResult] = useState(null);
  const [resultBienvenida, setResultBienvenida] = useState(null);
  const [resultFeriado, setResultFeriado] = useState(null);

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

  const handleSendFeriado = async () => {
    setSendingFeriado(true);
    setResultFeriado(null);
    const res = await base44.functions.invoke('emailFeriadoBono', {});
    const data = res.data;
    setResultFeriado(data);
    if (data.success) {
      toast.success(`🇵🇪 Bono Feriado enviado a ${data.sent} usuarios`);
    } else {
      toast.error("Error al enviar el correo de feriado");
    }
    setSendingFeriado(false);
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

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-muted-foreground leading-relaxed space-y-2.5">
        <p className="text-foreground font-semibold text-sm">Vista previa del mensaje:</p>
        <p>🔒 <span className="text-emerald-400 font-semibold">Actualización de Seguridad — Apex Digital</span></p>
        <p>🔐 <span className="text-foreground font-medium">Cifrado de Nivel Bancario:</span> Protocolo AES-256, igual que los principales bancos internacionales.</p>
        <p>🌐 <span className="text-foreground font-medium">Monitoreo 24/7:</span> Sistemas de detección automática de actividad sospechosa en tiempo real.</p>
        <p>✅ <span className="text-foreground font-medium">Verificación Reforzada de Retiros:</span> Proceso de validación adicional para cada movimiento de fondos.</p>
        <p>🚨 <span className="text-foreground font-medium">Sistema Anti-Fraude Avanzado:</span> Análisis inteligente de patrones de comportamiento.</p>
        <p>🏦 <span className="text-foreground font-medium">Custodia Segregada de Fondos:</span> Sus activos están completamente separados de los operativos de la empresa.</p>
        <p>💡 <span className="text-yellow-400 font-medium">Consejos de seguridad</span> para proteger su cuenta incluidos.</p>
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

      {/* Feriado Bono */}
      <div className="border-t border-border pt-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <span className="text-base">🇵🇪</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Bono Feriado FAP — Hoy 23 Jul</h2>
            <p className="text-xs text-muted-foreground">Deposita $300 → recibe $1,000 en nodos · solo hoy</p>
          </div>
        </div>

        <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs text-muted-foreground space-y-1">
          <p className="text-foreground font-semibold">🎁 Bono por Día de la Fuerza Aérea del Perú</p>
          <p>Deposita mínimo <strong className="text-gold">$300 USDT</strong> y recibe <strong className="text-gold">$1,000 USDT en nodos activos</strong>.</p>
          <p className="text-destructive/80 font-semibold">⚡ Oferta válida solo el 23 de julio de 2026.</p>
        </div>

        {resultFeriado && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gold/10 border border-gold/20">
            <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
            <div className="text-xs">
              <p className="text-gold font-semibold">Envío completado</p>
              <p className="text-muted-foreground">Enviados: {resultFeriado.sent} · Fallidos: {resultFeriado.failed} · Total: {resultFeriado.total}</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleSendFeriado}
          disabled={sendingFeriado}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
        >
          {sendingFeriado ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando bono feriado...</>
          ) : (
            <><Send className="w-4 h-4" /> 🇵🇪 Enviar Bono Feriado a Todos</>
          )}
        </Button>
      </div>

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
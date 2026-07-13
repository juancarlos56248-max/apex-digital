import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, RefreshCw } from "lucide-react";

export default function TwoFactorGate({ user, onVerified }) {
  const [pins, setPins] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);
  const inputRefs = useRef([]);
  const sentOnMount = useRef(false);

  // Enviar PIN automáticamente al montar — solo una vez
  useEffect(() => {
    if (sentOnMount.current) return;
    sentOnMount.current = true;
    sendPin();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendPin = async () => {
    if (sendCount >= 3) return;
    setSending(true);
    setError("");
    try {
      await base44.functions.invoke("enviar2FA", {});
      setSendCount(c => c + 1);
      setCooldown(60);
    } catch {
      setError("Error al enviar el código. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pins];
    next[i] = val;
    setPins(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-submit cuando el último dígito se ingresa
    if (i === 5 && val) {
      const full = [...next].join("");
      if (full.length === 6) verifyPin(full);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !pins[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setPins(text.split(""));
      verifyPin(text);
    }
  };

  const verifyPin = async (pin) => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("verificar2FA", { pin });
      if (res.data?.ok) {
        onVerified();
      } else {
        setError(res.data?.error || "Código incorrecto.");
        setPins(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Error de verificación. Intenta nuevamente.");
      setPins(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const pin = pins.join("");
    if (pin.length === 6) verifyPin(pin);
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2}).+(@.+)/, "$1***$2")
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-2xl border border-gold/20 bg-card p-8 shadow-2xl text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>

          <h1 className="text-xl font-bold text-foreground mb-1">Verificación de Seguridad</h1>
          <p className="text-sm text-muted-foreground mb-1">
            Enviamos un código de 6 dígitos a
          </p>
          <p className="text-sm font-semibold text-gold mb-6 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {maskedEmail}
          </p>

          {/* PIN inputs */}
          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {pins.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-11 h-14 text-center text-xl font-bold font-mono rounded-xl border bg-secondary text-foreground outline-none transition-all
                  ${digit ? "border-gold text-gold" : "border-border"}
                  focus:border-gold focus:ring-2 focus:ring-gold/20`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}

          {/* Submit */}
          <Button
            className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11 mb-4"
            disabled={loading || pins.join("").length < 6}
            onClick={handleSubmit}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </Button>

          {/* Resend */}
          {sendCount < 3 ? (
            <button
              onClick={sendPin}
              disabled={sending || cooldown > 0}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${sending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : `Reenviar código (${3 - sendCount} restante${3 - sendCount !== 1 ? "s" : ""})`}
            </button>
          ) : (
            <p className="text-xs text-destructive/80 mx-auto">Límite de reenvíos alcanzado. Recarga la página.</p>
          )}
        </div>

        {/* Branding */}
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          APEX DIGITAL · Autenticación de dos factores
        </p>
      </motion.div>
    </div>
  );
}
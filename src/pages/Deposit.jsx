import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import RuletaSuerte from "@/components/dashboard/RuletaSuerte";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import BonoDepositoBanner from "@/components/promo/BonoDepositoBanner";

const WALLET_ADDRESSES = {
  BEP20: "0xbf4b66292c791d063ccdb8ce6506f5725bbf33a4",
};

const NETWORK_INSTRUCTIONS = [
  "Abre tu wallet (Trust Wallet, MetaMask con BSC, Binance, etc.) y selecciona USDT en red BNB Smart Chain (BEP20).",
  "Copia la dirección corporativa de abajo y pégala como dirección destino.",
  "Asegúrate de tener BNB en tu wallet para pagar el gas fee de la transacción.",
  "Ingresa el monto a enviar (mínimo 10 USDT) y confirma la transacción.",
  "Espera la confirmación en blockchain (aprox. 1–3 minutos en BSC), copia el TXID de BscScan y pégalo abajo.",
];

const RANGE_KEY = "apex_deposit_range";

export default function Deposit() {
  const { user, setUser } = useOutletContext();
  const [network, setNetwork] = useState("BEP20");
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const depositMin = parseFloat(localStorage.getItem(RANGE_KEY + "_min") || "10");
  const depositMax = parseFloat(localStorage.getItem(RANGE_KEY + "_max") || "50000");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Dirección copiada al portapapeles");
  };

  const handleSubmit = async () => {
    if (!amount || !txid) {
      toast.error("Completa todos los campos");
      return;
    }
    if (Number(amount) < depositMin) {
      toast.error(`Monto mínimo: ${depositMin} USDT`);
      return;
    }
    if (Number(amount) > depositMax) {
      toast.error(`Monto máximo: ${depositMax} USDT`);
      return;
    }
    setSubmitting(true);

    // Guardar referral_code_used en el usuario si aún no lo tiene
    const refCode = localStorage.getItem("apex_ref_code");
    if (refCode && !user.referral_code_used && refCode !== user.referral_code) {
      await base44.auth.updateMe({ referral_code_used: refCode });
    }

    await base44.entities.Transaction.create({
      user_email: user.email,
      type: "deposit",
      amount: Number(amount),
      status: "pending",
      txid: txid.trim(),
      network,
    });
    toast.success("Depósito enviado para verificación. Será acreditado tras la auditoría.");
    setAmount("");
    setTxid("");
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Depósito de Fondos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transfiere USDT a nuestra wallet corporativa y registra el hash de transacción
        </p>
      </motion.div>

      {user?.role === "admin" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            onClick={async () => {
              const users = await base44.entities.User.filter({ email: user.email });
              if (users[0]) {
                await base44.entities.User.update(users[0].id, { ruleta_ultima_fecha: null });
                await base44.auth.updateMe({ ruleta_ultima_fecha: null });
                setUser(prev => ({ ...prev, ruleta_ultima_fecha: null }));
                toast.success("🎰 Ruleta reseteada — ya puedes probarla");
              }
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resetear ruleta (admin)
          </Button>
        </div>
      )}

      {/* Steps */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <p className="text-sm font-bold text-foreground">Sigue estos pasos para depositar</p>

        {/* Paso 1 */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center flex-shrink-0">1</div>
          <div>
            <p className="text-sm font-semibold">Abre tu wallet y selecciona USDT - BEP20</p>
            <p className="text-xs text-muted-foreground mt-0.5">Usa Trust Wallet, MetaMask o Binance. Asegúrate de elegir la red <strong className="text-foreground">BNB Smart Chain (BEP20)</strong>, no otra.</p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center flex-shrink-0">2</div>
          <div className="w-full">
            <p className="text-sm font-semibold">Copia y pega esta dirección como destino</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5">
                <p className="text-xs font-mono text-gold break-all">{WALLET_ADDRESSES["BEP20"]}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleCopy(WALLET_ADDRESSES["BEP20"])}
                className="flex-shrink-0 border-border hover:border-gold/30 h-10 w-10">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-yellow-500 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Verifica que la dirección copiada sea idéntica antes de enviar.
            </p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center flex-shrink-0">3</div>
          <div>
            <p className="text-sm font-semibold">Envía el monto (mínimo {depositMin} USDT)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Necesitas un pequeño saldo de <strong className="text-foreground">BNB</strong> en tu wallet para pagar la comisión de red (gas fee). El envío tarda aprox. 1–3 minutos. Máximo permitido: <strong className="text-foreground">${depositMax.toLocaleString()} USDT</strong>.</p>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center flex-shrink-0">4</div>
          <div className="w-full space-y-3">
            <div>
              <p className="text-sm font-semibold">Registra tu depósito aquí abajo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Una vez confirmada la transacción, copia el <strong className="text-foreground">TXID / Hash</strong> desde tu wallet o BscScan y completa el formulario.</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monto enviado (USDT)</Label>
              <Input type="number" placeholder="Ej: 100" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5 bg-secondary border-border font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hash / TXID de la transacción</Label>
              <Input placeholder="Pega aquí el hash de tu transacción" value={txid} onChange={(e) => setTxid(e.target.value)}
                className="mt-1.5 bg-secondary border-border font-mono text-xs" />
              <p className="text-[11px] text-muted-foreground mt-1">Lo encuentras en el historial de tu wallet o en bscscan.com</p>
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !amount || !txid}
              className="w-full bg-gold hover:bg-gold-dark text-black font-bold h-11">
              {submitting ? "Enviando..." : "✓ Confirmar Depósito"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-gold" />
          <span>Tu depósito será revisado y acreditado en tu cuenta en menos de 24 horas.</span>
        </div>
      </motion.div>

      <section className="space-y-4 border-t border-border pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Beneficios y promociones</p>
        <BonoDepositoBanner />
        {user && <RuletaSuerte user={user} onWin={() => base44.auth.me().then(setUser)} />}
      </section>
    </div>
  );
}
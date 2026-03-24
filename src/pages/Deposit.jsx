import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Shield, AlertTriangle } from "lucide-react";

const WALLET_ADDRESSES = {
  USDT: "0xbf4b66292c791d063ccdb8ce6506f5725bbf33a4",
};

export default function Deposit() {
  const { user } = useOutletContext();
  const [network, setNetwork] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Dirección copiada al portapapeles");
  };

  const handleSubmit = async () => {
    if (!amount || !txid) {
      toast.error("Completa todos los campos");
      return;
    }
    if (Number(amount) < 10) {
      toast.error("Monto mínimo: 10 USDT");
      return;
    }
    setSubmitting(true);
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
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Depósito de Fondos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transfiere USDT a nuestra wallet corporativa y registra el hash de transacción
        </p>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-500">Importante</p>
          <p className="text-muted-foreground text-xs mt-1">
            Envía únicamente USDT en la red seleccionada. Los fondos enviados en una red incorrecta pueden perderse permanentemente.
          </p>
        </div>
      </motion.div>

      {/* Wallet Address */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <div>
          <Label className="text-xs text-muted-foreground">Red de Transferencia</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="mt-1.5 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT Nativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Dirección de la Wallet Corporativa</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3">
              <p className="text-xs font-mono text-foreground break-all">{WALLET_ADDRESSES[network]}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(WALLET_ADDRESSES[network])}
              className="flex-shrink-0 border-border hover:border-gold/30"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Monto Enviado (USDT)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 bg-secondary border-border font-mono"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Hash de Transacción USDT (TXID)</Label>
            <Input
              placeholder="Pega aquí el hash de tu transacción USDT"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              className="mt-1.5 bg-secondary border-border font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !amount || !txid}
            className="w-full bg-gold hover:bg-gold-dark text-black font-semibold h-11"
          >
            {submitting ? "Enviando..." : "Enviar para Verificación"}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-gold" />
          <span>Tu depósito será verificado y acreditado por el equipo de cumplimiento</span>
        </div>
      </motion.div>
    </div>
  );
}
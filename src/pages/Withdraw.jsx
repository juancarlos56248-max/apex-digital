import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Shield, AlertCircle } from "lucide-react";
import WithdrawalTicker from "../components/landing/WithdrawalTicker";

const COMMISSION_RATE = 0.08;

export default function Withdraw() {
  const { user, setUser } = useOutletContext();
  const [network, setNetwork] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amtNum = parseFloat(amount) || 0;
  const commission = amtNum * COMMISSION_RATE;
  const netAmount = amtNum - commission;

  // Check 24h restriction
  const canWithdraw = () => {
    if (!user?.last_withdrawal_date) return true;
    const lastDate = new Date(user.last_withdrawal_date);
    const now = new Date();
    const diff = now - lastDate;
    return diff >= 24 * 60 * 60 * 1000;
  };

  const getTimeRemaining = () => {
    if (!user?.last_withdrawal_date) return null;
    const lastDate = new Date(user.last_withdrawal_date);
    const nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = nextDate - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async () => {
    if (!canWithdraw()) {
      toast.error("Solo puedes realizar un retiro cada 24 horas");
      return;
    }
    if (!amount || !wallet) {
      toast.error("Completa todos los campos");
      return;
    }
    const amt = Number(amount);
    if (amt < 10) {
      toast.error("Monto mínimo de retiro: 10 USDT");
      return;
    }
    if (amt > (user.balance || 0)) {
      toast.error("Balance insuficiente");
      return;
    }

    setSubmitting(true);
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: "withdrawal",
      amount: amt,
      status: "pending",
      network,
      wallet_address: wallet.trim(),
    });
    // Update user
    await base44.auth.updateMe({
      balance: (user.balance || 0) - amt,
      last_withdrawal_date: new Date().toISOString(),
    });
    setUser(prev => ({
      ...prev,
      balance: (prev.balance || 0) - amt,
      last_withdrawal_date: new Date().toISOString(),
    }));

    toast.success("Solicitud de retiro enviada a la cola de cumplimiento");
    setAmount("");
    setWallet("");
    setSubmitting(false);
  };

  if (!user) return null;

  const timeRemaining = getTimeRemaining();
  const withdrawAllowed = canWithdraw();



  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Retiro de Fondos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Solicita la liquidación de activos a tu wallet personal
        </p>
      </motion.div>

      {/* 24h Restriction Notice */}
      {!withdrawAllowed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3"
        >
          <Clock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Restricción de Liquidez Activa</p>
            <p className="text-xs text-muted-foreground mt-1">
              Próximo retiro disponible en <span className="font-mono text-foreground">{timeRemaining}</span>.
              Esta restricción garantiza la estabilidad de los nodos de inversión.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-xs text-muted-foreground">Balance Disponible</span>
          <span className="text-lg font-bold font-mono text-gold">${(user.balance || 0).toLocaleString()}</span>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Red de Retiro</Label>
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
          <Label className="text-xs text-muted-foreground">Dirección de tu Wallet</Label>
          <Input
            placeholder="Ingresa tu dirección de wallet"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="mt-1.5 bg-secondary border-border font-mono text-xs"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Monto a Retirar (USDT)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 bg-secondary border-border font-mono"
          />
          <button
            onClick={() => setAmount(String(user.balance || 0))}
            className="text-[11px] text-gold hover:text-gold-light mt-1 transition-colors"
          >
            Retirar todo
          </button>
        </div>

        {amtNum > 0 && (
          <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monto bruto</span>
              <span className="font-mono">${amtNum.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between text-destructive">
              <span>Comisión de red (8%)</span>
              <span className="font-mono">-${commission.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-1.5 text-emerald-400 font-semibold">
              <span>Total a recibir</span>
              <span className="font-mono">${netAmount.toFixed(2)} USDT</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !withdrawAllowed}
          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold h-11"
        >
          {submitting ? "Procesando..." : "Solicitar Retiro"}
        </Button>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-gold" />
          <span>Los retiros pasan por auditoría de cumplimiento (Pending Compliance) antes de la ejecución</span>
        </div>
      </motion.div>

      {/* Retiros recientes de otros usuarios */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Retiros recientes de la comunidad</h2>
        <WithdrawalTicker />
      </motion.div>
    </div>
  );
}
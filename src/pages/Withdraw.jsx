import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Shield, AlertCircle, TrendingUp } from "lucide-react";
import WithdrawalTicker from "../components/landing/WithdrawalTicker";

const COMMISSION_RATE = 0.08;
const WELCOME_BONUS = 5; // Los $5 de bienvenida no son retirables

const isValidUSDTAddress = (addr) => addr.trim().length >= 10;

export default function Withdraw() {
  const { user, setUser } = useOutletContext();
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState([]);

  useEffect(() => {
    if (user?.email) {
      base44.entities.Investment.filter({ user_email: user.email, status: "active" })
        .then(setActiveInvestments);
    }
  }, [user?.email]);

  // Verificar si tiene plan prueba aún activo (no completado)
  const pruebaInvestment = activeInvestments.find(inv => inv.tier === "prueba");
  const pruebaLockedDays = pruebaInvestment ? (() => {
    const start = new Date(pruebaInvestment.created_date);
    const daysElapsed = (new Date() - start) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(3 - daysElapsed);
    return daysLeft > 0 ? daysLeft : 0;
  })() : 0;
  const pruebaLocked = pruebaLockedDays > 0;

  const amtNum = parseFloat(amount) || 0;
  const commission = amtNum * COMMISSION_RATE;
  const netAmount = amtNum - commission;

  // Saldo real disponible para retiro (excluyendo bono de bienvenida)
  const totalBalance = user?.balance || 0;
  const withdrawableBalance = Math.max(0, totalBalance - WELCOME_BONUS);
  const hasOnlyBonus = totalBalance <= WELCOME_BONUS;

  const walletValid = wallet.trim() === "" ? null : isValidUSDTAddress(wallet);

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
    if (!isValidUSDTAddress(wallet)) {
      toast.error("Dirección de wallet inválida. Ingresa una dirección USDT válida (TRC20 o ERC20/BEP20).");
      return;
    }
    const amt = Number(amount);
    if (amt < 1) {
      toast.error("Monto mínimo de retiro: 1 USDT");
      return;
    }
    if (hasOnlyBonus) {
      toast.error("El bono de bienvenida de $5 no es retirable. Debes realizar una inversión primero.");
      return;
    }
    if (pruebaLocked) {
      toast.error(`El plan de prueba debe completar sus 3 días antes de poder retirar. Faltan ${pruebaLockedDays} día(s).`);
      return;
    }
    if (amt > withdrawableBalance) {
      toast.error(`Solo puedes retirar hasta $${withdrawableBalance.toFixed(2)} USDT (el bono de $5 de bienvenida no es retirable).`);
      return;
    }

    setSubmitting(true);
    const freshUser = await base44.auth.me();
    const currentBalance = freshUser?.balance || 0;
    const freshWithdrawable = Math.max(0, currentBalance - WELCOME_BONUS);
    if (amt > freshWithdrawable) {
      toast.error(`Saldo retirable insuficiente — Disponible: $${freshWithdrawable.toFixed(2)} USDT`);
      setSubmitting(false);
      return;
    }
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: "withdrawal",
      amount: amt,
      status: "pending",
      network,
      wallet_address: wallet.trim(),
    });
    const newBalance = currentBalance - amt;
    await base44.auth.updateMe({
      balance: newBalance,
      last_withdrawal_date: new Date().toISOString(),
    });
    setUser(prev => ({
      ...prev,
      balance: newBalance,
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
        {/* Balances */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col p-3 rounded-lg bg-secondary/50">
            <span className="text-[10px] text-muted-foreground">Balance Total</span>
            <span className="text-base font-bold font-mono text-gold">${totalBalance.toLocaleString()}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400">Disponible para Retirar</span>
            <span className="text-base font-bold font-mono text-emerald-400">${withdrawableBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Alerta plan prueba bloqueado */}
        {pruebaLocked && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4 flex gap-3">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Plan de Prueba en curso</p>
              <p className="text-xs text-muted-foreground mt-1">
                Los fondos del plan de prueba <span className="text-yellow-400 font-bold">no son retirables</span> hasta completar los 3 días del ciclo. Faltan <span className="text-yellow-400 font-bold">{pruebaLockedDays} día(s)</span>.
              </p>
            </div>
          </div>
        )}

        {/* Alerta bono de bienvenida */}
        {hasOnlyBonus && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4 flex gap-3">
            <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Bono de bienvenida no retirable</p>
              <p className="text-xs text-muted-foreground mt-1">
                Los <span className="text-yellow-400 font-bold">$5 de bienvenida</span> son exclusivamente para invertir en la plataforma. Realiza una inversión para comenzar a generar ganancias retirables.
              </p>
            </div>
          </div>
        )}

        {/* Red */}
        <div>
          <Label className="text-xs text-muted-foreground">Red de la Wallet</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="mt-1.5 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRC20">TRC20 (TRON)</SelectItem>
              <SelectItem value="ERC20">ERC20 (Ethereum)</SelectItem>
              <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dirección wallet con validación */}
        <div>
          <Label className="text-xs text-muted-foreground">Dirección de tu Wallet USDT</Label>
          <Input
            placeholder={network === "TRC20" ? "Empieza con T... (34 caracteres)" : "Empieza con 0x... (42 caracteres)"}
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className={`mt-1.5 bg-secondary font-mono text-xs transition-colors ${
              walletValid === false ? "border-destructive focus-visible:ring-destructive" :
              walletValid === true  ? "border-emerald-500/60" : "border-border"
            }`}
          />
          {walletValid === true && (
            <p className="text-[11px] text-emerald-400 mt-1">✓ Dirección ingresada</p>
          )}
        </div>

        {/* Monto */}
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
            onClick={() => setAmount(String(withdrawableBalance))}
            className="text-[11px] text-gold hover:text-gold-light mt-1 transition-colors"
          >
            Retirar máximo disponible
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
          disabled={submitting || !withdrawAllowed || hasOnlyBonus || pruebaLocked || walletValid === false}
          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold h-11"
        >
          {submitting ? "Procesando..." : "Solicitar Retiro"}
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span>Los retiros pasan por verificación de cumplimiento antes de ejecutarse (24–72 horas hábiles)</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground/70 border border-border/40 rounded-lg p-2.5 bg-secondary/20">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span>La comisión de red del 8% cubre costos operativos de procesamiento blockchain. No existen cargos adicionales ocultos.</span>
          </div>
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
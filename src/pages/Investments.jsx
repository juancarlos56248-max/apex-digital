import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import TierCard from "../components/investments/TierCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

export default function Investments() {
  const { user } = useOutletContext();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.Investment.filter({ user_email: user.email }).then((invs) => {
      setInvestments(invs);
      setLoading(false);
    });
  }, [user]);

  const handleSubscribe = (tier, deposit) => {
    setSelectedTier(tier);
    setSelectedDeposit(deposit);
    setDialogOpen(true);
  };

  const confirmSubscription = async () => {
    setSubmitting(true);
    // Check balance
    if ((user.balance || 0) < selectedDeposit) {
      toast.error("Balance insuficiente. Realiza un depósito primero.");
      setSubmitting(false);
      return;
    }

    // Create investment
    const investmentData = {
      user_email: user.email,
      tier: selectedTier,
      amount: selectedDeposit,
      status: "active",
      total_earned: 0,
      last_dividend_date: new Date().toISOString(),
    };

    if (referralCode && referralCode !== user.referral_code) {
      investmentData.referral_code_used = referralCode;
      // Find referrer and create referral record
      const users = await base44.entities.User.filter({ referral_code: referralCode });
      if (users.length > 0) {
        const bonusMap = { starter: 5, pro: 25, elite: 50, institutional: 100 };
        const bonus = bonusMap[selectedTier] || 5;
        await base44.entities.Referral.create({
          referrer_email: users[0].email,
          referred_email: user.email,
          referral_code: referralCode,
          bonus_amount: bonus,
          investment_tier: selectedTier,
          status: "credited",
        });
        // Credit referrer
        await base44.entities.User.update(users[0].id, {
          balance: (users[0].balance || 0) + bonus,
          total_earned: (users[0].total_earned || 0) + bonus,
        });
        // Create transaction for referrer
        await base44.entities.Transaction.create({
          user_email: users[0].email,
          type: "referral_bonus",
          amount: bonus,
          status: "completed",
          notes: `Bono por referido ${user.email} - ${selectedTier}`,
        });
      }
    }

    await base44.entities.Investment.create(investmentData);
    // Deduct balance
    await base44.auth.updateMe({
      balance: (user.balance || 0) - selectedDeposit,
      total_invested: (user.total_invested || 0) + selectedDeposit,
    });

    toast.success(`Nodo ${selectedTier.toUpperCase()} activado exitosamente`);
    setDialogOpen(false);
    setReferralCode("");
    // Refresh
    const updatedInvs = await base44.entities.Investment.filter({ user_email: user.email });
    setInvestments(updatedInvs);
    setSubmitting(false);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const activeTiers = investments.filter(i => i.status === "active").map(i => i.tier);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Nodos de Liquidez</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suscríbete a estrategias algorítmicas de alto rendimiento
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {["starter", "pro", "elite", "institutional"].map((tier, i) => (
          <TierCard
            key={tier}
            tier={tier}
            onSubscribe={handleSubscribe}
            delay={i * 0.1}
            hasActive={activeTiers.includes(tier)}
          />
        ))}
      </div>

      {/* Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Activar Nodo {selectedTier?.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Se deducirán ${selectedDeposit?.toLocaleString()} USDT de tu balance disponible.
              Balance actual: <span className="text-gold font-mono">${(user.balance || 0).toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Código de Referido (opcional)</Label>
              <Input
                placeholder="Ej: APEX1B3K9Z"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="mt-1.5 bg-secondary border-border font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmSubscription}
              disabled={submitting}
              className="bg-gold hover:bg-gold-dark text-black font-semibold"
            >
              {submitting ? "Procesando..." : "Confirmar Activación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
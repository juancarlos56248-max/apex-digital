import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import TierCard from "../components/investments/TierCard";
import ActivePortfolio from "../components/investments/ActivePortfolio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Shield, Zap, Download } from "lucide-react";

export default function Investments() {
  const { user } = useOutletContext();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [certData, setCertData] = useState(null);
  const [certOpen, setCertOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.Investment.filter({ user_email: user.email }).then((invs) => {
      setInvestments(invs);
      setLoading(false);
    });
  }, [user]);

  const handleSubscribe = (tier, deposit, config) => {
    setSelectedTier(tier);
    setSelectedDeposit(deposit);
    setSelectedConfig(config);
    setCustomAmount(String(deposit));
    setDialogOpen(true);
  };

  const downloadCertificate = () => {
    if (!certData) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Georgia,serif;background:#050505;color:#c5a059;margin:0;padding:40px;}
      .cert{border:2px solid #c5a059;border-radius:12px;padding:48px;max-width:700px;margin:auto;text-align:center;background:linear-gradient(135deg,#0a0a0a,#111);}
      h1{font-size:28px;letter-spacing:4px;margin-bottom:4px;color:#e8c97a;}
      .sub{font-size:11px;letter-spacing:8px;color:#888;margin-bottom:32px;}
      .divider{border:none;border-top:1px solid #c5a059;margin:24px 0;opacity:0.4;}
      p{font-size:14px;line-height:1.8;color:#d4b87a;}
      .highlight{color:#e8c97a;font-weight:bold;font-size:16px;}
      .footer{font-size:11px;color:#555;margin-top:32px;letter-spacing:2px;}
    </style></head><body><div class="cert">
      <h1>APEX DIGITAL</h1>
      <div class="sub">CERTIFICADO DE CUSTODIA DE ACTIVOS</div>
      <hr class="divider">
      <p>Apex Digital certifica que el usuario</p>
      <p class="highlight">${certData.name}</p>
      <p>posee una participación activa en el</p>
      <p class="highlight">Nodo de Liquidez ${certData.asset}</p>
      <p>con una tasa de devengo diario de <span class="highlight">${certData.rate}</span>,<br>
      bajo los protocolos de seguridad de la división<br>de activos digitales de Singapur.</p>
      <hr class="divider">
      <p style="font-size:12px;color:#666;">Monto invertido: <b style="color:#c5a059">$${certData.amount} USDT</b> &nbsp;|&nbsp; Fecha: ${certData.date}</p>
      <div class="footer">APEX DIGITAL ASSET MANAGEMENT — SINGAPORE DIVISION — ID: ${certData.id}</div>
    </div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Apex_Certificado_${certData.asset}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const confirmSubscription = async () => {
    setSubmitting(true);
    const amount = parseFloat(customAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Ingresa un monto válido."); setSubmitting(false); return;
    }
    if (selectedConfig?.minDeposit && amount < selectedConfig.minDeposit) {
      toast.error(`El monto mínimo para este nodo es $${selectedConfig.minDeposit.toLocaleString()} USDT.`); setSubmitting(false); return;
    }
    if (selectedConfig?.maxDeposit && amount > selectedConfig.maxDeposit) {
      toast.error(`El monto máximo para este nodo es $${selectedConfig.maxDeposit.toLocaleString()} USDT.`); setSubmitting(false); return;
    }
    const selectedDeposit = amount;
    if ((user.balance || 0) < selectedDeposit) {
      toast.error("⚠️ Fondos Insuficientes. Por favor recargue su cuenta.");
      setSubmitting(false);
      return;
    }

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
      const users = await base44.entities.User.filter({ referral_code: referralCode });
      if (users.length > 0) {
        const bonusMap = { starter: 5, advance: 25, elite: 50, institutional: 100 };
        const bonus = bonusMap[selectedTier] || 5;
        await base44.entities.Referral.create({
          referrer_email: users[0].email,
          referred_email: user.email,
          referral_code: referralCode,
          bonus_amount: bonus,
          investment_tier: selectedTier,
          status: "credited",
        });
        await base44.entities.User.update(users[0].id, {
          balance: (users[0].balance || 0) + bonus,
          total_earned: (users[0].total_earned || 0) + bonus,
        });
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
    await base44.auth.updateMe({
      balance: (user.balance || 0) - selectedDeposit,
      total_invested: (user.total_invested || 0) + selectedDeposit,
    });

    const cert = {
      name: user.full_name || user.email,
      asset: selectedConfig?.subtitle || selectedTier,
      rate: selectedConfig?.dailyReturn || "N/A",
      amount: selectedDeposit.toLocaleString(),
      date: new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
    setCertData(cert);

    toast.success(`✅ ¡Compra Exitosa! Nodo ${selectedConfig?.name || selectedTier.toUpperCase()} activado correctamente.`);
    setDialogOpen(false);
    setCertOpen(true);
    setReferralCode("");
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

  const activeInvestments = investments.filter(i => i.status === "active");
  const activeTiers = activeInvestments.map(i => i.tier);
  const tierKeys = ["starter", "advance", "elite", "institutional"];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Nodos de Liquidez</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suscríbete a estrategias algorítmicas de alto rendimiento
        </p>
      </motion.div>

      {activeInvestments.length > 0 && (
        <ActivePortfolio investments={activeInvestments} />
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {tierKeys.map((tier, i) => (
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
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              Activar Contrato — {selectedConfig?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedConfig?.subtitle} &bull; Rendimiento diario: <span className="text-gold font-mono font-bold">{selectedConfig?.dailyReturn}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-3 h-3 text-gold" />
              <span className="text-gold font-semibold text-[10px] uppercase tracking-wider">Estrategia Apex HFT</span>
            </div>
            <p>Al activar este nodo, integras tu capital en nuestro motor de <strong className="text-foreground">Arbitraje Cuántico</strong>. Nuestra tecnología escanea diferencias de precios en las bolsas de Nueva York y Singapur en milisegundos, utilizando apalancamiento institucional para maximizar el retorno diario, protegiendo el capital base mediante órdenes <strong className="text-foreground">Stop-Loss</strong> automatizadas.</p>
            <ul className="mt-2 space-y-1">
              <li>• <strong className="text-foreground">Liquidación Diaria</strong> — Dividendos cada 24 horas sin excepción.</li>
              <li>• <strong className="text-foreground">Gestión de Riesgo</strong> — 1 retiro permitido por ciclo de 24h.</li>
              <li>• <strong className="text-foreground">Transparencia Total</strong> — Rastrea el crecimiento en tu Dashboard.</li>
            </ul>
          </div>

          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs text-muted-foreground">Monto a Invertir (USDT)</Label>
              <Input
                type="number"
                placeholder={`Mín. $${selectedConfig?.minDeposit?.toLocaleString()}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="mt-1.5 bg-secondary border-border font-mono"
              />
              {selectedConfig && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Rango: ${selectedConfig.minDeposit?.toLocaleString()} – {selectedConfig.maxDeposit ? `$${selectedConfig.maxDeposit?.toLocaleString()}` : "Sin límite"} USDT
                  &nbsp;&bull;&nbsp; Balance: <span className="text-gold font-mono">${(user.balance || 0).toLocaleString()}</span>
                </p>
              )}
            </div>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmSubscription} disabled={submitting} className="bg-gold hover:bg-gold-dark text-black font-semibold">
              {submitting ? "Procesando..." : "Confirmar Activación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="bg-card border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold">Certificado de Custodia Listo</DialogTitle>
            <DialogDescription>Tu nodo ha sido activado. Descarga tu certificado oficial de participación.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <Download className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm font-semibold">{certData?.name}</p>
            <p className="text-xs text-muted-foreground">Nodo: <span className="text-gold">{certData?.asset}</span></p>
            <p className="text-xs text-muted-foreground">Rendimiento diario: <span className="text-success font-mono">{certData?.rate}</span></p>
            <p className="text-xs text-muted-foreground">Monto: <span className="font-mono">${certData?.amount} USDT</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Bajo los protocolos de seguridad de la división de activos digitales de Singapur.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertOpen(false)}>Cerrar</Button>
            <Button onClick={downloadCertificate} className="bg-gold hover:bg-gold-dark text-black font-semibold gap-2">
              <Download className="w-4 h-4" /> Descargar Certificado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
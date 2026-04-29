import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [referralCode] = useState(() => localStorage.getItem("apex_ref_code") || "");
  const [selectedStocks, setSelectedStocks] = useState([]);
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

  const POPULAR_STOCKS = [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "META", name: "Meta" },
    { symbol: "JPM", name: "JPMorgan" },
    { symbol: "BRK.B", name: "Berkshire" },
    { symbol: "GS", name: "Goldman" },
    { symbol: "NFLX", name: "Netflix" },
    { symbol: "AMD", name: "AMD" },
  ];

  const handleSubscribe = (tier, deposit, config) => {
    setSelectedTier(tier);
    setSelectedDeposit(deposit);
    setSelectedConfig(config);
    setCustomAmount(String(deposit));
    setSelectedStocks([]);
    setDialogOpen(true);
  };

  const toggleStock = (symbol) => {
    setSelectedStocks(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : prev.length < 4 ? [...prev, symbol] : prev
    );
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
      toast({ title: "Ingresa un monto válido.", variant: "destructive" }); setSubmitting(false); return;
    }
    if (selectedConfig?.minDeposit && amount < selectedConfig.minDeposit) {
      toast({ title: `El monto mínimo para este nodo es $${selectedConfig.minDeposit.toLocaleString()} USDT.`, variant: "destructive" }); setSubmitting(false); return;
    }
    if (selectedConfig?.maxDeposit && amount > selectedConfig.maxDeposit) {
      toast({ title: `El monto máximo para este nodo es $${selectedConfig.maxDeposit.toLocaleString()} USDT.`, variant: "destructive" }); setSubmitting(false); return;
    }
    const selectedDeposit = amount;
    if ((user.balance || 0) <= 0) {
      toast({ title: "⚠️ Sin fondos disponibles", description: "Tu balance es $0. Realiza un depósito para activar este contrato.", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    if ((user.balance || 0) < amount) {
      toast({ title: "⚠️ Fondos Insuficientes", description: `Tu balance ($${(user.balance || 0).toFixed(2)} USDT) es menor al monto ingresado.`, variant: "destructive" });
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
      custom_stocks: selectedStocks.length > 0 ? selectedStocks : undefined,
    };

    if (referralCode && referralCode !== user.referral_code) {
      investmentData.referral_code_used = referralCode;
      await base44.functions.invoke('procesarReferido', {
        referral_code: referralCode,
        tier: selectedTier,
        referred_email: user.email,
      });
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

    toast({ title: `✅ ¡Compra Exitosa!`, description: `Nodo ${selectedConfig?.name || selectedTier.toUpperCase()} activado correctamente.` });
    setDialogOpen(false);
    setCertOpen(true);
    localStorage.removeItem("apex_ref_code");
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
              {selectedConfig && (
                <span className="ml-2 text-muted-foreground">
                  &bull; Mín. inversión: <span className="text-gold font-mono font-bold">${selectedConfig.minDeposit?.toLocaleString()} USDT</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-gold/20 bg-gold/5 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3 h-3 text-gold" />
              <span className="text-gold font-semibold text-[10px] uppercase tracking-wider">Estrategia Apex HFT</span>
            </div>
            <ul className="space-y-0.5">
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
                  Rango: ${selectedConfig.minDeposit?.toLocaleString("en-US")} – {selectedConfig.maxDeposit ? `$${selectedConfig.maxDeposit?.toLocaleString("en-US")}` : "Sin límite"} USDT
                  &nbsp;&bull;&nbsp; Balance: <span className="text-gold font-mono">${(user.balance || 0).toFixed(2)}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Elige hasta 4 acciones para tu nodo (opcional)</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STOCKS.map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => toggleStock(s.symbol)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                      selectedStocks.includes(s.symbol)
                        ? "bg-gold/20 border-gold/50 text-gold"
                        : "bg-secondary border-border text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
              {selectedStocks.length > 0 && (
                <p className="text-[11px] text-gold mt-1.5">Seleccionadas: {selectedStocks.join(", ")}</p>
              )}
            </div>

            {referralCode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/5 border border-gold/20">
                <span className="text-[11px] text-muted-foreground">Referido aplicado:</span>
                <span className="text-[11px] font-mono font-bold text-gold">{referralCode}</span>
              </div>
            )}
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
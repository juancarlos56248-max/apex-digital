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
import { Shield, Zap, Download, AlertTriangle } from "lucide-react";

export default function Investments() {
  const { user } = useOutletContext();

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
      toast.error("Ingresa un monto válido."); setSubmitting(false); return;
    }

    const selectedDeposit = amount;
    const minDeposit = selectedConfig?.minDeposit || 0;
    const maxDeposit = selectedConfig?.maxDeposit || null;

    if (amount < minDeposit) {
      toast.error(`⚠️ Monto mínimo para este plan es $${minDeposit.toLocaleString()} USDT`);
      setSubmitting(false);
      return;
    }
    if (maxDeposit && amount > maxDeposit) {
      toast.error(`⚠️ Monto máximo para este plan es $${maxDeposit.toLocaleString()} USDT`);
      setSubmitting(false);
      return;
    }
    if ((user.balance || 0) <= 0) {
      toast.error("⚠️ Saldo Insuficiente — Tu balance es $0. Realiza un depósito primero.");
      setSubmitting(false);
      return;
    }
    if ((user.balance || 0) < amount) {
      toast.error(`⚠️ Saldo Insuficiente — Tu balance es $${(user.balance || 0).toFixed(2)} USDT`);
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

    toast.success(`✅ Nodo ${selectedConfig?.name || selectedTier.toUpperCase()} activado correctamente.`);
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nodos de Liquidez</h1>
          <p className="text-sm text-muted-foreground mt-1">Estrategias algorítmicas de análisis de mercado</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Nodos en línea</span>
        </div>
      </motion.div>

      {/* Risk disclosure */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
      >
        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-yellow-400">Aviso de Riesgo:</span> Los rendimientos mostrados son estimados y basados en análisis histórico. Los mercados financieros son volátiles y los resultados pasados no garantizan rendimientos futuros. Invierte solo lo que puedas permitirte perder.
        </p>
      </motion.div>

      {activeInvestments.length > 0 && (
        <ActivePortfolio investments={activeInvestments} />
      )}

      {/* Tier Cards */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Selecciona tu nivel de acceso</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {tierKeys.map((tier, i) => (
            <TierCard
              key={tier}
              tier={tier}
              onSubscribe={handleSubscribe}
              delay={i * 0.08}
              hasActive={activeTiers.includes(tier)}
            />
          ))}
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-gold" />
              </div>
              Activar Contrato
            </DialogTitle>
            <DialogDescription>
              <span className="text-foreground font-medium">{selectedConfig?.name}</span>
              {" · "}{selectedConfig?.subtitle}
            </DialogDescription>
          </DialogHeader>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-secondary/60 border border-border/50 p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Rendimiento</p>
              <p className="text-sm font-bold font-mono text-gold">{selectedConfig?.dailyReturn}</p>
              <p className="text-[10px] text-muted-foreground">/ día</p>
            </div>
            <div className="rounded-lg bg-secondary/60 border border-border/50 p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Duración</p>
              <p className="text-sm font-bold font-mono text-foreground">{selectedConfig?.duration}</p>
            </div>
            <div className="rounded-lg bg-secondary/60 border border-border/50 p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Mín. entrada</p>
              <p className="text-sm font-bold font-mono text-foreground">${selectedConfig?.minDeposit?.toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-3 h-3 text-gold" />
              <span className="text-gold font-semibold text-[10px] uppercase tracking-wider">Protocolos de Seguridad</span>
            </div>
            <ul className="space-y-1">
              <li>• <strong className="text-foreground">Liquidación Diaria</strong> — Rendimientos calculados cada 24 horas.</li>
              <li>• <strong className="text-foreground">Gestión de Riesgo</strong> — 1 retiro permitido por ciclo de 24h.</li>
              <li>• <strong className="text-foreground">Seguimiento en Vivo</strong> — Rastrea el crecimiento en tu Dashboard.</li>
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
                className="mt-1.5 bg-secondary border-border font-mono text-base"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[11px] text-muted-foreground">
                  Rango: ${selectedConfig?.minDeposit?.toLocaleString("en-US")} – {selectedConfig?.maxDeposit ? `$${selectedConfig?.maxDeposit?.toLocaleString("en-US")}` : "Sin límite"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Balance: <span className="text-gold font-mono font-semibold">${(user.balance || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Personaliza tu nodo — elige hasta 4 acciones (opcional)</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STOCKS.map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => toggleStock(s.symbol)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all duration-150 ${
                      selectedStocks.includes(s.symbol)
                        ? "bg-gold/20 border-gold/50 text-gold"
                        : "bg-secondary border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                    }`}
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
              {selectedStocks.length > 0 && (
                <p className="text-[11px] text-gold mt-1.5 font-mono">✓ {selectedStocks.join(", ")}</p>
              )}
            </div>

            {referralCode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/5 border border-gold/20">
                <span className="text-[11px] text-muted-foreground">Código referido:</span>
                <span className="text-[11px] font-mono font-bold text-gold">{referralCode}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={confirmSubscription}
              disabled={submitting || (() => {
                const v = parseFloat(customAmount);
                if (!v || isNaN(v)) return true;
                if (v < (selectedConfig?.minDeposit || 0)) return true;
                if (selectedConfig?.maxDeposit && v > selectedConfig.maxDeposit) return true;
                return false;
              })()}
              className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold"
            >
              {submitting ? "Procesando..." : "Confirmar Activación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="bg-card border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold flex items-center gap-2">
              <Shield className="w-4 h-4" /> Certificado de Custodia
            </DialogTitle>
            <DialogDescription>Tu nodo ha sido activado exitosamente. Descarga tu certificado oficial.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5 p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{certData?.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Titular de la posición</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="rounded-lg bg-card/80 border border-border/50 p-2">
                <p className="text-[10px] text-muted-foreground">Nodo</p>
                <p className="text-xs font-semibold text-gold truncate">{certData?.asset?.split(" ")[0]}</p>
              </div>
              <div className="rounded-lg bg-card/80 border border-border/50 p-2">
                <p className="text-[10px] text-muted-foreground">Rendimiento</p>
                <p className="text-xs font-semibold text-success font-mono">{certData?.rate}/día</p>
              </div>
              <div className="rounded-lg bg-card/80 border border-border/50 p-2">
                <p className="text-[10px] text-muted-foreground">Capital</p>
                <p className="text-xs font-semibold font-mono">${certData?.amount}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">ID: {certData?.id} · {certData?.date}</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCertOpen(false)} className="flex-1">Cerrar</Button>
            <Button onClick={downloadCertificate} className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold gap-2">
              <Download className="w-4 h-4" /> Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
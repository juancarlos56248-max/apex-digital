import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Star } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CyberCard from "@/components/wallet/CyberCard";
import LockedWallet from "@/components/wallet/LockedWallet";
import WalletActivity, { totalCashback } from "@/components/wallet/WalletActivity";
import WalletRequest from "@/components/wallet/WalletRequest";

const MIN_INVESTMENT = 1000;

const COUNTRY_BY_PHONE_PREFIX = {
  "51": "PE", "57": "CO", "52": "MX", "56": "CL", "593": "EC",
  "54": "AR", "591": "BO", "55": "BR", "58": "VE", "595": "PY",
  "598": "UY", "34": "ES", "1": "US",
};

function getCountryCode(phone = "") {
  const digits = phone.replace(/\D/g, "");
  const prefix = Object.keys(COUNTRY_BY_PHONE_PREFIX)
    .sort((a, b) => b.length - a.length)
    .find(value => digits.startsWith(value));
  return COUNTRY_BY_PHONE_PREFIX[prefix] || "PE";
}

export default function TarjetaApex() {
  const { user } = useOutletContext();
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cardStatus, setCardStatus] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Investment.filter({ user_email: user.email, status: "active" }),
      base44.entities.Transaction.filter({ user_email: user.email, type: "deposit" }, "-created_date"),
    ]).then(([investments, transactions]) => {
      const cardRequests = transactions.filter(item => item.notes === "SOLICITUD TARJETA VIRTUAL APEX" || item.notes === "ACTIVACIÓN TARJETA VIRTUAL APEX");
      const approved = cardRequests.some(item => item.status === "approved" || item.status === "completed");
      const pending = cardRequests.some(item => item.status === "pending");
      setTotalInvested(investments.reduce((sum, item) => sum + (item.amount || 0), 0));
      setCardStatus(approved ? "approved" : pending ? "pending" : cardRequests.length ? "rejected" : "none");
    }).finally(() => setLoading(false));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    return base44.entities.Transaction.subscribe((event) => {
      const item = event.data;
      if (item?.user_email !== user.email || item.notes !== "SOLICITUD TARJETA VIRTUAL APEX") return;
      if (item.status === "approved" || item.status === "completed") setCardStatus("approved");
      if (item.status === "rejected") setCardStatus("rejected");
    });
  }, [user?.email]);

  const handleRequest = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: "deposit",
        amount: 0,
        status: "pending",
        notes: "SOLICITUD TARJETA VIRTUAL APEX",
      });
      toast.success("Solicitud enviada para aprobación.");
      setCardStatus("pending");
    } catch (error) {
      toast.error(error.message || "No se pudo enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" /></div>;

  const hasAccess = totalInvested > MIN_INVESTMENT || user?.role === "admin";
  if (!hasAccess) return <LockedWallet user={user} totalInvested={totalInvested} minimum={MIN_INVESTMENT} />;

  const code = user?.email || "apexwallet";
  const digits = [...code].map(char => char.charCodeAt(0) % 10).join("").padEnd(16, "7").slice(0, 16);
  const cardNumber = `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12)}`;

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gold/10 bg-background p-4 md:p-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-72 w-72 rounded-full bg-gold-dark/5 blur-3xl" />
      <div className="relative">
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">APEX // DIGITAL VAULT</p>
            <h1 className="mt-2 text-2xl font-black md:text-3xl">Billetera Digital</h1>
            <p className="mt-1 text-xs text-muted-foreground">Infraestructura financiera con cashback del 5%</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${cardStatus === "approved" ? "border-success/25 bg-success/10 text-success" : cardStatus === "pending" ? "border-warning/25 bg-warning/10 text-warning" : "border-gold/25 bg-gold/10 text-gold"}`}>
            <Activity className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{cardStatus === "approved" ? "Activa" : cardStatus === "pending" ? "En revisión" : "Disponible"}</span>
          </div>
        </motion.header>

        {cardStatus !== "approved" && <div className="mb-6"><WalletRequest status={cardStatus} submitting={submitting} onSubmit={handleRequest} /></div>}

        <div>
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
              <CyberCard user={user} countryCode={getCountryCode(user?.phone)} cardNumber={cardStatus === "approved" ? cardNumber : null} balance={user?.balance || 0} hideBalance={hideBalance} onToggleBalance={() => setHideBalance(value => !value)} />
            </motion.div>
            <div className="flex items-center justify-between rounded-2xl border border-gold-dark/25 bg-gradient-to-r from-gold-dark/10 to-gold/5 p-4">
              <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cashback acumulado</p><p className="mt-1 font-mono text-2xl font-black text-gold">${totalCashback.toFixed(2)}</p><p className="text-[9px] text-muted-foreground">USDT · 5% en cada compra</p></div>
              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4"><Star className="h-6 w-6 fill-gold/20 text-gold" /></div>
            </div>
            <WalletActivity activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
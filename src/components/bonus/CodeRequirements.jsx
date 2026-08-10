import { CheckCircle2, Circle } from "lucide-react";

export default function CodeRequirements({ code, stats = {} }) {
  if (!code) return null;
  const referrals = stats.referrals || 0;
  const referralInvestment = stats.referralInvestment || 0;
  const maxDeposit = stats.maxDeposit || 0;

  const referralsMet = referrals >= code.min_referidos;
  const investmentMet = referralInvestment >= code.min_inversion_referidos;
  const depositMet = maxDeposit > code.min_deposito;
  const referralsComboMet = referralsMet && investmentMet;

  const items = [
    {
      label: `Referidos activos: ${code.min_referidos}`,
      value: `Tienes ${referrals}`,
      done: referralsMet,
    },
    {
      label: `Inversión total de referidos: $${code.min_inversion_referidos} USDT`,
      value: `Acumulado: $${referralInvestment.toFixed(2)}`,
      done: investmentMet,
    },
    {
      label: `O un depósito mayor a $${code.min_deposito} USDT`,
      value: `Tu depósito mayor: $${maxDeposit.toFixed(2)}`,
      done: depositMet,
    },
  ];

  return (
    <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requisitos del código</p>
      <p className="text-[11px] text-muted-foreground">
        Cumple las dos primeras condiciones {""}
        <span className="font-semibold text-foreground">(referidos + inversión total)</span>, {""}
        o la alternativa de un depósito mayor a ${code.min_deposito} USDT.
      </p>
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2">
          {item.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success flex-shrink-0" /> : <Circle className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />}
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.value}</p>
          </div>
        </div>
      ))}
      {referralsComboMet && (
        <p className="pt-1 text-xs font-semibold text-success">✓ Requisito de referidos cumplido</p>
      )}
      {depositMet && (
        <p className="text-xs font-semibold text-success">✓ Requisito de depósito cumplido</p>
      )}
    </div>
  );
}
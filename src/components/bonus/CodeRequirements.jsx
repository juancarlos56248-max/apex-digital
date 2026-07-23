import { CheckCircle2, Circle } from "lucide-react";

export default function CodeRequirements({ code, nodeAmount, referrals }) {
  if (!code) return null;
  const items = [
    { label: `Nodo activo mínimo: $${code.min_node} USDT`, value: nodeAmount ? `Tu nodo activo: $${nodeAmount.toFixed(2)}` : "No tienes un nodo activo elegible", done: nodeAmount >= code.min_node },
    { label: `Referidos activos: ${code.min_referidos}`, value: `Tienes ${referrals}`, done: referrals >= code.min_referidos },
  ];
  return (
    <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requisitos del código</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2">
          {item.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> : <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
          <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.value}</p></div>
        </div>
      ))}
    </div>
  );
}
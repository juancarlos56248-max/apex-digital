import { History } from "lucide-react";

function gainFor(item) {
  const percentage = Number(String(item.notes || "").match(/DESEMBOLSADO \+(\d+(?:\.\d+)?)%/)?.[1] || 0);
  return Number(item.amount || 0) * percentage / 100;
}

export default function OpportunityHistory({ items }) {
  if (!items.length) return null;
  return (
    <div className="mb-20 rounded-xl border border-border bg-card p-4 lg:mb-6">
      <div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-gold" /><h2 className="text-sm font-semibold">Historial</h2></div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs">
            <div><p className="font-medium">Participación de ${Number(item.amount || 0).toFixed(2)}</p><p className="text-muted-foreground">{new Date(item.updated_date || item.created_date).toLocaleDateString("es-PE")}</p></div>
            <div className="text-right"><p className="font-mono font-bold text-success">+${gainFor(item).toFixed(2)}</p><p className="text-muted-foreground">Ganancia</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
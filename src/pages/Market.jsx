import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, ShoppingCart, BarChart3 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 189.5 },
  { symbol: "MSFT", name: "Microsoft Corp.", base: 415.2 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 248.3 },
  { symbol: "NVDA", name: "NVIDIA Corp.", base: 875.6 },
  { symbol: "AMZN", name: "Amazon.com", base: 198.4 },
  { symbol: "GOOGL", name: "Alphabet Inc.", base: 172.8 },
  { symbol: "META", name: "Meta Platforms", base: 512.3 },
  { symbol: "JPM", name: "JPMorgan Chase", base: 218.7 },
  { symbol: "GS", name: "Goldman Sachs", base: 512.9 },
  { symbol: "NFLX", name: "Netflix Inc.", base: 634.1 },
  { symbol: "AMD", name: "Advanced Micro Devices", base: 168.4 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", base: 456.1 },
  { symbol: "DIS", name: "Walt Disney Co.", base: 112.3 },
  { symbol: "UBER", name: "Uber Technologies", base: 78.5 },
  { symbol: "COIN", name: "Coinbase Global", base: 215.7 },
  { symbol: "PLTR", name: "Palantir Technologies", base: 24.8 },
];

function useLivePrice(base) {
  const [price, setPrice] = useState(base);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPrice(prev => {
        const next = parseFloat((prev + (Math.random() - 0.48) * prev * 0.003).toFixed(2));
        setDirection(next >= prev ? "up" : "down");
        setTimeout(() => setDirection(null), 600);
        return next;
      });
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(t);
  }, []);

  const change = ((price - base) / base * 100).toFixed(2);
  return { price, direction, change };
}

function StockRow({ stock, onBuy }) {
  const { price, direction, change } = useLivePrice(stock.base);
  const isUp = parseFloat(change) >= 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold font-mono text-gold">{stock.symbol.slice(0, 2)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">{stock.symbol}</p>
          <p className="text-[11px] text-muted-foreground">{stock.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-sm font-mono font-bold transition-colors duration-300 ${
            direction === "up" ? "text-emerald-400" : direction === "down" ? "text-red-400" : "text-foreground"
          }`}>${price.toFixed(2)}</p>
          <div className={`flex items-center gap-0.5 justify-end text-[11px] font-mono ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? "+" : ""}{change}%
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => onBuy(stock, price)}
          className="bg-gold hover:bg-gold-dark text-black text-xs font-semibold h-8 px-3"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Comprar
        </Button>
      </div>
    </div>
  );
}

export default function Market() {
  const { user, setUser } = useOutletContext();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyDialog, setBuyDialog] = useState(null); // { stock, price }
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.StockPosition.filter({ user_email: user.email, status: "open" }, "-created_date").then(p => {
      setPositions(p);
      setLoading(false);
    });
  }, [user]);

  const openBuy = (stock, price) => {
    setBuyDialog({ stock, price });
    setQuantity("");
  };

  const confirmBuy = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { toast.error("Ingresa una cantidad válida"); return; }
    const total = qty * buyDialog.price;
    if (total > (user.balance || 0)) { toast.error("Balance insuficiente"); return; }

    setSubmitting(true);
    await base44.entities.StockPosition.create({
      user_email: user.email,
      symbol: buyDialog.stock.symbol,
      name: buyDialog.stock.name,
      quantity: qty,
      buy_price: buyDialog.price,
      total_invested: total,
      status: "open",
    });
    await base44.auth.updateMe({ balance: (user.balance || 0) - total });
    setUser(prev => ({ ...prev, balance: (prev.balance || 0) - total }));

    toast.success(`✅ Compraste ${qty} acciones de ${buyDialog.stock.symbol}`);
    setBuyDialog(null);
    setSubmitting(false);

    const updated = await base44.entities.StockPosition.filter({ user_email: user.email, status: "open" }, "-created_date");
    setPositions(updated);
  };

  const totalInvested = positions.reduce((s, p) => s + (p.total_invested || 0), 0);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Mercado de Acciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Compra acciones directamente con tu balance disponible</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Balance</p>
          <p className="text-lg font-bold font-mono text-gold">${(user.balance || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Posiciones abiertas</p>
          <p className="text-lg font-bold">{positions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Total invertido</p>
          <p className="text-lg font-bold font-mono">${totalInvested.toFixed(2)}</p>
        </div>
      </div>

      {/* My Positions */}
      {positions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold">Mis Posiciones</span>
          </div>
          <div className="divide-y divide-border">
            {positions.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-bold font-mono text-gold">{p.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono">{p.quantity} acciones</p>
                  <p className="text-[11px] text-muted-foreground">@ ${p.buy_price?.toFixed(2)} = <span className="text-foreground font-semibold">${p.total_invested?.toFixed(2)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stock List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Acciones Disponibles</p>
        </div>
        <div className="divide-y divide-border">
          {STOCKS.map(stock => (
            <StockRow key={stock.symbol} stock={stock} onBuy={openBuy} />
          ))}
        </div>
      </motion.div>

      {/* Buy Dialog */}
      <Dialog open={!!buyDialog} onOpenChange={() => setBuyDialog(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Comprar {buyDialog?.stock.symbol}</DialogTitle>
            <DialogDescription>{buyDialog?.stock.name} — Precio actual: <span className="text-gold font-mono font-bold">${buyDialog?.price.toFixed(2)}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Cantidad de acciones</p>
              <Input
                type="number"
                placeholder="Ej: 5"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="bg-secondary border-border font-mono"
                autoFocus
              />
            </div>
            {quantity && parseFloat(quantity) > 0 && (
              <div className="rounded-lg bg-secondary/50 border border-border p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio por acción</span>
                  <span className="font-mono">${buyDialog?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad</span>
                  <span className="font-mono">{quantity}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold">
                  <span>Total</span>
                  <span className={`font-mono ${(parseFloat(quantity) * buyDialog?.price) > (user?.balance || 0) ? "text-red-400" : "text-gold"}`}>
                    ${(parseFloat(quantity) * (buyDialog?.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">Balance disponible: <span className="text-gold font-mono">${(user?.balance || 0).toFixed(2)}</span></p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialog(null)}>Cancelar</Button>
            <Button onClick={confirmBuy} disabled={submitting} className="bg-gold hover:bg-gold-dark text-black font-semibold">
              {submitting ? "Procesando..." : "Confirmar Compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
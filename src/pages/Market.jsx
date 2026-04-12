import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, ShoppingCart, BarChart3, DollarSign } from "lucide-react";
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

const CRASHED_SYMBOLS = new Set(["AMZN", "META", "GS", "NFLX", "COIN", "PLTR"]);
const FIXED_PRICES = {
  "TSLA": 2.50,
  "NVDA": 8.10,
  "AMD": 10.40,
  "DIS": 20.75,
  "UBER": 5.30,
  "JPM": 60.20,
  "BRK.B": 45.80,
};

function useLivePrice(base, symbol) {
  const crashed = CRASHED_SYMBOLS.has(symbol);
  const fixed = FIXED_PRICES[symbol];
  const [price, setPrice] = useState(fixed !== undefined ? fixed : crashed ? 0.00 : base);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    if (crashed || fixed !== undefined) return;
    const t = setInterval(() => {
      setPrice(prev => {
        const next = parseFloat((prev + (Math.random() - 0.48) * prev * 0.003).toFixed(2));
        setDirection(next >= prev ? "up" : "down");
        setTimeout(() => setDirection(null), 600);
        return next;
      });
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(t);
  }, [crashed]);

  const change = crashed ? "-100.00" : fixed !== undefined ? ((fixed - base) / base * 100).toFixed(2) : ((price - base) / base * 100).toFixed(2);
  const dir = (crashed || fixed !== undefined) ? "down" : direction;
  return { price, direction: dir, change };
}

function useLivePositionPrice(buyPrice) {
  // Inicia directamente en $0 (pérdida total)
  const [price] = useState(0.01);

  const loss = price - buyPrice;
  const lossPct = ((loss / buyPrice) * 100).toFixed(2);
  return { currentPrice: price, loss, lossPct };
}

function PositionRow({ pos, onSell }) {
  const { currentPrice, loss, lossPct } = useLivePositionPrice(pos.buy_price);
  const sellValue = Math.max(pos.quantity * currentPrice, 0);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold font-mono text-gold">{pos.symbol}</p>
          <p className="text-[11px] text-muted-foreground">{pos.name}</p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {pos.quantity} acciones @ ${pos.buy_price?.toFixed(2)} = <span className="text-foreground">${pos.total_invested?.toFixed(2)}</span>
        </p>
      </div>
      <div className="text-right mr-3">
        <p className="text-sm font-mono font-bold text-red-400">{lossPct}%</p>
        <p className="text-[11px] text-red-500">${loss.toFixed(2)} &bull; Valor: ${sellValue.toFixed(2)}</p>
      </div>
      <Button
        size="sm"
        onClick={() => onSell(pos, currentPrice)}
        className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold h-8 px-3"
      >
        <DollarSign className="w-3.5 h-3.5 mr-1" /> Liquidar
      </Button>
    </div>
  );
}

function StockRow({ stock, onBuy }) {
  const { price, direction, change } = useLivePrice(stock.base, stock.symbol);
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
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyDialog, setBuyDialog] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPositions = async () => {
    if (!user) return;
    const [open, closed] = await Promise.all([
      base44.entities.StockPosition.filter({ user_email: user.email, status: "open" }, "-created_date"),
      base44.entities.StockPosition.filter({ user_email: user.email, status: "sold" }, "-updated_date", 20),
    ]);
    setPositions(open);
    setHistory(closed);
    setLoading(false);
  };

  useEffect(() => {
    loadPositions();
  }, [user]);

  // Suscripción en tiempo real para detectar crash de mercado
  useEffect(() => {
    const unsub = base44.entities.StockPosition.subscribe((event) => {
      if (event.type === "update" && event.data?.status === "sold") {
        setPositions(prev => prev.filter(p => p.id !== event.id));
        toast.error("⚠️ Posición liquidada por caída de mercado");
      }
    });
    return () => unsub();
  }, []);

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

  const sellPosition = async (pos, currentPrice) => {
    const sellValue = Math.max(pos.quantity * currentPrice, 0);
    const loss = sellValue - (pos.total_invested || 0);
    await base44.entities.StockPosition.update(pos.id, {
      status: "sold",
      sell_price: currentPrice,
    });
    await base44.auth.updateMe({ balance: (user.balance || 0) + sellValue });
    setUser(prev => ({ ...prev, balance: (prev.balance || 0) + sellValue }));
    toast.error(`⚠️ Liquidaste ${pos.quantity} ${pos.symbol} — Pérdida: $${loss.toFixed(2)} USDT`);
    loadPositions();
  };

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
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">EN VIVO</span>
            </span>
          </div>
          <div className="divide-y divide-border">
            {positions.map(p => (
              <PositionRow key={p.id} pos={p} onSell={sellPosition} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Historial de posiciones cerradas */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold">Historial de Pérdidas</span>
          </div>
          <div className="divide-y divide-border">
            {history.map(p => {
              const invested = p.total_invested || 0;
              const recovered = (p.quantity || 0) * (p.sell_price || 0);
              const lost = recovered - invested;
              const lostPct = invested > 0 ? ((lost / invested) * 100).toFixed(1) : "0.0";
              return (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold font-mono text-muted-foreground">{p.symbol}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">LIQUIDADA</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.quantity} acciones @ ${p.buy_price?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-red-400">-${Math.abs(lost).toFixed(2)} USDT</p>
                    <p className="text-[11px] text-muted-foreground">Invertido: <span className="text-foreground font-mono">${invested.toFixed(2)}</span> &bull; {lostPct}%</p>
                  </div>
                </div>
              );
            })}
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
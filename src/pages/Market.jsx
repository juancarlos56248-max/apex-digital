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
  { symbol: "AAPL", name: "Apple Inc.", base: 85.0 },
  { symbol: "MSFT", name: "Microsoft Corp.", base: 90.0 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 72.0 },
  { symbol: "NVDA", name: "NVIDIA Corp.", base: 78.0 },
  { symbol: "AMZN", name: "Amazon.com", base: 88.0 },
  { symbol: "GOOGL", name: "Alphabet Inc.", base: 75.0 },
  { symbol: "META", name: "Meta Platforms", base: 80.0 },
  { symbol: "JPM", name: "JPMorgan Chase", base: 76.0 },
  { symbol: "GS", name: "Goldman Sachs", base: 82.0 },
  { symbol: "NFLX", name: "Netflix Inc.", base: 92.0 },
  { symbol: "AMD", name: "Advanced Micro Devices", base: 68.0 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", base: 79.0 },
  { symbol: "DIS", name: "Walt Disney Co.", base: 65.0 },
  { symbol: "UBER", name: "Uber Technologies", base: 62.0 },
  { symbol: "COIN", name: "Coinbase Global", base: 83.0 },
  { symbol: "PLTR", name: "Palantir Technologies", base: 58.0 },
];

const CRASHED_SYMBOLS = new Set([]);
const FIXED_PRICES = {};

function generateCandles(history) {
  const candles = [];
  const chunk = Math.max(1, Math.floor(history.length / 20));
  for (let i = 0; i < history.length - chunk; i += chunk) {
    const slice = history.slice(i, i + chunk).map(h => h.v);
    const open = slice[0];
    const close = slice[slice.length - 1];
    const high = Math.max(...slice) * (1 + Math.random() * 0.002);
    const low = Math.min(...slice) * (1 - Math.random() * 0.002);
    candles.push({ open, close, high, low });
  }
  return candles;
}

function CandlestickChart({ history }) {
  const candles = generateCandles(history);
  if (candles.length === 0) return null;

  const allValues = candles.flatMap(c => [c.high, c.low]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || 1;
  const lo = minVal - padding;
  const hi = maxVal + padding;
  const range = hi - lo;
  const H = 160;
  const totalW = candles.length * 14;
  const toY = (v) => ((hi - v) / range) * H;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border" style={{ background: '#fff', height: 180 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${totalW} ${H}`} preserveAspectRatio="none">
        {candles.map((c, i) => {
          const isUp = c.close >= c.open;
          const bullColor = "#26a69a";
          const bearColor = "#ef5350";
          const color = isUp ? bullColor : bearColor;
          const x = i * 14 + 7;
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyBot = toY(Math.min(c.open, c.close));
          const bodyH = Math.max(1.5, bodyBot - bodyTop);
          return (
            <g key={i}>
              {/* Upper wick */}
              <line x1={x} y1={toY(c.high)} x2={x} y2={bodyTop} stroke={color} strokeWidth={1.2} />
              {/* Lower wick */}
              <line x1={x} y1={bodyBot} x2={x} y2={toY(c.low)} stroke={color} strokeWidth={1.2} />
              {/* Body */}
              <rect x={x - 5.5} y={bodyTop} width={11} height={bodyH} fill={color} rx={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function useLivePrice(base, symbol) {
  const crashed = CRASHED_SYMBOLS.has(symbol);
  const fixed = FIXED_PRICES[symbol];
  const initPrice = fixed !== undefined ? fixed : crashed ? 0.01 : base;
  const [price, setPrice] = useState(initPrice);
  const [direction, setDirection] = useState(null);
  const [history, setHistory] = useState(() => Array.from({ length: 20 }, () => ({ v: initPrice })));

  useEffect(() => {
    if (fixed !== undefined) {
      const t = setInterval(() => {
        setPrice(prev => {
          const next = parseFloat((fixed + (Math.random() - 0.5) * fixed * 0.001).toFixed(4));
          setDirection(next >= prev ? "up" : "down");
          setTimeout(() => setDirection(null), 600);
          setHistory(h => [...h.slice(-49), { v: next }]);
          return next;
        });
      }, 2000);
      return () => clearInterval(t);
    }
    if (crashed) {
      const t = setInterval(() => {
        setPrice(prev => {
          const next = parseFloat(Math.min(prev + prev * 0.0005, base * 0.20).toFixed(4));
          setDirection("up");
          setTimeout(() => setDirection(null), 600);
          setHistory(h => [...h.slice(-49), { v: next }]);
          return next;
        });
      }, 3000);
      return () => clearInterval(t);
    }
    const TARGET = 200;
    const t = setInterval(() => {
      setPrice(prev => {
        // Sube hacia $200 gradualmente, con pequeña volatilidad
        const distanceToTarget = TARGET - prev;
        const drift = distanceToTarget > 0 ? distanceToTarget * 0.00008 : 0;
        const noise = (Math.random() - 0.1) * prev * 0.0001;
        const raw = prev + drift + noise;
        const next = parseFloat(Math.min(raw, TARGET).toFixed(2));
        setDirection(next >= prev ? "up" : "down");
        setTimeout(() => setDirection(null), 600);
        setHistory(h => [...h.slice(-49), { v: next }]);
        return next;
      });
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(t);
  }, [crashed, fixed, base]);

  const change = fixed !== undefined
    ? ((fixed - base) / base * 100).toFixed(2)
    : (((price - base) / base * 100) - 15).toFixed(2);
  const dir = fixed !== undefined ? "down" : direction;
  return { price, direction: dir, change, history };
}

function useLivePositionPrice(buyPrice) {
  // Inicia directamente en $0 (pérdida total)
  const [price] = useState(0.01);

  const loss = price - buyPrice;
  const lossPct = ((loss / buyPrice) * 100).toFixed(2);
  return { currentPrice: price, loss, lossPct };
}

function PositionRow({ pos, onSell }) {
  const { price: currentPrice } = useLivePrice(pos.buy_price, pos.symbol);
  const pnl = (currentPrice - pos.buy_price) * pos.quantity;
  const pnlPct = ((currentPrice - pos.buy_price) / pos.buy_price * 100).toFixed(2);
  const sellValue = pos.quantity * currentPrice;
  const isProfit = pnl >= 0;

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
        <p className={`text-sm font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>{isProfit ? '+' : ''}{pnlPct}%</p>
        <p className={`text-[11px] ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>{isProfit ? '+' : ''}${pnl.toFixed(2)} &bull; Valor: ${sellValue.toFixed(2)}</p>
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
  const { price, direction, change, history } = useLivePrice(stock.base, stock.symbol);
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
          onClick={() => onBuy(stock, price, history)}
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

  const openBuy = (stock, price, history) => {
    setBuyDialog({ stock, price, history: history || [] });
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
              const invested = (p.quantity || 0) * (p.buy_price || 0);
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
                    <p className="text-[11px] text-muted-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.quantity} acciones @ <span className="text-foreground font-mono">${p.buy_price?.toFixed(2)}</span>
                      {" "}&bull; Invertido: <span className="text-foreground font-mono">${invested.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-red-400">{lostPct}%</p>
                    <p className="text-[11px] text-red-500">-${Math.abs(lost).toFixed(2)} USDT</p>
                    <p className="text-[11px] text-muted-foreground">Recuperado: <span className="font-mono">${recovered.toFixed(2)}</span></p>
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
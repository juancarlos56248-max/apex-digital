import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Zap, Clock, Trash2 } from "lucide-react";
import moment from "moment";

const ALL_SYMBOLS = ["TSLA", "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "JPM", "GS", "NFLX", "AMD", "BRK.B", "DIS", "UBER", "COIN", "PLTR"];

export default function MarketCrashManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crashTime, setCrashTime] = useState("");
  const [message, setMessage] = useState("⚠️ Caída de mercado: posiciones liquidadas automáticamente.");
  const [selectedSymbols, setSelectedSymbols] = useState(["TSLA"]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.MarketEvent.list("-created_date", 20);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleSymbol = (sym) => {
    setSelectedSymbols(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const scheduleAll = () => setSelectedSymbols([...ALL_SYMBOLS]);

  const handleSchedule = async () => {
    if (!crashTime) { toast.error("Selecciona la fecha y hora del crash"); return; }
    setSubmitting(true);
    await base44.entities.MarketEvent.create({
      type: "crash",
      affected_symbols: selectedSymbols,
      crash_time: new Date(crashTime).toISOString(),
      status: "scheduled",
      message,
    });
    toast.success("⚠️ Crash de mercado programado");
    setCrashTime("");
    setSelectedSymbols(["TSLA"]);
    load();
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.MarketEvent.delete(id);
    toast.info("Evento eliminado");
    load();
  };

  // Set default crash time to 5 hours from now
  const setFiveHours = () => {
    const d = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setCrashTime(local);
  };

  return (
    <div className="space-y-6">
      {/* Schedule Form */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-destructive">Programar Crash de Mercado</h3>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Símbolos afectados (posiciones → $0, sin más ingresos)</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => toggleSymbol(sym)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                  selectedSymbols.includes(sym)
                    ? "bg-destructive/20 border-destructive/50 text-destructive"
                    : "bg-secondary border-border text-muted-foreground hover:border-destructive/30"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={scheduleAll} className="text-[11px] text-destructive hover:underline">Seleccionar todos</button>
            <button onClick={() => setSelectedSymbols([])} className="text-[11px] text-muted-foreground hover:underline">Limpiar</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Fecha y hora del crash</p>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={crashTime}
                onChange={e => setCrashTime(e.target.value)}
                className="bg-secondary border-border text-sm"
              />
              <Button size="sm" variant="outline" onClick={setFiveHours} className="flex-shrink-0 border-border text-xs gap-1">
                <Clock className="w-3 h-3" /> +5h
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Mensaje al usuario</p>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleSchedule}
          disabled={submitting || selectedSymbols.length === 0}
          className="bg-destructive hover:bg-destructive/90 text-white font-semibold gap-2"
        >
          <Zap className="w-4 h-4" /> Programar Crash
        </Button>
      </div>

      {/* Events List */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <p className="text-sm font-semibold">Eventos Programados</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Sin eventos programados</p>
        ) : (
          <div className="divide-y divide-border">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      ev.status === "scheduled" ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive"
                    }`}>
                      {ev.status === "scheduled" ? "Programado" : "Ejecutado"}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{moment(ev.crash_time).format("DD/MM/YY HH:mm")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Símbolos: <span className="text-foreground font-mono">{ev.affected_symbols?.length > 0 ? ev.affected_symbols.join(", ") : "TODOS"}</span>
                  </p>
                </div>
                {ev.status === "scheduled" && (
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(ev.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
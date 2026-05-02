import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, RefreshCcw, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function SupportManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.SupportTicket.list("-created_date", 100);
    setTickets(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (ticket) => {
    const reply = replyText[ticket.id]?.trim();
    if (!reply) return;
    setSending(prev => ({ ...prev, [ticket.id]: true }));
    await base44.entities.SupportTicket.update(ticket.id, { reply, status: "replied" });
    toast.success("Respuesta enviada");
    setReplyText(prev => ({ ...prev, [ticket.id]: "" }));
    setSending(prev => ({ ...prev, [ticket.id]: false }));
    load();
  };

  const handleClose = async (ticket) => {
    await base44.entities.SupportTicket.update(ticket.id, { status: "closed" });
    toast.info("Ticket cerrado");
    load();
  };

  const openTickets = tickets.filter(t => t.status !== "closed");
  const closedTickets = tickets.filter(t => t.status === "closed");

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Centro de Soporte</h3>
              <p className="text-[11px] text-muted-foreground">
                {openTickets.length} tickets abiertos · {closedTickets.length} cerrados
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" /> Refrescar
          </Button>
        </div>

        <div className="divide-y divide-border">
          {openTickets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">No hay tickets abiertos</p>
          )}
          {openTickets.map((tk) => (
            <div key={tk.id} className="px-5 py-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{tk.user_name || tk.user_email}</p>
                  <p className="text-[11px] text-muted-foreground">{tk.user_email} · {moment(tk.created_date).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                  tk.status === "open" ? "bg-yellow-500/10 text-yellow-400" :
                  tk.status === "replied" ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {tk.status === "open" ? "⏳ Abierto" : tk.status === "replied" ? "✅ Respondido" : "Cerrado"}
                </span>
              </div>

              {/* User message */}
              <div className="rounded-lg bg-secondary/40 border border-border px-4 py-3">
                <p className="text-[11px] text-muted-foreground mb-1">Mensaje del usuario:</p>
                <p className="text-sm text-foreground leading-relaxed">{tk.message}</p>
              </div>

              {/* Existing reply */}
              {tk.reply && (
                <div className="rounded-lg bg-gold/5 border border-gold/20 px-4 py-3">
                  <p className="text-[11px] text-gold mb-1">Tu respuesta:</p>
                  <p className="text-sm text-foreground leading-relaxed">{tk.reply}</p>
                </div>
              )}

              {/* Reply input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText[tk.id] || ""}
                  onChange={e => setReplyText(prev => ({ ...prev, [tk.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleReply(tk)}
                  placeholder={tk.reply ? "Enviar otra respuesta..." : "Escribe tu respuesta..."}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold/40 transition-colors placeholder:text-muted-foreground"
                />
                <Button
                  size="sm"
                  onClick={() => handleReply(tk)}
                  disabled={sending[tk.id] || !replyText[tk.id]?.trim()}
                  className="bg-gold hover:bg-gold-dark text-black gap-1.5 h-9"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending[tk.id] ? "..." : "Enviar"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleClose(tk)}
                  className="h-9 text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cerrar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closed tickets */}
      {closedTickets.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground">Tickets Cerrados ({closedTickets.length})</p>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto">
            {closedTickets.map(tk => (
              <div key={tk.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium">{tk.user_email}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{tk.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{moment(tk.created_date).format("DD/MM HH:mm")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
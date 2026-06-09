import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Send, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function InlineSupportChat() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.SupportTicket.filter({ user_email: user.email }, "created_date", 100).then(setTickets);
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === "create" || event.type === "update") {
        setTickets(prev => {
          const exists = prev.find(p => p.id === event.id);
          if (exists) return prev.map(p => p.id === event.id ? event.data : p);
          if (event.data?.user_email === user.email) return [...prev, event.data];
          return prev;
        });
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [tickets]);

  const handleSend = async () => {
    if (!message.trim() || !user || sending) return;
    setSending(true);
    await base44.entities.SupportTicket.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      message: message.trim(),
      status: "open",
    });
    setMessage("");
    setSending(false);
  };

  if (!user) return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
      Inicia sesión para usar el chat de soporte.
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: 520 }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/15 to-transparent border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
          <Headphones className="w-4 h-4 text-gold" />
        </div>
        <div>
          <p className="text-sm font-bold">Soporte APEX</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">En línea · Respuesta &lt; 2 horas</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/20" style={{ minHeight: 0 }}>
        {/* Welcome */}
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px] font-black text-gold">A</span>
          </div>
          <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
            <p className="text-[10px] text-gold font-semibold mb-1">Soporte APEX</p>
            <p className="text-xs leading-relaxed">
              ¡Hola {user.full_name?.split(" ")[0] || "Inversor"}! 👋 ¿En qué podemos ayudarte hoy? Escríbenos y te responderemos lo antes posible.
            </p>
          </div>
        </div>

        {tickets.map(tk => (
          <div key={tk.id} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] space-y-1">
                <div className="bg-gold/20 border border-gold/25 rounded-2xl rounded-tr-sm px-3 py-2.5">
                  <p className="text-xs leading-relaxed">{tk.message}</p>
                </div>
                <p className="text-[10px] text-muted-foreground text-right px-1">
                  {formatDistanceToNow(new Date(tk.created_date), { addSuffix: true, locale: es })}
                </p>
              </div>
            </div>

            {/* Reply */}
            {tk.reply ? (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-gold">A</span>
                </div>
                <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                  <p className="text-[10px] text-gold font-semibold mb-1">Soporte APEX</p>
                  <p className="text-xs leading-relaxed">{tk.reply}</p>
                </div>
              </div>
            ) : tk.status === "open" && (
              <div className="flex gap-2">
                <div className="flex gap-1 px-3 py-2 bg-secondary border border-border rounded-full">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2 bg-card flex-shrink-0">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Escribe tu mensaje..."
          maxLength={500}
          className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/40 transition-colors placeholder:text-muted-foreground"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="bg-gold hover:bg-gold-dark text-black flex-shrink-0 w-9 h-9 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
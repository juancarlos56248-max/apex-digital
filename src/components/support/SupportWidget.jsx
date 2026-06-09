import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [seenReplied, setSeenReplied] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const t = await base44.entities.SupportTicket.filter({ user_email: user.email }, "created_date", 100);
      setTickets(t);
      if (!open) {
        const newReplies = t.filter(tk => tk.reply && !seenReplied.has(tk.id));
        setUnread(newReplies.length);
      }
    };
    load();
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === "create" || event.type === "update") {
        setTickets(prev => {
          const exists = prev.find(p => p.id === event.id);
          if (exists) return prev.map(p => p.id === event.id ? event.data : p);
          if (event.data?.user_email === user.email) return [...prev, event.data];
          return prev;
        });
        if (event.data?.reply && event.data?.user_email === user.email && !open) {
          setUnread(n => n + 1);
        }
      }
    });
    return unsub;
  }, [user, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      const replied = new Set(tickets.filter(t => t.reply).map(t => t.id));
      setSeenReplied(replied);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [tickets, open]);

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

  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-3 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[calc(100vw-2rem)] max-w-[340px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, calc(100dvh - 160px))" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/20 to-transparent border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold">Soporte APEX</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400">En línea · Respuesta rápida</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30" style={{ minHeight: 0 }}>
              {/* Welcome message */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-gold">A</span>
                </div>
                <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                  <p className="text-[10px] text-gold font-semibold mb-1">Soporte APEX</p>
                  <p className="text-xs text-foreground leading-relaxed">
                    ¡Hola {user.full_name?.split(" ")[0] || "Inversor"}! 👋 ¿En qué podemos ayudarte hoy?
                  </p>
                </div>
              </div>

              {tickets.map((tk) => (
                <div key={tk.id} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] space-y-1">
                      <div className="bg-gold/20 border border-gold/25 rounded-2xl rounded-tr-sm px-3 py-2.5">
                        <p className="text-xs text-foreground leading-relaxed">{tk.message}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right px-1">
                        {formatDistanceToNow(new Date(tk.created_date), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>

                  {/* Admin reply or pending */}
                  {tk.reply ? (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-gold">A</span>
                      </div>
                      <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                        <p className="text-[10px] text-gold font-semibold mb-1">Soporte APEX</p>
                        <p className="text-xs text-foreground leading-relaxed">{tk.reply}</p>
                      </div>
                    </div>
                  ) : tk.status === "open" && (
                    <div className="flex gap-2">
                      <div className="flex gap-1 px-3 py-2 bg-secondary border border-border rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(prev => !prev)}
        className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gold hover:bg-gold-dark text-black shadow-xl shadow-gold/30 flex items-center justify-center transition-colors"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-6 h-6" /></motion.div>
            : <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle className="w-6 h-6" /></motion.div>
          }
        </AnimatePresence>
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
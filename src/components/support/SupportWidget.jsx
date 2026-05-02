import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = () => base44.entities.SupportTicket.filter({ user_email: user.email }, "created_date", 50).then(t => {
      setTickets(t);
      if (!open) {
        const newReplies = t.filter(tk => tk.status === "replied" && tk.reply);
        setUnread(newReplies.length);
      }
    });
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [user, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, tickets]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    await base44.entities.SupportTicket.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      message: message.trim(),
      status: "open",
    });
    setMessage("");
    const updated = await base44.entities.SupportTicket.filter({ user_email: user.email }, "created_date", 50);
    setTickets(updated);
    setSending(false);
    toast.success("Mensaje enviado. Te responderemos pronto.");
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/20 to-gold/5 border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-sm font-black text-gold">A</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Soporte APEX</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400">En línea</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-3 bg-background/50">
              {tickets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">¡Hola! ¿En qué podemos ayudarte?</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Escribe tu consulta abajo.</p>
                </div>
              )}
              {tickets.map((tk) => (
                <div key={tk.id} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gold/20 border border-gold/20 rounded-2xl rounded-tr-sm px-3 py-2">
                      <p className="text-[12px] text-foreground leading-relaxed">{tk.message}</p>
                    </div>
                  </div>
                  {/* Admin reply */}
                  {tk.reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2">
                        <p className="text-[10px] text-gold font-semibold mb-1">Soporte APEX</p>
                        <p className="text-[12px] text-foreground leading-relaxed">{tk.reply}</p>
                      </div>
                    </div>
                  )}
                  {tk.status === "open" && !tk.reply && (
                    <div className="flex justify-start">
                      <p className="text-[10px] text-muted-foreground px-1">Respondiendo pronto...</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 bg-card">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Escribe tu mensaje..."
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

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(prev => !prev)}
        className="relative w-14 h-14 rounded-full bg-gold hover:bg-gold-dark text-black shadow-xl shadow-gold/30 flex items-center justify-center transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}
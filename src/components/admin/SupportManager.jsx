import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, CheckCircle2, ChevronLeft, Circle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function SupportManager() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [all, usersResponse] = await Promise.all([
        base44.entities.SupportTicket.list("-created_date", 200),
        base44.functions.invoke("adminListarUsuarios", {}),
      ]);
      setTickets(all);
      setUsers((usersResponse.data?.users || []).filter(user => user.role !== "admin"));
      setLoading(false);
    };
    load();
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === "create") {
        setTickets(prev => prev.some(t => t.id === event.id) ? prev : [event.data, ...prev]);
      } else if (event.type === "update") {
        setTickets(prev => prev.map(t => t.id === event.id ? event.data : t));
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [selectedUser, tickets]);

  // Group tickets by user
  const byUser = tickets.reduce((acc, tk) => {
    const key = tk.user_email;
    if (!acc[key]) acc[key] = { email: key, name: tk.user_name || key, messages: [] };
    acc[key].messages.push(tk);
    return acc;
  }, {});

  users.forEach(user => {
    if (!byUser[user.email]) {
      byUser[user.email] = { email: user.email, name: user.full_name || user.email, messages: [] };
    }
  });

  const conversations = Object.values(byUser).map(u => {
    const messages = u.messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return {
      ...u,
      messages,
      lastMessage: messages[messages.length - 1],
      unread: messages.filter(t => t.status === "open" && !t.reply).length,
    };
  }).sort((a, b) => new Date(b.lastMessage?.created_date || 0) - new Date(a.lastMessage?.created_date || 0));

  const currentConv = selectedUser ? byUser[selectedUser] : null;
  const currentMessages = currentConv?.messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)) || [];

  const handleReply = async () => {
    if (!replyText.trim() || !selectedUser || sending) return;
    setSending(true);
    // Siempre crear un ticket nuevo para que aparezca al final de la conversación
    const created = await base44.entities.SupportTicket.create({
      user_email: selectedUser,
      user_name: currentConv?.name || selectedUser,
      message: "—",
      reply: replyText.trim(),
      status: "replied",
    });
    setTickets(prev => prev.some(t => t.id === created.id) ? prev : [created, ...prev]);
    toast.success("Respuesta enviada");
    setReplyText("");
    setSending(false);
  };

  const handleClose = async (ticketId) => {
    await base44.entities.SupportTicket.update(ticketId, { status: "closed" });
  };

  const getInitials = (name) =>
    name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: "560px" }}>
      <div className="flex h-full">
        {/* Sidebar: conversation list */}
        <div className={`w-full md:w-72 flex-shrink-0 border-r border-border flex flex-col ${selectedUser ? "hidden md:flex" : "flex"}`}>
          <div className="px-4 py-3 border-b border-border flex items-center gap-2.5 flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold">Soporte</span>
            {totalUnread > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-10">Sin conversaciones</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.email}
                onClick={() => setSelectedUser(conv.email)}
                className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors hover:bg-secondary/50 ${selectedUser === conv.email ? "bg-gold/5 border-l-2 border-gold" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                  {getInitials(conv.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium truncate">{conv.name}</p>
                    {conv.lastMessage && (
                      <p className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessage.created_date), { locale: es })}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {conv.lastMessage ? (conv.lastMessage.reply || conv.lastMessage.message) : "Iniciar conversación"}
                  </p>
                  {conv.unread > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Circle className="w-2 h-2 fill-gold text-gold" />
                      <span className="text-[10px] text-gold font-semibold">{conv.unread} sin responder</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex flex-col ${!selectedUser ? "hidden md:flex items-center justify-center" : "flex"}`}>
          {!selectedUser ? (
            <div className="text-center text-muted-foreground p-8">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0 bg-card">
                <button onClick={() => setSelectedUser(null)} className="md:hidden text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {getInitials(currentConv?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{currentConv?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{selectedUser}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/20">
                {currentMessages.map((tk) => (
                  <div key={tk.id} className="space-y-2">
                    {/* User message — izquierda */}
                    {tk.message !== "—" && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-muted-foreground">
                          {getInitials(currentConv?.name)}
                        </div>
                        <div className="max-w-[75%] space-y-1">
                          <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3 py-2">
                            <p className="text-xs text-foreground leading-relaxed">{tk.message}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground px-1">
                            {formatDistanceToNow(new Date(tk.created_date), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Reply — derecha (admin) */}
                    {tk.reply && (
                      <div className="flex justify-end gap-2">
                        <div className="max-w-[75%] space-y-1">
                          <div className="bg-gold/10 border border-gold/20 rounded-2xl rounded-tr-sm px-3 py-2">
                            <p className="text-[10px] text-gold font-semibold mb-0.5">Tú (Soporte APEX)</p>
                            <p className="text-xs text-foreground leading-relaxed">{tk.reply}</p>
                          </div>
                          <div className="flex items-center justify-end gap-2 px-1">
                            {tk.status !== "closed" && (
                              <button
                                onClick={() => handleClose(tk.id)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-emerald-400 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Cerrar
                              </button>
                            )}
                            {tk.status === "closed" && (
                              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Cerrado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-gold">A</span>
                        </div>
                      </div>
                    )}
                    {!tk.reply && tk.status === "open" && (
                      <div className="flex justify-end">
                        <span className="text-[10px] text-yellow-500/70">⏳ Sin respuesta</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="border-t border-border p-3 flex gap-2 bg-card flex-shrink-0">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/40 transition-colors placeholder:text-muted-foreground"
                />
                <Button
                  size="icon"
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="bg-gold hover:bg-gold-dark text-black w-9 h-9 rounded-xl flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
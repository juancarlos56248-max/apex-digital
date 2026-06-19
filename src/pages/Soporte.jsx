import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, ChevronDown, MessageCircle, Clock, Shield, Zap, Mail, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import InlineSupportChat from "../components/support/InlineSupportChat";

const FAQS = [
  {
    cat: "Inversiones",
    items: [
      { q: "¿Cómo funciona el rendimiento diario?", a: "Los nodos de inversión generan un rendimiento fijo según el tier seleccionado. Los dividendos se acreditan automáticamente cada 24 horas en tu balance disponible, los 7 días de la semana." },
      { q: "¿Cuánto tiempo dura un nodo de inversión?", a: "Los nodos no tienen fecha de vencimiento fija. Permanecen activos mientras la inversión esté en estado 'activo'. Puedes solicitar el cierre en cualquier momento desde la sección Inversiones." },
      { q: "¿Puedo tener varios nodos activos a la vez?", a: "Sí. Puedes activar múltiples nodos, incluso de distintos tiers, y los rendimientos se suman automáticamente." },
      { q: "¿Qué pasa si el mercado cae?", a: "APEX Digital opera con algoritmos de cobertura que protegen el capital base. En eventos extremos, el equipo de riesgo puede ajustar posiciones temporalmente para preservar el capital." },
    ]
  },
  {
    cat: "Depósitos",
    items: [
      { q: "¿Qué métodos de depósito aceptan?", a: "Aceptamos USDT en redes TRC20, ERC20 y BEP20. Enviamos una dirección de depósito única por operación para garantizar la trazabilidad." },
      { q: "¿Cuánto tarda en acreditarse mi depósito?", a: "Los depósitos son verificados manualmente por nuestro equipo de cumplimiento. El tiempo estimado es de 1 a 6 horas hábiles tras confirmar la transacción en blockchain." },
      { q: "¿Cuál es el depósito mínimo?", a: "El depósito mínimo para activar el tier Starter es de 100 USDT. No existe un mínimo para depósitos adicionales una vez que tienes una inversión activa." },
    ]
  },
  {
    cat: "Retiros",
    items: [
      { q: "¿Cuánto tiempo demora un retiro?", a: "Los retiros pasan por verificación de cumplimiento. El tiempo estimado es de 24 a 72 horas hábiles desde que se aprueba la solicitud." },
      { q: "¿Por qué existe la comisión del 8%?", a: "La comisión de red cubre los costos de procesamiento en blockchain (gas fees), verificación de cumplimiento (KYC/AML) y seguridad de la transacción. No existen cargos adicionales ocultos." },
      { q: "¿Por qué solo un retiro cada 24 horas?", a: "Esta restricción garantiza la estabilidad de los nodos de inversión y permite al equipo de cumplimiento procesar correctamente cada solicitud con los estándares de seguridad requeridos." },
      { q: "¿El bono de bienvenida de $5 es retirable?", a: "No. El bono de bienvenida está diseñado exclusivamente para que puedas explorar la plataforma e iniciar tu primera inversión. Solo los fondos generados a partir de inversiones reales son retirables." },
    ]
  },
  {
    cat: "Cuenta y Seguridad",
    items: [
      { q: "¿Cómo funciona el programa de referidos?", a: "Al compartir tu código único obtienes una comisión sobre las inversiones que activen tus referidos. Los bonos se acreditan automáticamente una vez que el referido activa su primer nodo." },
      { q: "¿Mis datos están seguros?", a: "Sí. APEX Digital utiliza encriptación de extremo a extremo, autenticación segura y protocolos de cumplimiento internacionales para proteger tu información y tus fondos." },
      { q: "¿Cómo actualizo mi información de perfil?", a: "Puedes actualizar tu nombre, teléfono y DNI desde la sección de perfil. Algunos cambios pueden requerir verificación adicional por parte del equipo de cumplimiento." },
    ]
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-secondary/40 transition-colors gap-3"
      >
        <span className="text-sm font-medium leading-snug">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-secondary/20">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: Clock, label: "Respuesta rápida", desc: "Tiempo medio < 2 horas" },
  { icon: Shield, label: "Soporte seguro", desc: "Canal verificado y cifrado" },
  { icon: Zap, label: "Disponible 7/7", desc: "Lunes a domingo" },
];

export default function Soporte() {
  const [activeTab, setActiveTab] = useState("faq");
  const [activeCat, setActiveCat] = useState(FAQS[0].cat);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Centro de Atención</h1>
            <p className="text-xs text-muted-foreground">Soporte, preguntas frecuentes y contacto directo</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex gap-3 mt-4">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-2">
              <h.icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">{h.label}</p>
                <p className="text-[10px] text-muted-foreground">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Admin shortcut */}
      {isAdmin && (
        <Link to="/admin" state={{ section: "support" }}>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <div>
                <p className="text-sm font-bold text-gold">Panel de Soporte — Admin</p>
                <p className="text-xs text-muted-foreground">Ver y responder mensajes de usuarios</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gold" />
          </div>
        </Link>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        {[
          { id: "faq", label: "Preguntas Frecuentes", icon: BookOpen },
          { id: "chat", label: "Chat con Soporte", icon: MessageCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-card border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "faq" && (
          <motion.div key="faq" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {FAQS.map(cat => (
                <button
                  key={cat.cat}
                  onClick={() => setActiveCat(cat.cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCat === cat.cat
                      ? "bg-gold/15 border-gold/40 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/20 hover:text-foreground"
                  }`}
                >
                  {cat.cat}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="space-y-2">
              {FAQS.find(c => c.cat === activeCat)?.items.map((item, i) => (
                <FaqItem key={i} item={item} />
              ))}
            </div>

            {/* CTA to chat */}
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">¿No encontraste tu respuesta?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Escríbenos directamente y te respondemos en menos de 2 horas.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab("chat")}
                className="bg-gold hover:bg-gold-dark text-black font-bold gap-1.5 flex-shrink-0"
              >
                Ir al chat <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            {/* Email contact */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Contacto por correo</p>
                <p className="text-xs text-muted-foreground">soporte@pristineapex.pro · Respuesta en 24 h hábiles</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <InlineSupportChat />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
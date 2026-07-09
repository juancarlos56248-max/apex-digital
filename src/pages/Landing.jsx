import { useEffect, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Clock, ArrowRight, Lock, Globe, CheckCircle, Users, DollarSign, BarChart3, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { base44 } from "@/api/base44Client";

const WithdrawalTicker = lazy(() => import("../components/landing/WithdrawalTicker"));

const features = [
  { icon: Shield, title: "Seguridad Bancaria", desc: "Protocolos de cumplimiento institucional con auditoría en tiempo real y cifrado de grado militar.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: TrendingUp, title: "Trading Algorítmico", desc: "Estrategias HFT optimizadas por IA ejecutando miles de operaciones por segundo.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Clock, title: "Dividendos 24h", desc: "Acreditación automática de rendimientos cada ciclo de 24 horas sin excepción.", color: "text-gold", bg: "bg-gold/10" },
  { icon: Globe, title: "Protocolo Singapur", desc: "Marco regulatorio de protección de activos digitales de última generación.", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const stats = [
  { icon: Users, value: "12,400+", label: "Inversores activos", color: "text-gold" },
  { icon: DollarSign, value: "$48M+", label: "Capital gestionado", color: "text-emerald-400" },
  { icon: BarChart3, value: "10%", label: "Rendimiento diario", color: "text-blue-400" },
  { icon: CheckCircle, value: "99.97%", label: "Uptime garantizado", color: "text-purple-400" },
];

const tiers = [
  { name: "Starter", range: "$5 – $499", daily: "10%", color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400" },
  { name: "Advance", range: "$500 – $1,999", daily: "10%", color: "from-blue-500/20 to-transparent", border: "border-blue-500/20", badge: "bg-blue-500/10 text-blue-400", popular: true },
  { name: "Elite", range: "$2,000 – $9,999", daily: "10%", color: "from-purple-500/20 to-transparent", border: "border-purple-500/20", badge: "bg-purple-500/10 text-purple-400" },
  { name: "Institutional", range: "$10,000+", daily: "10%", color: "from-gold/20 to-transparent", border: "border-gold/20", badge: "bg-gold/10 text-gold" },
];

function generateChartData() {
  const data = [];
  let value = 1000;
  for (let i = 30; i >= 0; i--) {
    value = value + value * 0.10 * (0.8 + Math.random() * 0.4);
    data.push({ v: Math.round(value) });
  }
  return data;
}

export default function Landing() {
  const [chartData] = useState(generateChartData);
  const [isAuth, setIsAuth] = useState(() => {
    // Instant check from session storage to avoid flicker on returning users
    try { return !!sessionStorage.getItem("apex_auth_hint"); } catch { return false; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("apex_ref_code", refCode);
      // Keep ref in sessionStorage so it survives a login redirect
      try { sessionStorage.setItem("apex_ref_code", refCode); } catch {}
    }

    // Check auth in background — store hint for instant next load
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      try {
        if (auth) sessionStorage.setItem("apex_auth_hint", "1");
        else sessionStorage.removeItem("apex_auth_hint");
      } catch {}
    });
  }, []);

  const handleCTA = () => {
    if (isAuth) {
      navigate("/dashboard");
    } else {
      // Preserve ref code across the login redirect
      const refCode = localStorage.getItem("apex_ref_code") || new URLSearchParams(window.location.search).get("ref");
      const next = refCode ? `/?ref=${refCode}` : "/dashboard";
      base44.auth.redirectToLogin(next);
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter overflow-x-hidden">
      {/* Maintenance Banner */}
      <div className="w-full bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2.5 flex items-center justify-center gap-2.5 text-center">
        <Wrench className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 animate-pulse" />
        <p className="text-xs font-semibold text-yellow-300">
          🔧 El mantenimiento de seguridad está tomando más tiempo de lo habitual. Solicitamos su comprensión — les informaremos cuando finalice. Gracias por su paciencia.
        </p>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/20">
              <span className="text-black font-black text-sm">A</span>
            </div>
            <div>
              <span className="text-gold font-black tracking-wider text-base">APEX</span>
              <span className="text-[10px] text-muted-foreground ml-1.5 tracking-[0.2em] uppercase font-medium">Digital</span>
            </div>
          </div>
          <Button size="sm" onClick={handleCTA} className="bg-gold hover:bg-gold-dark text-black font-bold text-xs px-5 shadow-lg shadow-gold/20">
            {isAuth ? "Ir al Panel" : "Registrarse"} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-12 px-5 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/6 rounded-full blur-[160px]" />
          <div className="absolute top-32 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Lock className="w-3 h-3 text-gold" />
              <span className="text-[10px] text-gold font-semibold tracking-wide">Protocolo de Seguridad · Singapur</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4">
              <span className="block text-foreground">Inversión</span>
              <span className="block text-foreground">Inteligente</span>
              <span className="block text-gold-gradient mt-0.5">Sin Límites</span>
            </h1>

            {/* Big % stat */}
            <div className="inline-flex flex-col items-center my-4">
              <div className="flex items-end gap-2 leading-none">
                <span className="text-5xl md:text-7xl font-black text-gold-gradient tracking-tighter">+10%</span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground font-medium tracking-widest uppercase mt-1">rendimiento diario desde</span>
            </div>

            {/* Subheadline */}
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-3 leading-relaxed">
              Accede a estrategias algorítmicas de alto rendimiento desde{" "}
              <span className="relative inline-block">
                <span className="text-foreground font-black text-base md:text-lg">+10% diario</span>
                <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-gold to-gold-light rounded-full" />
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-md mx-auto mb-6">
              Infraestructura institucional, disponible para todos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
              <Button size="md" onClick={handleCTA} className="flex-1 bg-gold hover:bg-gold-dark text-black font-bold h-10 text-sm shadow-lg shadow-gold/15 rounded-xl">
                {isAuth ? "Ir al Panel" : "Comenzar Ahora"} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Link to="/terms" className="flex-1">
                <Button size="md" variant="ghost" className="w-full h-10 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl">
                  Ver Protocolo
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>SSL 256-bit</span>
              </div>
              <div className="w-px h-2.5 bg-border" />
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-gold" />
                <span>12,400+ inversores</span>
              </div>
              <div className="w-px h-2.5 bg-border" />
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Singapur</span>
              </div>
            </div>
          </motion.div>

          {/* Mini Chart Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
            className="mt-8 mx-auto max-w-xl"
          >
            <div className="rounded-xl border border-gold/20 bg-card/60 backdrop-blur-sm p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Simulación de portafolio</p>
                  <p className="text-lg font-black font-mono text-gold">${chartData[chartData.length - 1]?.v?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    ▲ +{(((chartData[chartData.length - 1]?.v - chartData[0]?.v) / chartData[0]?.v) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(40,52%,56%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(40,52%,56%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ background: "hsl(0,0%,6%)", border: "1px solid hsl(0,0%,15%)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v) => [`$${v.toLocaleString()}`, "Valor"]}
                    />
                    <Area type="monotone" dataKey="v" stroke="hsl(40,52%,56%)" strokeWidth={2.5} fill="url(#heroGold)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-4 text-center hover:border-gold/20 transition-all"
            >
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Withdrawal Ticker */}
      <section className="px-5 pb-10">
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<div className="h-32" />}>
            <WithdrawalTicker />
          </Suspense>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-4xl font-black mb-3">Infraestructura de Élite</h2>
            <p className="text-sm text-muted-foreground">Tecnología institucional. Acceso democratizado.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-5 hover:border-gold/20 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Preview */}
      <section className="px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-4xl font-black mb-3">Nodos de Liquidez</h2>
            <p className="text-sm text-muted-foreground">Elige el plan que se adapte a tu capital</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border ${t.border} bg-gradient-to-b ${t.color} bg-card p-4 text-center`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-black text-[10px] font-bold">
                    POPULAR
                  </div>
                )}
                <p className="text-sm font-bold mb-1">{t.name}</p>
                <p className="text-[10px] text-muted-foreground mb-3">{t.range} USDT</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black ${t.badge}`}>
                  +{t.daily}/día
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button onClick={handleCTA} className="bg-gold hover:bg-gold-dark text-black font-bold px-8 shadow-lg shadow-gold/20">
              {isAuth ? "Ir al Panel" : "Comenzar Ahora"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 via-gold/3 to-transparent p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-gold mb-2">Seguridad de Grado Bancario</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nuestra restricción de retiro de 24 horas garantiza que los nodos de inversión mantengan su potencia de cálculo, asegurando retornos estables y una gestión de riesgo institucional avalada por el Protocolo de Singapur.
              </p>
            </div>
            <Button onClick={handleCTA} className="flex-shrink-0 bg-gold hover:bg-gold-dark text-black font-bold whitespace-nowrap shadow-lg shadow-gold/20">
              {isAuth ? "Ir al Panel" : "Empezar ahora"}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About / Reseña */}
      <section className="px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8 md:p-10 space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-3">¿A qué se dedica APEX?</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                En APEX, la inversión de cada usuario forma parte de un sistema de gestión conjunta orientado a participar en los mercados financieros, principalmente en la compra y venta de acciones. El objetivo es identificar oportunidades que permitan generar rendimientos en función del comportamiento del mercado.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { n: 1, title: "Recepción de fondos", desc: "El usuario realiza un depósito desde montos accesibles, el cual se integra al capital gestionado por la plataforma." },
                { n: 2, title: "Distribución estratégica", desc: "Los fondos son asignados a distintos activos financieros, buscando diversificación y mejores oportunidades de rendimiento." },
                { n: 3, title: "Operaciones en el mercado", desc: "Se ejecutan compras y ventas de acciones basadas en análisis de mercado, tendencias y condiciones económicas." },
                { n: 4, title: "Gestión y monitoreo", desc: "Las operaciones son supervisadas continuamente para ajustar estrategias según el comportamiento del mercado." },
                { n: 5, title: "Generación de resultados", desc: "Dependiendo del desempeño de las inversiones, se obtienen resultados que pueden ser positivos o variables." },
                { n: 6, title: "Asignación de ganancias", desc: "Los resultados se reflejan en la cuenta del usuario de acuerdo a su participación dentro del sistema." },
                { n: 7, title: "Disponibilidad de fondos", desc: "El usuario puede solicitar retiros según las condiciones establecidas por la plataforma." },
              ].map((item) => (
                <div key={item.n} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-secondary/30 hover:border-gold/20 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gold text-black text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{item.n}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gold/20 bg-gold/5 p-5 text-center">
              <p className="text-sm font-bold text-gold mb-2">📈 APEX busca ofrecer un sistema accesible</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                donde los usuarios puedan participar en el mercado sin necesidad de conocimientos avanzados, contando con herramientas de seguimiento dentro de la plataforma.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-black text-[10px]">A</span>
            </div>
            <span className="text-sm font-bold text-gold">APEX Digital</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Apex Digital. Todos los derechos reservados.</p>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            Términos y Condiciones
          </Link>
        </div>
      </footer>
    </div>
  );
}
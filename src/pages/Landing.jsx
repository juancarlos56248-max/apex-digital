import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Clock, Zap, ArrowRight, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Shield, title: "Seguridad Bancaria", desc: "Protocolos de cumplimiento de grado institucional con auditoría en tiempo real." },
  { icon: TrendingUp, title: "Trading Algorítmico", desc: "Estrategias HFT optimizadas por IA para maximizar rendimientos." },
  { icon: Clock, title: "Dividendos 24h", desc: "Acreditación automática de rendimientos cada ciclo de 24 horas." },
  { icon: Globe, title: "Protocolo Singapur", desc: "Marco regulatorio de protección de activos digitales de última generación." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold">A</span>
            </div>
            <div>
              <span className="text-gold font-bold tracking-tight">APEX</span>
              <span className="text-[10px] text-muted-foreground ml-2 tracking-[0.15em] uppercase">Digital</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold">
                Ingresar
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-black font-semibold">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8">
              <Lock className="w-3 h-3 text-gold" />
              <span className="text-xs text-gold font-medium">Protocolo de Seguridad de Singapur</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Gestión Institucional
              <br />
              <span className="text-gold-gradient">al Alcance de Todos</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              En Apex Digital, protegemos la estabilidad de nuestro ecosistema mediante protocolos de liquidez de última generación. Bienvenido a la cúspice de las finanzas digitales.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold px-8 h-12 text-base">
                  Iniciar Inversión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/terms">
                <Button size="lg" variant="outline" className="border-border hover:border-gold/30 h-12 px-8 text-base">
                  Protocolo de Seguridad
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Note */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gold/20 bg-gold/5 p-8 md:p-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold mb-2">Reseña de Seguridad</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nuestra restricción de retiro de 24 horas asegura que los nodos de inversión mantengan su potencia de cálculo, garantizando retornos estables y una gestión de riesgo de grado bancario. Cada transacción es auditada mediante protocolos de cumplimiento antes de su ejecución final.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Infraestructura de Élite</h2>
            <p className="text-muted-foreground">Tecnología institucional, acceso democratizado</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 hover:border-gold/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <f.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="text-sm text-muted-foreground">© 2026 Apex Digital. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-gold transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
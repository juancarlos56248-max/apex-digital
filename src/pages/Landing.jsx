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
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <div>
              <span className="text-gold font-bold tracking-tight">APEX</span>
              <span className="text-[10px] text-muted-foreground ml-1.5 tracking-[0.15em] uppercase">Digital</span>
            </div>
          </div>
          <Link to="/dashboard">
            <Button size="sm" className="bg-gold hover:bg-gold-dark text-black font-semibold text-xs px-4">
              Ingresar
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-14 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-6">
              <Lock className="w-3 h-3 text-gold" />
              <span className="text-[11px] text-gold font-medium">Protocolo de Seguridad de Singapur</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
              Gestión Institucional
              <br />
              <span className="text-gold-gradient">al Alcance de Todos</span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed px-2">
              En Apex Digital, protegemos la estabilidad de nuestro ecosistema mediante protocolos de liquidez de última generación.
            </p>

            <div className="flex flex-col gap-3 px-2">
              <Link to="/dashboard" className="w-full">
                <Button size="lg" className="w-full bg-gold hover:bg-gold-dark text-black font-semibold h-12 text-base">
                  Iniciar Inversión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/terms" className="w-full">
                <Button size="lg" variant="outline" className="w-full border-border hover:border-gold/30 h-12 text-base">
                  Protocolo de Seguridad
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Note */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gold/20 bg-gold/5 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gold mb-1.5">Reseña de Seguridad</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nuestra restricción de retiro de 24 horas asegura que los nodos de inversión mantengan su potencia de cálculo, garantizando retornos estables y una gestión de riesgo de grado bancario.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Infraestructura de Élite</h2>
            <p className="text-sm text-muted-foreground">Tecnología institucional, acceso democratizado</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-gold/20 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <f.icon className="w-4 h-4 text-gold" />
                </div>
                <h3 className="text-xs font-semibold mb-1.5">{f.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">A</span>
            </div>
            <span className="text-xs text-muted-foreground">© 2026 Apex Digital. Todos los derechos reservados.</span>
          </div>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            Términos y Condiciones
          </Link>
        </div>
      </footer>
    </div>
  );
}
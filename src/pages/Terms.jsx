import { motion } from "framer-motion";
import { Shield, Lock, Clock, Globe, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Shield,
    title: "Protocolo de Seguridad de Singapur",
    content: "Apex Digital opera bajo el marco regulatorio de protección de activos digitales de Singapur (MAS - Monetary Authority of Singapore). Todos los activos digitales son custodiados mediante contratos inteligentes auditados y protocolos de seguridad multi-firma (multisig) que requieren múltiples autorizaciones para cualquier movimiento de fondos.",
  },
  {
    icon: Clock,
    title: "Restricción de Liquidez de 24 Horas",
    content: "Para garantizar la estabilidad de los nodos de inversión y prevenir la manipulación del mercado, Apex Digital implementa una restricción de retiro de 24 horas. Esta política asegura que los algoritmos de trading de alta frecuencia (HFT) mantengan su potencia de cálculo óptima, garantizando retornos estables para todos los participantes del ecosistema.",
  },
  {
    icon: Lock,
    title: "Auditoría de Cumplimiento (Compliance)",
    content: "Todas las solicitudes de retiro pasan por una cola de 'Pending Compliance' donde son verificadas por nuestro equipo de auditoría antes de su ejecución final. Este proceso incluye la verificación de la identidad del solicitante, la validación de la dirección de destino y la comprobación de que los fondos cumplen con las regulaciones anti-lavado de dinero (AML) y conoce-a-tu-cliente (KYC).",
  },
  {
    icon: Globe,
    title: "Gestión de Riesgo Institucional",
    content: "Nuestras estrategias de inversión algorítmica están diseñadas con protocolos de gestión de riesgo de grado bancario. Cada nodo de liquidez opera con límites de exposición predefinidos, stop-loss automatizados y diversificación entre múltiples clases de activos tecnológicos. Los dividendos son calculados y acreditados automáticamente cada ciclo de 24 horas basándose en el rendimiento real del mercado.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground hover:text-gold">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
          </div>
          <p className="text-muted-foreground mt-2 mb-10">
            Protocolo de seguridad y políticas de la plataforma Apex Digital
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <section.icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 rounded-xl border border-gold/20 bg-gold/5 p-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Al utilizar la plataforma Apex Digital, aceptas estos términos y condiciones en su totalidad.
            Para consultas adicionales, contacta a nuestro equipo de soporte.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Última actualización: Marzo 2026 — Jurisdicción: Singapur
          </p>
        </motion.div>
      </div>
    </div>
  );
}
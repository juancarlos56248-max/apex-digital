import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Star, Sparkles } from "lucide-react";

export default function SorteoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="relative rounded-2xl overflow-hidden border border-red-500/30"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0505 40%, #0d0505 70%, #0a0a0a 100%)",
      }}
    >
      {/* Fondo decorativo peruano */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Franjas tipo bandera peruana */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 via-red-500 to-red-600 opacity-80" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 via-red-500 to-red-600 opacity-80" />
        {/* Glow rojo */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-red-700/8 blur-2xl" />
        {/* Estrellas decorativas */}
        <Star className="absolute top-3 right-16 w-3 h-3 text-yellow-400/30" fill="currentColor" />
        <Star className="absolute bottom-4 right-28 w-2 h-2 text-yellow-400/20" fill="currentColor" />
        <Star className="absolute top-6 right-32 w-2 h-2 text-red-400/25" fill="currentColor" />
        <Sparkles className="absolute top-2 left-1/2 w-4 h-4 text-yellow-400/15" />
      </div>

      <div className="relative z-10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Ícono trofeo */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626, #ef4444)" }}>
              <Trophy className="w-7 h-7 text-white" />
            </div>
            {/* Badge $1000 */}
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-yellow-400/30 leading-none whitespace-nowrap">
              $1,000
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          {/* Etiqueta Fiestas Patrias */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border border-red-500/40 text-red-400 bg-red-500/10">
              🇵🇪 Fiestas Patrias 2026
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            ¡Gran Sorteo de{" "}
            <span style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              $1,000 USDT
            </span>
            !
          </h3>

          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Realiza tu <strong className="text-white">2do depósito</strong> de{" "}
            <strong className="text-yellow-400">$100 USDT o más</strong> y entra automáticamente al sorteo.
            ¡Más depósitos = más chances de ganar!
          </p>

          {/* Requisito visual */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-300 font-medium">Depósito mínimo $100</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-300 font-medium">2do depósito en adelante</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-300 font-medium">28 de julio 2026</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Link to="/deposit">
            <Button
              className="w-full sm:w-auto font-black text-sm h-11 px-5 shadow-lg shadow-red-900/30 gap-2"
              style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626)", color: "white" }}
            >
              Depositar ahora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-[9px] text-gray-500 text-center mt-1.5">Sorteo en vivo · 28 jul 2026</p>
        </div>
      </div>
    </motion.div>
  );
}
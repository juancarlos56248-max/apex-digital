import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

const typeConfig = {
  info: {
    icon: Megaphone,
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-300",
    titleColor: "text-blue-200",
    dot: "bg-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-yellow-500/20 via-yellow-400/10 to-transparent",
    border: "border-yellow-500/40",
    glow: "shadow-yellow-500/10",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-300",
    titleColor: "text-yellow-200",
    dot: "bg-yellow-400",
  },
  success: {
    icon: CheckCircle2,
    gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/10",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-300",
    titleColor: "text-emerald-200",
    dot: "bg-emerald-400",
  },
  promo: {
    icon: Sparkles,
    gradient: "from-yellow-600/25 via-amber-500/15 to-transparent",
    border: "border-gold/50",
    glow: "shadow-gold/20",
    iconBg: "bg-gold/20",
    iconColor: "text-gold",
    titleColor: "text-gold",
    dot: "bg-gold",
  },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    base44.entities.Announcement.filter({ active: true }, "-created_date", 5).then(setAnnouncements);
  }, []);

  const visible = announcements.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visible.map((ann, idx) => {
          const cfg = typeConfig[ann.type] || typeConfig.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              className={`relative overflow-hidden rounded-2xl border ${cfg.border} shadow-lg ${cfg.glow}`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient}`} />
              
              {/* Subtle shimmer line at top */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent`} />

              <div className="relative flex items-center gap-4 px-5 py-4">
                {/* Pulsing dot */}
                <div className="relative flex-shrink-0">
                  <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-40 animate-ping`} />
                  <div className={`relative w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold tracking-wide ${cfg.titleColor}`}>{ann.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ann.message}</p>
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => setDismissed(d => [...d, ann.id])}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
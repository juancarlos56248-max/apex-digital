import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, AlertTriangle, CheckCircle, Star } from "lucide-react";

const typeConfig = {
  info: { icon: Megaphone, border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400" },
  warning: { icon: AlertTriangle, border: "border-yellow-500/30", bg: "bg-yellow-500/5", text: "text-yellow-400" },
  success: { icon: CheckCircle, border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400" },
  promo: { icon: Star, border: "border-gold/30", bg: "bg-gold/5", text: "text-gold" },
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
    <div className="space-y-2">
      <AnimatePresence>
        {visible.map(ann => {
          const cfg = typeConfig[ann.type] || typeConfig.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 flex items-start gap-3`}
            >
              <Icon className={`w-4 h-4 ${cfg.text} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cfg.text}`}>{ann.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ann.message}</p>
              </div>
              <button onClick={() => setDismissed(d => [...d, ann.id])} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
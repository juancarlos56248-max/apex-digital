import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ProfileGate from "./ProfileGate";
import SupportWidget from "../support/SupportWidget";

const ROOT_TABS = ["/dashboard", "/investments", "/deposit", "/withdraw", "/referrals", "/comunidad", "/soporte", "/admin"];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isRootTab = ROOT_TABS.includes(location.pathname);

  // Enforce dark mode for WebView
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    // Capture referral code from URL and persist it
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("apex_ref_code", refCode);
    }

    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        // Show UI immediately — do async init in background
        setUser(me);
        setProfileComplete(!!(me.dni && me.phone));

        // Background: init referral code + welcome bonus without blocking render
        const updates = {};
        if (!me.referral_code) {
          updates.referral_code = "APEX" + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        if (me.balance === undefined || me.balance === null) {
          const WELCOME_BONUS = 5;
          updates.balance = WELCOME_BONUS;
          updates.total_invested = 0;
          updates.total_earned = 0;
          // Fire and forget welcome bonus transaction
          base44.entities.Transaction.create({
            user_email: me.email,
            type: "dividend",
            amount: WELCOME_BONUS,
            status: "completed",
            notes: "🎉 Bono de bienvenida Apex Digital",
          });
        }
        if (Object.keys(updates).length > 0) {
          base44.auth.updateMe(updates);
          setUser(prev => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setProfileComplete(false);
      }
    };
    loadUser();
  }, []);

  // Market crash executor
  useEffect(() => {
    const checkCrash = async () => {
      const events = await base44.entities.MarketEvent.filter({ status: "scheduled" });
      const now = new Date();
      for (const ev of events) {
        if (new Date(ev.crash_time) <= now) {
          // Mark positions as crashed (value = 0, status = sold)
          const symbols = ev.affected_symbols || [];
          // Only liquidate positions belonging to users (admin-level via service role in backend ideally)
          const allPositions = await base44.entities.StockPosition.filter({ status: "open" });
          const affected = symbols.length > 0
            ? allPositions.filter(p => symbols.includes(p.symbol))
            : allPositions;

          for (const pos of affected) {
            await base44.entities.StockPosition.update(pos.id, {
              status: "sold",
              sell_price: 0,
              total_invested: 0,
            });
          }

          // Mark event as executed
          await base44.entities.MarketEvent.update(ev.id, { status: "executed" });

          toast.error(ev.message || "⚠️ Caída de mercado detectada. Posiciones liquidadas.");
        }
      }
    };

    const interval = setInterval(checkCrash, 60000);
    // Delay first check so it doesn't compete with initial render
    const timeout = setTimeout(checkCrash, 5000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  // Still loading
  if (profileComplete === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileComplete && user) {
    return <ProfileGate user={user} onComplete={() => setProfileComplete(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div
          className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 flex items-center justify-between"
          style={{ paddingTop: `calc(env(safe-area-inset-top) + 12px)`, paddingBottom: "12px" }}
        >
          {isRootTab ? (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground active:scale-95 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="text-gold font-bold text-sm tracking-tight">APEX</span>
          </div>
          <div className="w-9" /> {/* spacer */}
        </div>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet context={{ user, setUser }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
      <SupportWidget />
    </div>
  );
}
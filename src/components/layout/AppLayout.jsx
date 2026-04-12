import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ProfileGate from "./ProfileGate";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);

  useEffect(() => {
    // Capture referral code from URL and persist it
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("apex_ref_code", refCode);
    }

    const loadUser = async () => {
      const me = await base44.auth.me();
      // Generate referral code if not exists
      if (!me.referral_code) {
        const code = "APEX" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await base44.auth.updateMe({ referral_code: code });
        me.referral_code = code;
      }
      // Initialize defaults + welcome bonus
      if (me.balance === undefined) {
        const WELCOME_BONUS = 5;
        await base44.auth.updateMe({ balance: WELCOME_BONUS, total_invested: 0, total_earned: 0 });
        me.balance = WELCOME_BONUS;
        me.total_invested = 0;
        me.total_earned = 0;
        await base44.entities.Transaction.create({
          user_email: me.email,
          type: "dividend",
          amount: WELCOME_BONUS,
          status: "completed",
          notes: "🎉 Bono de bienvenida Apex Digital",
        });
      }
      setUser(me);
      // Check if profile is complete
      setProfileComplete(!!(me.dni && me.phone));
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

    const interval = setInterval(checkCrash, 60000); // check every minute
    checkCrash(); // immediate check on load
    return () => clearInterval(interval);
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
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Outlet context={{ user, setUser }} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
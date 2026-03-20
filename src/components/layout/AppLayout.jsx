import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const me = await base44.auth.me();
      // Generate referral code if not exists
      if (!me.referral_code) {
        const code = "APEX" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await base44.auth.updateMe({ referral_code: code });
        me.referral_code = code;
      }
      // Initialize defaults
      if (me.balance === undefined) {
        await base44.auth.updateMe({ balance: 0, total_invested: 0, total_earned: 0 });
        me.balance = 0;
        me.total_invested = 0;
        me.total_earned = 0;
      }
      setUser(me);
    };
    loadUser();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="text-gold font-bold text-sm">APEX</span>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet context={{ user, setUser }} />
        </div>
      </main>
    </div>
  );
}
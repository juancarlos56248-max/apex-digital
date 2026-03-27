import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ProfileGate from "./ProfileGate";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);

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
      // Check if profile is complete
      setProfileComplete(!!(me.dni && me.phone));
    };
    loadUser();
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
          <Outlet context={{ user, setUser }} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
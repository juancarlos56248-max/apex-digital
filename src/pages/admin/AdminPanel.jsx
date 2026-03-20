import { useState } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowDownToLine, ArrowUpFromLine, Users } from "lucide-react";
import DepositManager from "../../components/admin/DepositManager";
import WithdrawalManager from "../../components/admin/WithdrawalManager";
import UserConsole from "../../components/admin/UserConsole";
import AnnouncementManager from "../../components/admin/AnnouncementManager";

export default function AdminPanel() {
  const { user } = useOutletContext();

  if (!user) return null;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Back-Office de control operativo</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="deposits" className="gap-2 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Depósitos
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="gap-2 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Retiros
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <Users className="w-3.5 h-3.5" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <Shield className="w-3.5 h-3.5" />
            Anuncios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <DepositManager />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalManager />
        </TabsContent>
        <TabsContent value="users">
          <UserConsole />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
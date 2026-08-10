import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Lazy-load all authenticated pages for faster initial bundle
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Investments = lazy(() => import('./pages/Investments'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const Referrals = lazy(() => import('./pages/Referrals'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const Terms = lazy(() => import('./pages/Terms'));
const Comunidad = lazy(() => import('./pages/Comunidad'));
const Soporte = lazy(() => import('./pages/Soporte'));
const Trading = lazy(() => import('./pages/Trading'));
const SesionEspecial = lazy(() => import('./pages/SesionEspecial'));
const TarjetaApex = lazy(() => import('./pages/TarjetaApex'));
const CodigoEspecial = lazy(() => import('./pages/CodigoEspecial'));

const PageSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="h-8 w-48 rounded-xl bg-secondary/50 animate-pulse" />
    <div className="grid grid-cols-2 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />)}
    </div>
    <div className="h-48 rounded-xl bg-secondary/50 animate-pulse" />
    <div className="h-48 rounded-xl bg-secondary/50 animate-pulse" />
  </div>
);


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public auth routes — not gated */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* All app routes gated — unauthenticated users land on /login */}
              <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
                <Route path="/" element={<Landing />} />
                <Route path="/terms" element={<Terms />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="/deposit" element={<Deposit />} />
                  <Route path="/withdraw" element={<Withdraw />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/codigo-especial" element={<CodigoEspecial />} />
                  <Route path="/comunidad" element={<Comunidad />} />
                  <Route path="/soporte" element={<Soporte />} />
                  <Route path="/trading" element={<Trading />} />
                  <Route path="/sesion-especial" element={<SesionEspecial />} />
                  <Route path="/tarjeta" element={<TarjetaApex />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
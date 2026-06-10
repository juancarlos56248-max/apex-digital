import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';

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


const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();

  const pathname = window.location.pathname;
  const isPublicRoute = pathname === '/' || pathname === '/terms';

  // Handle errors only after loading completes and only on protected routes
  if (!isLoadingAuth && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required' && !isPublicRoute) {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) localStorage.setItem('apex_ref_code', refCode);
      navigateToLogin();
      return null;
    }
  }

  // Protected routes: show spinner only while loading auth on non-public paths
  if (!isPublicRoute && isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Always render routes — public routes never wait
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
      <Route element={<AppLayout />}>
        <Suspense fallback={<PageSkeleton />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Suspense>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

// Clave para recordar sesión 2FA verificada (por sesión de pestaña)
const TWO_FA_KEY = 'apex_2fa_verified';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!!appParams.token); // only loading if token exists
  const [authError, setAuthError] = useState(null);
  const [twoFaVerified, setTwoFaVerified] = useState(
    () => sessionStorage.getItem(TWO_FA_KEY) === 'true'
  );

  useEffect(() => {
    if (!appParams.token) {
      // No token → not authenticated, nothing to load
      setIsLoadingAuth(false);
      return;
    }
    // Token exists → verify user in background
    base44.auth.me()
      .then(currentUser => {
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
      })
      .catch(error => {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        // Network error (offline, timeout, CORS) — treat as unauthenticated, don't block the app
        if (!error.status || error.message === 'Network Error') {
          return;
        }
        if (error.status === 401 || error.status === 403) {
          const reason = error.data?.extra_data?.reason;
          setAuthError({
            type: reason === 'user_not_registered' ? 'user_not_registered' : 'auth_required',
            message: 'Authentication required'
          });
        }
      });
  }, []);

  const completeTwoFa = () => {
    sessionStorage.setItem(TWO_FA_KEY, 'true');
    setTwoFaVerified(true);
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(TWO_FA_KEY);
    setTwoFaVerified(false);
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: () => {},
      twoFaVerified,
      completeTwoFa,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
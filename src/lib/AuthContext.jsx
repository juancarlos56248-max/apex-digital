import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!!appParams.token); // only loading if token exists
  const [authError, setAuthError] = useState(null);

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
        if (error.status === 401 || error.status === 403) {
          const reason = error.data?.extra_data?.reason;
          setAuthError({
            type: reason === 'user_not_registered' ? 'user_not_registered' : 'auth_required',
            message: 'Authentication required'
          });
        }
      });
  }, []);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
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
      isLoadingPublicSettings: false, // no longer blocking
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: () => {},
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
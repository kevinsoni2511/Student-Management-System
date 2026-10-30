import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStorage.getUser());
  const [token, setToken] = useState(tokenStorage.get());
  const [loading, setLoading] = useState(true);

  // Validate existing token on initial mount
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await authApi.me();
          if (res?.user) {
            setUser(res.user);
            tokenStorage.setUser(res.user);
          }
        } catch {
          // Token expired or invalid
          tokenStorage.remove();
          tokenStorage.removeUser();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.token && res?.user) {
      tokenStorage.set(res.token);
      tokenStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res?.token && res?.user) {
      tokenStorage.set(res.token);
      tokenStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.remove();
      tokenStorage.removeUser();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

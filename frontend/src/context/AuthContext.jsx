import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartbite_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartbite_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('smartbite_user', JSON.stringify(data.user));
      localStorage.setItem('smartbite_token', data.access_token);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartbite_user');
    localStorage.removeItem('smartbite_token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.role || 'Guest',
    isAdmin: user?.role === 'Admin',
    isStaff: user?.role === 'Canteen Staff' || user?.role === 'Admin',
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

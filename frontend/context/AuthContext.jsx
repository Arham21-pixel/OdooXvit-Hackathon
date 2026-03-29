'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ROLES } from '@/lib/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        handleLogin(savedToken);
      }
    }
  }, []);

  const handleLogin = useCallback((jwtToken) => {
    try {
      const decodedUser = jwtDecode(jwtToken);
      
      // Save to localStorage & state
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(decodedUser);
      
      // Optional: Set cookie so Next.js middleware can read the token for redirects
      document.cookie = `token=${jwtToken}; path=/;`;
    } catch (error) {
      console.error('Failed to decode token', error);
      handleLogout();
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = () => user?.role === ROLES.ADMIN;
  const isManager = () => user?.role === ROLES.MANAGER;
  const isEmployee = () => user?.role === ROLES.EMPLOYEE;

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, logout: handleLogout, isAdmin, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

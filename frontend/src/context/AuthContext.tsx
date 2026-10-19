import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from '../utils/api';

interface AdminUser {
  id?: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, userData: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('bajaj_admin_user');
      if (token && storedUser) {
        try {
          const verifiedUser: any = await apiRequest('/auth/me');
          setUser({
            ...verifiedUser,
            role: (verifiedUser?.role || 'ADMIN').toUpperCase(),
          });
        } catch {
          try {
            const parsed = JSON.parse(storedUser);
            setUser({
              ...parsed,
              role: (parsed.role || 'ADMIN').toUpperCase(),
            });
          } catch {
            removeAuthToken();
            setUser(null);
          }
        }
      } else {
        removeAuthToken();
        setUser(null);
      }
      setLoading(false);
    }
    verifySession();
  }, []);

  const login = (token: string, userData: AdminUser) => {
    const normalizedUser = {
      ...userData,
      role: (userData.role || 'ADMIN').toUpperCase(),
    };
    setAuthToken(token);
    localStorage.setItem('bajaj_admin_user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

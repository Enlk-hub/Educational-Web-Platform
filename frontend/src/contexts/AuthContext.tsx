import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { api, clearAuth, getStoredToken, getStoredUser, storeAuth, storeTokenOnly } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Pick<User, 'name' | 'email'>) => Promise<User | null>;
  loginWithToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  useEffect(() => {
    const token = getStoredToken();
    if (token && !user) {
      api.getMe()
        .then((freshUser) => {
          storeAuth(token, freshUser);
          setUser(freshUser);
        })
        .catch(() => {
          clearAuth();
          setUser(null);
        });
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(username, password);
      storeAuth(data.token, data.user);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, username: string, password: string): Promise<boolean> => {
    try {
      const data = await api.register(name, email, username, password);
      storeAuth(data.token, data.user);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const updateProfile = async (updates: Pick<User, 'name' | 'email'>) => {
    try {
      const updated = await api.updateProfile(updates.name, updates.email);
      const token = getStoredToken();
      if (token) {
        storeAuth(token, updated);
      }
      setUser(updated);
      return updated;
    } catch {
      return null;
    }
  };

  const loginWithToken = async (token: string): Promise<boolean> => {
    try {
      storeTokenOnly(token); // Store token temporarily to make the request
      const user = await api.getMe();
      storeAuth(token, user); // Store both
      setUser(user);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';

interface NotificationSetting {
  email: boolean;
  inApp: boolean;
}

interface Preferences {
  darkMode: boolean;
  notifications: {
    invoiceAlerts: NotificationSetting;
    systemUpdates: NotificationSetting;
    directMentions: NotificationSetting;
    weeklyReports: NotificationSetting;
  };
  mfa: boolean;
}

interface CompanyDetails {
  name: string;
  taxId: string;
}

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  createdAt: string;
}

interface Integrations {
  ttnAccountId: string;
  ttnIntegrationKey: string;
  slackActive: boolean;
  quickbooksActive: boolean;
}

interface Billing {
  plan: string;
  aiScansUsed: number;
  aiScansLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
  renewalDate: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'ADMIN' | 'ACCOUNTANT';
  preferences?: Preferences;
  companyDetails?: CompanyDetails;
  apiKeys?: ApiKey[];
  integrations?: Integrations;
  billing?: Billing;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const result = await authAPI.getProfile();
          if (result.data) {
            setUser(result.data);
          }
        } catch (error) {
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authAPI.login(email, password);
      if (result.data) {
        localStorage.setItem('authToken', result.data.token);
        setUser(result.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      // Clear token and user state to ensure a clean public registration
      localStorage.removeItem('authToken');
      setUser(null);
      
      const result = await authAPI.register(name, email, password, role);
      if (result.data) {
        localStorage.setItem('authToken', result.data.token);
        setUser(result.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

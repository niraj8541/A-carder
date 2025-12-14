import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (username: string, phone: string, password: string) => Promise<boolean>;
  signup: (username: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('acarder_current_user_id');
    if (storedUserId) {
      const users = db.getUsers();
      const foundUser = users.find(u => u.id === storedUserId);
      if (foundUser && !foundUser.isBanned) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('acarder_current_user_id');
      }
    }
  }, []);

  const refreshUser = () => {
    if (user) {
      const users = db.getUsers();
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  };

  const login = async (username: string, phone: string, password: string) => {
    // In a real app, phone would be used for 2FA or verification, here we just check presence
    const foundUser = db.findUserByUsername(username);
    
    // Simulate generic hash check
    const hash = btoa(password);
    
    if (foundUser && foundUser.passwordHash === hash) {
      if (foundUser.isBanned) {
        alert("This account has been banned.");
        return false;
      }
      if (foundUser.phone !== phone) {
        alert("Invalid credentials."); 
        return false;
      }
      setUser(foundUser);
      localStorage.setItem('acarder_current_user_id', foundUser.id);
      return true;
    }
    return false;
  };

  const signup = async (username: string, phone: string, password: string) => {
    const exists = db.findUserByUsername(username);
    if (exists) return false;

    const newUser: User = {
      id: Date.now().toString(),
      username,
      phone,
      passwordHash: btoa(password),
      role: UserRole.USER,
      walletBalance: 0,
      isBanned: false,
      createdAt: new Date().toISOString()
    };
    db.saveUser(newUser);
    // Auto login after signup
    setUser(newUser);
    localStorage.setItem('acarder_current_user_id', newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acarder_current_user_id');
  };

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// userContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User } from '@/types/types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userFromCookie = Cookies.get('user');
    if (userFromCookie) {
      setUser(JSON.parse(userFromCookie));
    }
  }, []);

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
    Cookies.remove('token');
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
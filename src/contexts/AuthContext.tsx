'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useSession, signOut } from 'next-auth/react';

type User = {
  _id: Id<'users'>;
  username?: string;
  email?: string;
  name?: string;
  image?: string;
  role: 'super_admin' | 'admin' | 'driver' | 'user';
};

type AuthContextType = {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ user, setUser ] = useState<User | null>(null);
  const [ isLoading, setIsLoading ] = useState(true);
  const { data: session, status: sessionStatus } = useSession();

  
  // Use only NextAuth session
  const effectiveUserId = session?.user?.id as Id<'users'> | null;

  // Get user data from users table
  const userData = useQuery(
    api.boedor.auth.getUserById,
    effectiveUserId ? { userId: effectiveUserId } : 'skip',
  );

  // Handle loading state based on session status
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    // If no session, set loading to false
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
    }
  }, [session, sessionStatus]);

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser({
        _id: userData._id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        image: userData.image,
        role: (userData.role || 'user') as User['role'],
      });
      setIsLoading(false);
    } else if (effectiveUserId && userData === null) {
      // User not found, sign out and redirect to login
      setUser(null);
      setIsLoading(false);
      signOut({ callbackUrl: '/auth/login' });
    }
  }, [userData, effectiveUserId]);


  const logout = async () => {
    try {
      setUser(null);
      setIsLoading(false);
      // Clear all NextAuth session data
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear all cookies and redirect
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      window.location.href = '/auth/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

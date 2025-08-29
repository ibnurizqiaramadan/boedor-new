"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type User = {
  _id: Id<"boedor_users">;
  username: string;
  role: "super_admin" | "admin" | "driver" | "user";
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: "admin" | "driver" | "user") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<Id<"boedor_users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginAction = useAction(api.boedor.auth.login);
  const registerAction = useAction(api.boedor.auth.register);
  
  // Get user data if userId exists
  const userData = useQuery(
    api.boedor.auth.getUserById,
    userId ? { userId } : "skip"
  );

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("boedor_user_id");
    if (storedUserId) {
      setUserId(storedUserId as Id<"boedor_users">);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser({
        _id: userData._id,
        username: userData.username,
        role: userData.role
      });
      setIsLoading(false);
    } else if (userId && userData === null) {
      // User not found, clear localStorage
      localStorage.removeItem("boedor_user_id");
      setUserId(null);
      setUser(null);
      setIsLoading(false);
    }
  }, [userData, userId]);

  const login = async (username: string, password: string) => {
    try {
      const result = await loginAction({ username, password });
      setUserId(result.userId as Id<"boedor_users">);
      localStorage.setItem("boedor_user_id", result.userId);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, role: "admin" | "driver" | "user") => {
    try {
      setIsLoading(true);
      const result = await registerAction({ username, password, role });
      localStorage.setItem("boedor_user_id", result.userId);
      setUser({ _id: result.userId, username: result.username, role: result.role });
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("boedor_user_id");
    setUserId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

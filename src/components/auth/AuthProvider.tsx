"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type User = Database["public"]["Tables"]["users"]["Row"];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        return null;
      }

      if (!session?.user) {
        console.log("No active session found");
        return null;
      }

      console.log("Fetching user profile for:", session.user.id);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("User profile error:", userError);
        return null;
      }

      console.log("User profile loaded:", userData?.name);
      return userData;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (!isClient) return;

    try {
      console.log("Starting refreshUser method");
      const userData = await getCurrentUser();
      console.log("User data from getCurrentUser:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Initialize auth state
    refreshUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, refreshing user");
        setLoading(true);
        await refreshUser();
      } else if (event === "SIGNED_OUT" || !session) {
        console.log("User signed out or no session");
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("Token refreshed, refreshing user");
        setLoading(true);
        await refreshUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isClient]);

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

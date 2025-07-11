"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
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

  const refreshUser = async () => {
    try {
      console.log("Starting getCurrentUser method");

      // Get auth user first
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("Auth user:", authUser?.id, "Auth error:", authError);

      if (authError) {
        console.error("Auth error:", authError);
        setUser(null);
        return;
      }

      if (!authUser) {
        console.log("No auth user found");
        setUser(null);
        return;
      }

      // Get user profile from database
      console.log("Fetching user profile for ID:", authUser.id);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      console.log("User data:", userData, "User error:", userError);

      if (userError) {
        console.error("User profile error:", userError);
        setUser(null);
        return;
      }

      console.log("Setting user:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      console.log("Setting loading to false");
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
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          console.log("Initial session found, refreshing user");
          await refreshUser();
        } else {
          console.log("No initial session found");
          setUser(null);
          setLoading(false);
        }
      } else if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, refreshing user");
        await refreshUser();
      } else if (event === "SIGNED_OUT" || !session) {
        console.log("User signed out or no session");
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("Token refreshed, refreshing user");
        await refreshUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

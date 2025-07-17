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
      console.log("getCurrentUser: Starting function");
      
      // Add a timeout to the entire function
      const functionTimeout = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("getCurrentUser function timeout")), 2000);
      });

      const getUserData = async (): Promise<User | null> => {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("getCurrentUser: Session result:", { session: !!session, error: sessionError });

        if (sessionError) {
          console.error("Session error:", sessionError);
          return null;
        }

        if (!session?.user) {
          console.log("No active session found");
          return null;
        }

        console.log("Fetching user profile for:", session.user.id);

        // Add timeout to the Supabase query
        const queryPromise = supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Database query timeout")), 1500);
        });

        const { data: userData, error: userError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        console.log("getCurrentUser: User query result:", { userData: !!userData, error: userError });

        if (userError) {
          console.error("User profile error:", userError);
          return null;
        }

        console.log("User profile loaded:", userData?.name);
        return userData;
      };

      return await Promise.race([getUserData(), functionTimeout]);
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (!isClient) return;

    try {
      console.log("Starting refreshUser method");
      setLoading(true);
      const userData = await getCurrentUser();
      console.log("User data from getCurrentUser:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      console.log("Setting loading to false in refreshUser");
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state");
        setLoading(true);
        const userData = await getCurrentUser();
        console.log("Initial user data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        console.log("Setting loading to false in initializeAuth");
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, refreshing user");
        
        // If user is already loaded and matches the session, just ensure loading is false
        if (user?.id === session.user.id) {
          console.log("User already loaded and matches session, ensuring loading is false");
          setLoading(false);
          return;
        }
        
        console.log("SIGNED_IN: About to set loading to true");
        setLoading(true);
        
        // Add timeout to prevent stuck loading state
        const timeoutId = setTimeout(() => {
          console.log("Timeout reached, forcing loading to false");
          setLoading(false);
        }, 3000); // Reduced timeout to 3 seconds
        
        try {
          console.log("About to call getCurrentUser in SIGNED_IN handler");
          console.log("SIGNED_IN: Calling getCurrentUser...");
          const userData = await getCurrentUser();
          console.log("User data loaded in SIGNED_IN:", userData?.name);
          clearTimeout(timeoutId);
          
          if (userData) {
            console.log("SIGNED_IN: Setting user data:", userData);
            setUser(userData);
          } else {
            console.log("SIGNED_IN: getCurrentUser returned null, keeping existing user data");
          }
          console.log("Setting loading to false after SIGNED_IN");
          setLoading(false);
        } catch (error) {
          console.error("Error refreshing user on sign in:", error);
          clearTimeout(timeoutId);
          
          // If getCurrentUser fails, keep the existing user data if it matches the session
          if (user?.id === session.user.id) {
            console.log("getCurrentUser failed but user matches session, keeping existing user data");
            setLoading(false);
          } else {
            console.log("getCurrentUser failed and no matching user, setting user to null");
            setUser(null);
            setLoading(false);
          }
        }
      } else if (event === "SIGNED_OUT" || !session) {
        console.log("User signed out or no session");
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("Token refreshed, refreshing user");
        
        // If user is already loaded and matches the session, just ensure loading is false
        if (user?.id === session.user.id) {
          console.log("User already loaded and matches session, ensuring loading is false");
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        // Add timeout to prevent stuck loading state
        const timeoutId = setTimeout(() => {
          console.log("Timeout reached, forcing loading to false");
          setLoading(false);
        }, 3000); // Reduced timeout to 3 seconds
        
        try {
          console.log("About to call getCurrentUser in TOKEN_REFRESHED handler");
          const userData = await getCurrentUser();
          console.log("User data loaded in TOKEN_REFRESHED:", userData?.name);
          clearTimeout(timeoutId);
          
          if (userData) {
            setUser(userData);
          } else {
            console.log("TOKEN_REFRESHED: getCurrentUser returned null, keeping existing user data");
          }
          console.log("Setting loading to false after TOKEN_REFRESHED");
          setLoading(false);
        } catch (error) {
          console.error("Error refreshing user on token refresh:", error);
          clearTimeout(timeoutId);
          
          // If getCurrentUser fails, keep the existing user data if it matches the session
          if (user?.id === session.user.id) {
            console.log("getCurrentUser failed but user matches session, keeping existing user data");
            setLoading(false);
          } else {
            console.log("getCurrentUser failed and no matching user, setting user to null");
            setUser(null);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isClient]);

  // Add a safety mechanism to prevent stuck loading state
  useEffect(() => {
    if (loading && user) {
      console.log("Loading is true but user exists, forcing loading to false");
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 1500); // Reduced to 1.5 seconds for faster response
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, user]);

  console.log("AuthProvider state - loading:", loading, "user:", user?.name);

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { signIn, signInWithGoogle, getCurrentUser } from "@/lib/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is already authenticated and handle URL errors
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace("/dashboard");
          return;
        }

        // Check for error parameters
        const errorParam = searchParams.get("error");
        if (errorParam === "account_not_found") {
          setError(
            "Account not found. Please register first or use the registration page to create an account with Google.",
          );
        } else if (errorParam === "auth_failed") {
          setError("Authentication failed. Please try again.");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router, searchParams]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);

      if (result.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle(false);
      // The redirect will be handled by Supabase
    } catch (err: any) {
      setError(err.message || "Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}

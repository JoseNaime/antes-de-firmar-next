"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { signUp, signInWithGoogle, getCurrentUser } from "@/lib/auth";

export default function RegisterPage() {
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
        if (errorParam === "registration_failed") {
          setError("Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router, searchParams]);

  const handleRegister = async (data: {
    email: string;
    password: string;
    name: string;
    country: string;
  }) => {
    setError("Direct registration is disabled. Please use Google to register.");
    return;
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle(true);
      // The redirect will be handled by Supabase
    } catch (err: any) {
      setError(err.message || "Google registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Obteniendo información...</p>
        </div>
      </div>
    );
  }

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleRegister={handleGoogleRegister}
      isLoading={isLoading}
      error={error}
    />
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { signUp, signInWithGoogle, getCurrentUser } from "@/lib/auth";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleRegister = async (data: {
    email: string;
    password: string;
    name: string;
    country: string;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp(
        data.email,
        data.password,
        data.name,
        data.country,
      );

      if (result.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
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
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
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

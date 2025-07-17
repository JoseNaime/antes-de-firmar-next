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
            "Cuenta no encontrada. Por favor regístrate primero, puedes usar la página de registro para crear una cuenta con Google.",
          );
        } else if (errorParam === "auth_failed") {
          setError("La autenticación falló. Por favor intenta de nuevo.");
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
      setError(
        err.message ||
          "Correo electrónico o contraseña inválidos. Por favor intenta de nuevo.",
      );
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
      setError(
        err.message ||
          "El inicio de sesión con Google falló. Por favor intenta de nuevo.",
      );
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-primary"></div>
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Obteniendo información...
          </p>
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

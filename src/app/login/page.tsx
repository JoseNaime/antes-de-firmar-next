"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { signIn, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
      await signInWithGoogle();
      // The redirect will be handled by Supabase
    } catch (err: any) {
      setError(err.message || "Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}

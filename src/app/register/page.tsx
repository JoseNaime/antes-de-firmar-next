"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { signUp, signInWithGoogle } from "@/lib/auth";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleRegister={handleGoogleRegister}
      isLoading={isLoading}
      error={error}
    />
  );
}

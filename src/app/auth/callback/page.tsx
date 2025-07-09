"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/login?error=auth_failed");
          return;
        }

        if (data.session?.user) {
          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          // If user doesn't exist, create them (for Google OAuth users)
          if (userError && userError.code === "PGRST116") {
            const { error: insertError } = await supabase.from("users").insert({
              id: data.session.user.id,
              email: data.session.user.email || "",
              name:
                data.session.user.user_metadata?.full_name ||
                data.session.user.email ||
                "User",
              country: null,
              tokens: 1000, // Default tokens for new users
            });

            if (insertError) {
              console.error("Error creating user:", insertError);
            }
          }

          // Redirect to dashboard
          router.push("/dashboard");
        } else {
          // No session, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth_failed");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-muted mb-4"></div>
        <div className="h-6 w-48 bg-muted rounded mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

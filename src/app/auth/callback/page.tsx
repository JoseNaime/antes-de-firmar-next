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
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode"); // 'login' or 'register'

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

          // If user doesn't exist in our users table
          if (userError && userError.code === "PGRST116") {
            if (mode === "login") {
              // User tried to login but account doesn't exist in our system
              // Delete the orphaned auth user and sign them out
              await supabase.auth.admin.deleteUser(data.session.user.id);
              await supabase.auth.signOut();
              router.push("/login?error=account_not_found");
              return;
            } else if (mode === "register") {
              // User is registering, create the account
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: data.session.user.id,
                  email: data.session.user.email || "",
                  name:
                    data.session.user.user_metadata?.full_name ||
                    data.session.user.email ||
                    "User",
                  country: null,
                  tokens: 50, // Default tokens for freemium users
                });

              if (insertError) {
                console.error("Error creating user:", insertError);
                // Delete the auth user if user table insertion fails
                await supabase.auth.admin.deleteUser(data.session.user.id);
                await supabase.auth.signOut();
                router.push("/register?error=registration_failed");
                return;
              }

              // Create default freemium subscription for new user
              const { error: subscriptionError } = await supabase
                .from("user_subscriptions")
                .insert({
                  user_id: data.session.user.id,
                  subscription_tier: "freemium",
                  is_active: true,
                  subscribed_at: new Date().toISOString(),
                  next_token_reward_at: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ).toISOString(), // 30 days from now
                });

              if (subscriptionError) {
                console.error(
                  "Subscription creation error:",
                  subscriptionError,
                );
                // Clean up both auth user and users table entry
                await supabase.auth.admin.deleteUser(data.session.user.id);
                await supabase
                  .from("users")
                  .delete()
                  .eq("id", data.session.user.id);
                await supabase.auth.signOut();
                router.push("/register?error=registration_failed");
                return;
              }
            } else {
              // No mode specified or invalid mode, delete orphaned auth user and redirect
              await supabase.auth.admin.deleteUser(data.session.user.id);
              await supabase.auth.signOut();
              router.push("/login?error=auth_failed");
              return;
            }
          }

          // User exists in our system or was just created, redirect to dashboard
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

import { supabase } from "./supabase";
import type { Database } from "./supabase";

type User = Database["public"]["Tables"]["users"]["Row"] & {
  subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
  subscription_active?: boolean;
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  country?: string,
) => {
  let authUserId: string | null = null;

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      authUserId = authData.user.id;

      // Create user profile in public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          name,
          country: country || null,
          tokens: 50, // Default tokens for freemium users
        })
        .select()
        .single();

      if (userError) {
        console.error("User table insertion failed:", userError);
        // Delete the auth user if user table insertion fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      // Create default freemium subscription for new user
      const { error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: authData.user.id,
          subscription_tier: "freemium",
          is_active: true,
          subscribed_at: new Date().toISOString(),
          next_token_reward_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days from now
        });

      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError);
        // Clean up both auth user and users table entry
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from("users").delete().eq("id", authData.user.id);
        throw subscriptionError;
      }

      return { user: userData, session: authData.session };
    }

    throw new Error("User creation failed");
  } catch (error) {
    console.error("Sign up error:", error);
    // Additional cleanup in case of any other errors
    if (authUserId) {
      try {
        await supabase.auth.admin.deleteUser(authUserId);
        await supabase.from("users").delete().eq("id", authUserId);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;

    if (authData.user) {
      // Get user profile from public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      // Get user subscription from user_subscriptions table
      const { data: subscriptionData } = await supabase
        .from("user_subscriptions")
        .select("subscription_tier, is_active")
        .eq("user_id", authData.user.id)
        .eq("is_active", true)
        .single();

      const userWithSubscription = {
        ...userData,
        subscription_tier: subscriptionData?.subscription_tier || "freemium",
        subscription_active: subscriptionData?.is_active || false,
      };

      return { user: userWithSubscription, session: authData.session };
    }

    throw new Error("Sign in failed");
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signInWithGoogle = async (isRegistration = false) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?mode=${isRegistration ? "register" : "login"}`,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return null;
    }

    if (!session?.user) {
      console.log("No active session found");
      return null;
    }

    console.log("Fetching user profile for:", session.user.id);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("User profile error:", userError);
      return null;
    }

    // Get user subscription from user_subscriptions table
    const { data: subscriptionData } = await supabase
      .from("user_subscriptions")
      .select("subscription_tier, is_active")
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .single();

    const userWithSubscription = {
      ...userData,
      subscription_tier: subscriptionData?.subscription_tier || "freemium",
      subscription_active: subscriptionData?.is_active || false,
    };

    console.log(
      "User profile loaded:",
      userData?.name,
      "Subscription:",
      subscriptionData?.subscription_tier,
    );
    return userWithSubscription;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const updateUserTokens = async (userId: string, tokensUsed: number) => {
  try {
    // Fetch current tokens
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("tokens")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;
    if (!user) throw new Error("User not found");

    const newTokens = Math.max(0, (user.tokens || 0) - tokensUsed);

    const { data, error } = await supabase
      .from("users")
      .update({ tokens: newTokens })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Update user tokens error:", error);
    throw error;
  }
};

export const calculateTokensRequired = (
  pageCount: number,
  wordCount: number,
): number => {
  // Base calculation: 1 token per page + 1 token per 100 words
  const pageTokens = pageCount;
  const wordTokens = Math.ceil(wordCount / 100);

  // Minimum 1 token, maximum 100 tokens per document
  return Math.max(1, Math.min(100, pageTokens + wordTokens));
};

export const getUserSubscription = async (userId: string) => {
  try {
    // First get the user subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      throw subscriptionError;
    }

    if (!subscription) {
      return null;
    }

    // Then get the subscription benefits for this tier
    const { data: benefits, error: benefitsError } = await supabase
      .from("subscription_benefits")
      .select("*")
      .eq("tier", subscription.subscription_tier)
      .single();

    if (benefitsError) {
      console.error("Benefits fetch error:", benefitsError);
      return subscription; // Return subscription without benefits if benefits fetch fails
    }

    // Combine the data
    return {
      ...subscription,
      subscription_benefits: benefits,
    };
  } catch (error) {
    console.error("Get user subscription error:", error);
    return null;
  }
};

export const getSubscriptionBenefits = async () => {
  try {
    const { data, error } = await supabase
      .from("subscription_benefits")
      .select("*")
      .order("monthly_tokens", { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Get subscription benefits error:", error);
    throw error;
  }
};

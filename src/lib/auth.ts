import { supabase } from "./supabase";
import type { Database } from "./supabase";

type User = Database["public"]["Tables"]["users"]["Row"];

export const signUp = async (
  email: string,
  password: string,
  name: string,
  country?: string,
) => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile in public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          name,
          country: country || null,
          tokens: 1000, // Default tokens for new users
        })
        .select()
        .single();

      if (userError) throw userError;

      return { user: userData, session: authData.session };
    }

    throw new Error("User creation failed");
  } catch (error) {
    console.error("Sign up error:", error);
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

      return { user: userData, session: authData.session };
    }

    throw new Error("Sign in failed");
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) throw error;

    return userData;
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

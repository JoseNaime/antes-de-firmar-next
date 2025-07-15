import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Create a Supabase client with the user's token
    const supabaseWithAuth = supabase.auth.admin;

    // Verify the JWT token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Token verification failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from your users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Failed to fetch user:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Now you have the authenticated user
    const { tier } = await request.json();

    // Get subscription benefits for the tier
    const { data: benefits, error: benefitsError } = await supabase
      .from("subscription_benefits")
      .select("*")
      .eq("tier", tier)
      .single();

    if (benefitsError || !benefits) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 },
      );
    }

    // Define pricing (in cents)
    const pricing = {
      freemium: 0, // Free tier
      basic: 999, // $9.99/month
      advanced: 2999, // $29.99/month
    };

    if (tier === "freemium") {
      return NextResponse.json(
        { error: "Cannot purchase free tier" },
        { status: 400 },
      );
    }

    // Determine the correct base URL for redirects
    const baseUrl = "https://charming-blackwell4-ck87u.view-3.tempo-dev.app";

    // Check if customer already exists in Stripe
    const existingCustomers = await stripe.customers.list({
      email: userData.email,
      limit: 1,
    });

    let customerId: string;

    if (existingCustomers.data.length > 0) {
      // Use existing customer
      customerId = existingCustomers.data[0].id;
      console.log(
        `Using existing Stripe customer: ${customerId} for email: ${userData.email}`,
      );
    } else {
      // Create new customer
      const newCustomer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          userId: userData.id,
        },
      });
      customerId = newCustomer.id;
      console.log(
        `Created new Stripe customer: ${customerId} for email: ${userData.email}`,
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
              description: `${benefits.monthly_tokens} tokens/month, ${benefits.upload_limit ? `${benefits.upload_limit} uploads` : "unlimited uploads"}, ${benefits.human_review_access ? "human review access" : "AI review only"}`,
            },
            unit_amount: pricing[tier as keyof typeof pricing],
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/profile?success=true`,
      cancel_url: `${baseUrl}/profile?canceled=true`,
      customer: customerId,
      metadata: {
        userId: userData.id,
        tier: tier,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}

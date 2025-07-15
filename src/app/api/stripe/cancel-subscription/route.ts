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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, find the Stripe customer by email
    const customers = await stripe.customers.list({
      email: userData.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log(`No Stripe customer found for email: ${userData.email}`);
      return NextResponse.json({
        success: true,
        cancelledSubscriptions: 0,
        message: "No active subscriptions found to cancel",
      });
    }

    const customerId = customers.data[0].id;
    console.log(
      `Found Stripe customer: ${customerId} for email: ${userData.email}`,
    );

    // Find active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    console.log(
      `Found ${subscriptions.data.length} active subscriptions for user ${userData.email}`,
    );

    // Cancel all active subscriptions for this user
    const cancelPromises = subscriptions.data.map(async (subscription) => {
      console.log(`Cancelling subscription ${subscription.id}`);
      return stripe.subscriptions.cancel(subscription.id);
    });

    const cancelledSubscriptions = await Promise.all(cancelPromises);

    console.log(
      `Successfully cancelled ${cancelledSubscriptions.length} subscriptions`,
    );

    return NextResponse.json({
      success: true,
      cancelledSubscriptions: cancelledSubscriptions.length,
      message: "Subscriptions cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}

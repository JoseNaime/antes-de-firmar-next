import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);
    console.log(`Event ID: ${event.id}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        console.log("Session metadata:", session.metadata);
        console.log("Session mode:", session.mode);
        console.log("Session payment status:", session.payment_status);

        if (
          !session.metadata ||
          !session.metadata.userId ||
          !session.metadata.tier
        ) {
          console.error(
            "Missing metadata in checkout session:",
            session.metadata,
          );
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 },
          );
        }

        const { userId, tier } = session.metadata;
        console.log(`Updating subscription for user ${userId} to tier ${tier}`);

        try {
          // Update user subscription with new Stripe subscription ID
          const result = await updateUserSubscription(
            userId,
            tier as any,
            session.subscription as string,
          );
          console.log("Subscription update result:", result);
        } catch (error) {
          console.error(
            "Failed to update subscription in checkout.session.completed:",
            error,
          );
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 },
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", invoice.id);
        console.log("Customer email:", invoice.customer_email);
        console.log("Invoice amount:", invoice.amount_paid);
        console.log("Invoice total:", invoice.total);

        if (invoice.subscription) {
          // Handle recurring payment - award monthly tokens and update subscription
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );

          console.log("Subscription metadata:", subscription.metadata);
          console.log("Subscription items:", subscription.items.data);

          let userId = subscription.metadata?.userId;
          let tier: "freemium" | "basic" | "advanced" = "freemium";

          // If userId is not in subscription metadata, look it up by customer email
          if (!userId && invoice.customer_email) {
            console.log("Looking up user by email:", invoice.customer_email);
            const { data: user, error } = await supabase
              .from("users")
              .select("id")
              .eq("email", invoice.customer_email)
              .single();

            if (error) {
              console.error("Failed to find user by email:", error);
              return NextResponse.json(
                { error: "User not found" },
                { status: 400 },
              );
            }

            userId = user.id;
            console.log("Found user ID:", userId);

            // Update subscription metadata for future use
            try {
              await stripe.subscriptions.update(subscription.id, {
                metadata: {
                  userId: userId,
                },
              });
              console.log("Updated subscription metadata with userId");
            } catch (metadataError) {
              console.error(
                "Failed to update subscription metadata:",
                metadataError,
              );
              // Don't fail the webhook for this
            }
          }

          if (userId) {
            // Determine tier from invoice amount (using invoice total as fallback)
            const invoiceAmount = invoice.amount_paid || invoice.total;
            console.log(
              "Invoice amount for tier determination:",
              invoiceAmount,
            );

            if (invoiceAmount === 999) {
              tier = "basic";
            } else if (invoiceAmount === 2999) {
              tier = "advanced";
            }

            console.log("Determined tier:", tier);

            try {
              // Update user subscription in database using the main function
              const result = await updateUserSubscription(
                userId,
                tier,
                subscription.id,
              );
              console.log("Subscription update successful:", result);
            } catch (updateError) {
              console.error("Failed to update user subscription:", updateError);
              return NextResponse.json(
                { error: "Failed to update subscription" },
                { status: 500 },
              );
            }
          } else {
            console.error(
              "Could not determine user ID for subscription:",
              subscription.id,
            );
            return NextResponse.json(
              { error: "Could not determine user ID" },
              { status: 400 },
            );
          }
        } else {
          // Handle one-time payment (no subscription)
          console.log("Processing one-time payment for invoice:", invoice.id);
          console.log("Customer email:", invoice.customer_email);

          if (!invoice.customer_email) {
            console.error("No customer email found for one-time payment");
            return NextResponse.json(
              { error: "No customer email found" },
              { status: 400 },
            );
          }

          // Look up user by email
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", invoice.customer_email)
            .single();

          if (userError) {
            console.error(
              "Failed to find user by email for one-time payment:",
              userError,
            );
            return NextResponse.json(
              { error: "User not found" },
              { status: 400 },
            );
          }

          const userId = user.id;
          console.log("Found user ID for one-time payment:", userId);

          // Determine tier from invoice amount
          const invoiceAmount = invoice.amount_paid || invoice.total;
          console.log("One-time payment amount:", invoiceAmount);

          let tier: "freemium" | "basic" | "advanced" = "freemium";
          if (invoiceAmount === 999) {
            tier = "basic";
          } else if (invoiceAmount === 2999) {
            tier = "advanced";
          }

          console.log("Determined tier for one-time payment:", tier);

          try {
            // Update user subscription for one-time payment (no stripe subscription ID for one-time payments)
            const result = await updateUserSubscription(userId, tier, null);
            console.log(
              "One-time payment subscription update successful:",
              result,
            );
          } catch (updateError) {
            console.error(
              "Failed to update subscription for one-time payment:",
              updateError,
            );
            return NextResponse.json(
              { error: "Failed to update subscription" },
              { status: 500 },
            );
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription created:", subscription.id);
        console.log("Subscription metadata:", subscription.metadata);
        console.log("Subscription items:", subscription.items.data);

        let userId = subscription.metadata?.userId;
        let tier: "freemium" | "basic" | "advanced" = "freemium";

        // If userId is not in subscription metadata, look it up by customer email
        if (!userId) {
          // Get customer details from Stripe
          const customer = await stripe.customers.retrieve(
            subscription.customer as string,
          );

          if (customer.deleted || !("email" in customer) || !customer.email) {
            console.error(
              "No customer email found for subscription:",
              subscription.id,
            );
            return NextResponse.json(
              { error: "No customer email found" },
              { status: 400 },
            );
          }

          console.log("Looking up user by email:", customer.email);
          const { data: user, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", customer.email)
            .single();

          if (error) {
            console.error("Failed to find user by email:", error);
            return NextResponse.json(
              { error: "User not found" },
              { status: 400 },
            );
          }

          userId = user.id;
          console.log("Found user ID:", userId);

          // Update subscription metadata for future use
          try {
            await stripe.subscriptions.update(subscription.id, {
              metadata: {
                userId: userId,
              },
            });
            console.log("Updated subscription metadata with userId");
          } catch (metadataError) {
            console.error(
              "Failed to update subscription metadata:",
              metadataError,
            );
            // Don't fail the webhook for this
          }
        }

        if (userId) {
          // Determine tier from subscription items
          const priceId = subscription.items.data[0]?.price?.id;
          console.log("Price ID:", priceId);

          // Determine tier from the amount
          const amount = subscription.items.data[0]?.price?.unit_amount;
          console.log("Subscription amount:", amount);

          if (amount === 999) {
            tier = "basic";
          } else if (amount === 2999) {
            tier = "advanced";
          }

          console.log("Determined tier:", tier);

          try {
            // Update user subscription in database with the Stripe subscription ID
            console.log(
              `Setting stripe_subscription_id to: ${subscription.id}`,
            );
            const result = await updateUserSubscription(
              userId,
              tier,
              subscription.id,
            );
            console.log("Subscription creation update successful:", result);
          } catch (updateError) {
            console.error(
              "Failed to update user subscription on creation:",
              updateError,
            );
            return NextResponse.json(
              { error: "Failed to update subscription" },
              { status: 500 },
            );
          }
        } else {
          console.error(
            "Could not determine user ID for subscription:",
            subscription.id,
          );
          return NextResponse.json(
            { error: "Could not determine user ID" },
            { status: 400 },
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);
        console.log("Subscription metadata:", subscription.metadata);

        let userId = subscription.metadata?.userId;

        // If userId is not in metadata, we can't process this event
        if (!userId) {
          console.error(
            "No userId in subscription metadata for deleted subscription:",
            subscription.id,
          );
          return NextResponse.json(
            { error: "Missing userId in subscription metadata" },
            { status: 400 },
          );
        }

        // Downgrade to freemium (no stripe subscription ID for freemium)
        await updateUserSubscription(userId, "freemium", null);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({
      received: true,
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString(),
      processed: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

async function cancelExistingSubscriptions(
  userId: string,
  newSubscriptionId?: string,
) {
  try {
    console.log(`Cancelling existing subscription for user: ${userId}`);

    // Get the current stripe subscription ID from the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (subscriptionError || !subscription?.stripe_subscription_id) {
      console.log(
        `No active subscription found in database for user: ${userId}`,
      );
      return null;
    }

    const stripeSubscriptionId = subscription.stripe_subscription_id;
    console.log(`Found subscription ID to cancel: ${stripeSubscriptionId}`);

    // Don't cancel if it's the same subscription we're trying to create
    if (newSubscriptionId && stripeSubscriptionId === newSubscriptionId) {
      console.log(
        `Skipping cancellation - subscription ${stripeSubscriptionId} is the same as new subscription`,
      );
      return null;
    }

    try {
      // Check if subscription still exists and is active before cancelling
      const currentSubscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId);

      if (currentSubscription.status === "active") {
        console.log(`Cancelling subscription ${stripeSubscriptionId}`);
        // Cancel immediately with prorated refund
        const cancelledSubscription = await stripe.subscriptions.cancel(
          stripeSubscriptionId,
          {
            prorate: true,
          },
        );
        console.log(
          `Successfully cancelled subscription ${stripeSubscriptionId}`,
        );

        // Mark the subscription as inactive in the database
        await supabase
          .from("user_subscriptions")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("stripe_subscription_id", stripeSubscriptionId);

        return cancelledSubscription;
      } else {
        console.log(
          `Subscription ${stripeSubscriptionId} is already ${currentSubscription.status}, skipping cancellation`,
        );
        return null;
      }
    } catch (error: any) {
      if (error.code === "resource_missing") {
        console.log(
          `Subscription ${stripeSubscriptionId} no longer exists, marking as inactive in database`,
        );

        // Mark the subscription as inactive in the database since it doesn't exist in Stripe
        await supabase
          .from("user_subscriptions")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("stripe_subscription_id", stripeSubscriptionId);

        return null;
      } else {
        console.error(
          `Error cancelling subscription ${stripeSubscriptionId}:`,
          error,
        );
        throw error;
      }
    }
  } catch (error) {
    console.error("Error cancelling existing subscription:", error);
    // Don't throw error to prevent webhook failure - log and continue
    return null;
  }
}

async function updateUserSubscription(
  userId: string,
  tier: "freemium" | "basic" | "advanced",
  stripeSubscriptionId: string | null,
) {
  try {
    console.log(
      `Starting subscription update for user ${userId} to tier ${tier}`,
    );

    // Get subscription benefits
    const { data: benefits, error: benefitsError } = await supabase
      .from("subscription_benefits")
      .select("*")
      .eq("tier", tier)
      .single();

    if (benefitsError) {
      console.error("Failed to get subscription benefits:", benefitsError);
      throw new Error(`Benefits lookup failed: ${benefitsError.message}`);
    }

    if (!benefits) {
      console.error("No benefits found for tier:", tier);
      throw new Error(`No benefits found for tier: ${tier}`);
    }

    console.log("Found benefits:", benefits);

    // Clear stripe_subscription_id if tier is freemium
    const finalStripeSubscriptionId =
      tier === "freemium" ? null : stripeSubscriptionId;

    // Check if user already has a subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Cancel existing Stripe subscription if it exists and is different from the new one
    if (
      existingSubscription &&
      !fetchError &&
      existingSubscription.stripe_subscription_id
    ) {
      const existingStripeId = existingSubscription.stripe_subscription_id;

      // Only cancel if it's different from the new subscription ID
      if (existingStripeId !== stripeSubscriptionId) {
        console.log(
          `Cancelling existing Stripe subscription: ${existingStripeId}`,
        );

        try {
          // Check if subscription still exists and is active before cancelling
          const currentSubscription =
            await stripe.subscriptions.retrieve(existingStripeId);

          if (currentSubscription.status === "active") {
            console.log(`Cancelling active subscription ${existingStripeId}`);
            await stripe.subscriptions.cancel(existingStripeId, {
              prorate: true,
            });

            console.log(
              `Successfully cancelled subscription ${existingStripeId}`,
            );
          } else {
            console.log(
              `Subscription ${existingStripeId} is already ${currentSubscription.status}, skipping cancellation`,
            );
          }
        } catch (error: any) {
          if (error.code === "resource_missing") {
            console.log(
              `Subscription ${existingStripeId} no longer exists in Stripe`,
            );
          } else {
            console.error(
              `Error cancelling subscription ${existingStripeId}:`,
              error,
            );
            // Don't throw error to prevent webhook failure - log and continue
          }
        }
      } else {
        console.log(
          `Skipping cancellation - subscription ${existingStripeId} is the same as new subscription`,
        );
      }
    }

    let subscriptionData;

    if (existingSubscription && !fetchError) {
      // Update existing subscription
      console.log("Updating existing subscription for user:", userId);
      const { data: updatedData, error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          subscription_tier: tier,
          stripe_subscription_id: finalStripeSubscriptionId,
          is_active: true,
          last_token_reward_at: new Date().toISOString(),
          next_token_reward_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days from now
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Subscription update error:", updateError);
        throw new Error(`Subscription update failed: ${updateError.message}`);
      }

      subscriptionData = updatedData;
      console.log("Subscription updated successfully:", subscriptionData);
    } else {
      // Create new subscription if none exists
      console.log("Creating new subscription for user:", userId);
      const { data: newData, error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          subscription_tier: tier,
          stripe_subscription_id: finalStripeSubscriptionId,
          is_active: true,
          subscribed_at: new Date().toISOString(),
          last_token_reward_at: new Date().toISOString(),
          next_token_reward_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days from now
        })
        .select()
        .single();

      if (createError) {
        console.error("Subscription creation error:", createError);
        throw new Error(`Subscription creation failed: ${createError.message}`);
      }

      subscriptionData = newData;
      console.log("New subscription created successfully:", subscriptionData);
    }

    // Award tokens based on new tier
    const { data: tokenData, error: tokenError } = await supabase
      .from("users")
      .update({ tokens: benefits.monthly_tokens })
      .eq("id", userId)
      .select()
      .single();

    if (tokenError) {
      console.error("Token update error:", tokenError);
      throw new Error(`Token update failed: ${tokenError.message}`);
    } else {
      console.log("Tokens updated successfully:", tokenData);
    }

    console.log(
      `Subscription update completed successfully for user ${userId}`,
    );
    return { success: true, subscription: subscriptionData, tokens: tokenData };
  } catch (error) {
    console.error("Update user subscription error:", error);
    throw error;
  }
}

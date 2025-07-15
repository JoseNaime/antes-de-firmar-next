ALTER TABLE public.user_subscriptions 
ADD COLUMN stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON public.user_subscriptions(stripe_subscription_id);
-- Create the subscription_tier enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('freemium', 'basic', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.subscription_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL UNIQUE,
  monthly_tokens INTEGER NOT NULL,
  upload_limit INTEGER, -- NULL means unlimited
  human_review_access BOOLEAN DEFAULT FALSE,
  support_prioritization TEXT DEFAULT 'standard' CHECK (support_prioritization IN ('standard', 'prioritized')),
  token_purchase_discount INTEGER DEFAULT 0, -- percentage discount
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_tier subscription_tier NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_token_reward_at TIMESTAMP WITH TIME ZONE,
  next_token_reward_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_next_reward ON public.user_subscriptions(next_token_reward_at);

DROP TRIGGER IF EXISTS update_subscription_benefits_updated_at ON public.subscription_benefits;
CREATE TRIGGER update_subscription_benefits_updated_at BEFORE UPDATE ON public.subscription_benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.subscription_benefits (tier, monthly_tokens, upload_limit, human_review_access, support_prioritization, token_purchase_discount) VALUES
('freemium', 50, 3, FALSE, 'standard', 0),
('basic', 100, NULL, TRUE, 'standard', 5),
('advanced', 500, NULL, TRUE, 'prioritized', 10)
ON CONFLICT (tier) DO UPDATE SET
  monthly_tokens = EXCLUDED.monthly_tokens,
  upload_limit = EXCLUDED.upload_limit,
  human_review_access = EXCLUDED.human_review_access,
  support_prioritization = EXCLUDED.support_prioritization,
  token_purchase_discount = EXCLUDED.token_purchase_discount,
  updated_at = NOW();

alter publication supabase_realtime add table subscription_benefits;
alter publication supabase_realtime add table user_subscriptions;

-- Add referral_code and referred_by to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Generate referral codes for existing profiles
UPDATE public.profiles 
SET referral_code = UPPER(LEFT(REPLACE(name, ' ', ''), 4) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL with a default generator
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(LEFT(REPLACE(NEW.name, ' ', ''), 4) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'));
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = NEW.referral_code AND id != NEW.id) LOOP
      NEW.referral_code := UPPER(LEFT(REPLACE(NEW.name, ' ', ''), 4) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'));
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Referrals tracking table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  reward_points integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'joined',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
FOR SELECT TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can insert referrals" ON public.referrals
FOR INSERT TO authenticated
WITH CHECK (true);

-- Function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code text, p_new_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_id uuid;
  v_referrer_user_id uuid;
BEGIN
  -- Find the referrer
  SELECT user_id INTO v_referrer_user_id
  FROM public.profiles
  WHERE referral_code = UPPER(p_referral_code);

  IF v_referrer_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid referral code');
  END IF;

  -- Prevent self-referral
  IF v_referrer_user_id = p_new_user_id THEN
    RETURN json_build_object('success', false, 'message', 'Cannot refer yourself');
  END IF;

  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_user_id = p_new_user_id) THEN
    RETURN json_build_object('success', false, 'message', 'Already referred');
  END IF;

  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_user_id, reward_points, status)
  VALUES (v_referrer_user_id, p_new_user_id, 100, 'joined');

  -- Update referred_by on profile
  UPDATE public.profiles SET referred_by = v_referrer_user_id WHERE user_id = p_new_user_id;

  -- Award points to referrer
  PERFORM public.record_activity(v_referrer_user_id, 'referral', 100);

  RETURN json_build_object('success', true, 'message', 'Referral processed', 'referrer_id', v_referrer_user_id);
END;
$$;

-- Function to get referral stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total_referrals', (SELECT COUNT(*) FROM public.referrals WHERE referrer_id = p_user_id),
    'total_points', (SELECT COALESCE(SUM(reward_points), 0) FROM public.referrals WHERE referrer_id = p_user_id),
    'referral_code', (SELECT referral_code FROM public.profiles WHERE user_id = p_user_id),
    'recent_referrals', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT r.created_at, r.reward_points, r.status, p.name, p.avatar_url
        FROM public.referrals r
        JOIN public.profiles p ON p.user_id = r.referred_user_id
        WHERE r.referrer_id = p_user_id
        ORDER BY r.created_at DESC
        LIMIT 10
      ) t
    ), '[]'::json),
    'top_referrers', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT r.referrer_id as user_id, p.name, p.avatar_url, COUNT(*) as invite_count, SUM(r.reward_points) as total_points
        FROM public.referrals r
        JOIN public.profiles p ON p.user_id = r.referrer_id
        GROUP BY r.referrer_id, p.name, p.avatar_url
        ORDER BY invite_count DESC
        LIMIT 10
      ) t
    ), '[]'::json)
  )
$$;

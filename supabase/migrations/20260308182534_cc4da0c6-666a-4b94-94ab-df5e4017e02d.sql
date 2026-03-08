
-- Fix the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;

-- Only the process_referral function (SECURITY DEFINER) inserts referrals,
-- so we restrict direct inserts to prevent abuse
CREATE POLICY "Users cannot directly insert referrals" ON public.referrals
FOR INSERT TO authenticated
WITH CHECK (false);

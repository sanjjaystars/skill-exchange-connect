
-- Activity log table
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_created ON public.activity_log(created_at);
CREATE INDEX idx_activity_type ON public.activity_log(activity_type);

-- User gamification stats table
CREATE TABLE public.user_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_active_date date,
  badges text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gamification viewable by everyone" ON public.user_gamification
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_gamification_user ON public.user_gamification(user_id);
CREATE INDEX idx_gamification_points ON public.user_gamification(total_points DESC);

-- Create trigger to auto-create gamification row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_gamification (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();

-- Function to record activity and award points
CREATE OR REPLACE FUNCTION public.record_activity(
  p_user_id uuid,
  p_activity_type text,
  p_points integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := current_date;
  v_streak integer;
  v_last_active date;
  v_new_badges text[];
  v_total_points integer;
  v_sessions_count integer;
BEGIN
  -- Insert activity
  INSERT INTO public.activity_log (user_id, activity_type, points_earned)
  VALUES (p_user_id, p_activity_type, p_points);

  -- Upsert gamification row
  INSERT INTO public.user_gamification (user_id, total_points, streak_days, last_active_date)
  VALUES (p_user_id, p_points, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_gamification.total_points + p_points,
    streak_days = CASE
      WHEN user_gamification.last_active_date = v_today THEN user_gamification.streak_days
      WHEN user_gamification.last_active_date = v_today - 1 THEN user_gamification.streak_days + 1
      ELSE 1
    END,
    last_active_date = v_today,
    updated_at = now();

  -- Get current stats
  SELECT total_points, streak_days, badges INTO v_total_points, v_streak, v_new_badges
  FROM public.user_gamification WHERE user_id = p_user_id;

  -- Count completed sessions
  SELECT COUNT(*) INTO v_sessions_count
  FROM public.sessions
  WHERE (teacher_id = p_user_id OR learner_id = p_user_id) AND status = 'completed';

  -- Auto-award badges
  IF v_sessions_count >= 1 AND NOT ('Beginner Teacher' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Beginner Teacher');
  END IF;
  IF v_sessions_count >= 10 AND NOT ('Skill Mentor' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Skill Mentor');
  END IF;
  IF v_sessions_count >= 25 AND NOT ('Skill Master' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Skill Master');
  END IF;
  IF v_sessions_count >= 50 AND NOT ('Elite Teacher' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Elite Teacher');
  END IF;
  IF v_total_points >= 500 AND NOT ('Community Helper' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Community Helper');
  END IF;
  IF v_streak >= 30 AND NOT ('Streak Champion' = ANY(v_new_badges)) THEN
    v_new_badges := array_append(v_new_badges, 'Streak Champion');
  END IF;

  UPDATE public.user_gamification SET badges = v_new_badges WHERE user_id = p_user_id;

  RETURN json_build_object(
    'total_points', v_total_points,
    'streak_days', v_streak,
    'badges', v_new_badges
  );
END;
$$;

-- Function for leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_period text DEFAULT 'all')
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      g.user_id,
      p.name,
      p.avatar_url,
      CASE
        WHEN p_period = 'week' THEN COALESCE((
          SELECT SUM(points_earned) FROM public.activity_log a
          WHERE a.user_id = g.user_id AND a.created_at >= date_trunc('week', now())
        ), 0)
        WHEN p_period = 'month' THEN COALESCE((
          SELECT SUM(points_earned) FROM public.activity_log a
          WHERE a.user_id = g.user_id AND a.created_at >= date_trunc('month', now())
        ), 0)
        ELSE g.total_points
      END AS points,
      g.streak_days,
      g.badges
    FROM public.user_gamification g
    JOIN public.profiles p ON p.user_id = g.user_id
    ORDER BY points DESC
    LIMIT 50
  ) t
$$;

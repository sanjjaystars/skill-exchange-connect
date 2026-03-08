
-- Sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  skill text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  reviewed_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON public.reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != reviewed_user_id);

-- Indexes
CREATE INDEX idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX idx_sessions_learner ON public.sessions(learner_id);
CREATE INDEX idx_reviews_reviewed_user ON public.reviews(reviewed_user_id);
CREATE INDEX idx_reviews_session ON public.reviews(session_id);

-- DB function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_reputation(target_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'average_rating', COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    'total_reviews', COUNT(*),
    'completed_sessions', (
      SELECT COUNT(*) FROM public.sessions
      WHERE (teacher_id = target_user_id OR learner_id = target_user_id)
        AND status = 'completed'
    )
  )
  FROM public.reviews
  WHERE reviewed_user_id = target_user_id
$$;

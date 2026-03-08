
-- Availability slots table
CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all availability" ON public.availability_slots
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own availability" ON public.availability_slots
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own availability" ON public.availability_slots
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own availability" ON public.availability_slots
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add scheduling columns to sessions
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Create index for faster session lookups by date
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON public.sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_availability_user ON public.availability_slots(user_id);

-- Function to check for double booking
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_user_id uuid,
  p_date date,
  p_start time,
  p_end time,
  p_exclude_session_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions
    WHERE scheduled_date = p_date
      AND status NOT IN ('cancelled')
      AND (teacher_id = p_user_id OR learner_id = p_user_id)
      AND (p_exclude_session_id IS NULL OR id != p_exclude_session_id)
      AND start_time < p_end
      AND end_time > p_start
  )
$$;

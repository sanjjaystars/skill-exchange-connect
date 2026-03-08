
CREATE TABLE public.ai_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.ai_chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.ai_chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.ai_chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.ai_chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can create own messages" ON public.ai_chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);

CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

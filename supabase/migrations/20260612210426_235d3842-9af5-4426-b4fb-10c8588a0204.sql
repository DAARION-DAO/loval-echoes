
-- Fix remaining error-level RLS findings

-- 1) document_chunks: remove the policy that exposes community-scoped chunks to every authenticated user
DROP POLICY IF EXISTS "Users can read chunks for their files" ON public.document_chunks;

-- Owner-scoped read remains via existing ALL policy (auth.uid() = user_id).
-- Add an explicit owner-scoped SELECT for clarity (idempotent).
CREATE POLICY "Owners read their document chunks"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) conversation_participants: prevent self-joining arbitrary conversations
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

-- Allow inserting a participant row only when:
--   (a) the inserter is the conversation creator adding themselves, OR
--   (b) the inserter is an existing owner/admin of the conversation adding someone.
CREATE POLICY "Restricted join conversations"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.created_by = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.role IN ('owner', 'admin')
  )
);

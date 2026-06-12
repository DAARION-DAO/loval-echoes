-- Security patch: Hardening RLS for document_chunks and conversation_participants
-- Suggested filename: supabase/migrations/20260612_fix_remaining_rls_document_chunks_and_conversation_participants.sql

-- 1. Alter conversations table to set defaults for created_by and user_id to auth.uid()
ALTER TABLE public.conversations ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.conversations ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Alter files table to add community_id column if not exists
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE;

-- 3. Create helper function and trigger to set community_id automatically on file upload
CREATE OR REPLACE FUNCTION public.set_files_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL AND NEW.uploaded_by IS NOT NULL THEN
    NEW.community_id := (
      SELECT community_id 
      FROM public.community_members 
      WHERE user_id = NEW.uploaded_by AND status = 'approved' 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_files_community_id ON public.files;
CREATE TRIGGER trigger_set_files_community_id
BEFORE INSERT ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.set_files_community_id();

-- 4. Populate community_id for existing files
UPDATE public.files f 
SET community_id = (
  SELECT cm.community_id 
  FROM public.community_members cm 
  WHERE cm.user_id = f.uploaded_by AND cm.status = 'approved' 
  LIMIT 1
)
WHERE f.community_id IS NULL;

-- 5. Hardening RLS for document_chunks
DROP POLICY IF EXISTS "Users can read chunks for their files" ON public.document_chunks;
DROP POLICY IF EXISTS "Allow authenticated users to read document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Allow users to manage chunks for their files" ON public.document_chunks;
DROP POLICY IF EXISTS "Users can manage chunks for their own files" ON public.document_chunks;
DROP POLICY IF EXISTS "Users can view allowed document chunks" ON public.document_chunks;

CREATE POLICY "Users can view allowed document chunks"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.files f
    WHERE f.id = document_chunks.file_id
      AND (
        f.uploaded_by = auth.uid()
        OR (
          f.scope = 'community'
          AND f.community_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.community_members cm
            WHERE cm.community_id = f.community_id
              AND cm.user_id = auth.uid()
              AND cm.status = 'approved'
          )
        )
      )
  )
);

CREATE POLICY "Users can manage chunks for their own files"
ON public.document_chunks
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = document_chunks.file_id
      AND f.uploaded_by = auth.uid()
  )
);

-- 6. Hardening RLS for conversation_participants
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants if they created the conversation or are admin" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants if they belong or are admin" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can leave or admins/creators can remove participants" ON public.conversation_participants;

CREATE POLICY "Users can view participants if they belong or are admin"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.is_conversation_participant(auth.uid(), conversation_id)
);

CREATE POLICY "Users can add participants if they created the conversation or are admin"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.created_by = auth.uid() OR c.user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave or admins/creators can remove participants"
ON public.conversation_participants
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id
      AND (c.created_by = auth.uid() OR c.user_id = auth.uid())
  )
);

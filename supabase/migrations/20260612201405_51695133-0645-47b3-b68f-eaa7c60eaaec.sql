
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Conversations are viewable by everyone" ON public.conversations;
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(auth.uid(), id) OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow authenticated users to read document chunks" ON public.document_chunks;
CREATE POLICY "Users can read chunks for their files"
  ON public.document_chunks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.files f
      WHERE f.id = document_chunks.file_id
        AND (f.uploaded_by = auth.uid() OR f.scope = 'community')
    )
  );

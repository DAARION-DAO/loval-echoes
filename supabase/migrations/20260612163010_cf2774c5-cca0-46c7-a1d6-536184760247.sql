DROP POLICY IF EXISTS "Approved members can read their communities" ON public.communities;
CREATE POLICY "Members or owner can read communities"
ON public.communities FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR is_community_member(auth.uid(), id));
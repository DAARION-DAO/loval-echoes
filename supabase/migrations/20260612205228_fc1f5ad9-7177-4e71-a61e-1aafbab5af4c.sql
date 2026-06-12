
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE OR REPLACE FUNCTION public.soft_delete_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_conversation_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;

  SELECT conversation_id INTO v_conversation_id
  FROM public.messages
  WHERE id = p_message_id;

  IF v_conversation_id IS NULL THEN
    RAISE EXCEPTION 'Повідомлення не знайдено';
  END IF;

  IF public.is_admin(v_user_id)
     OR EXISTS (
       SELECT 1 FROM public.conversation_participants
       WHERE conversation_id = v_conversation_id
         AND user_id = v_user_id
         AND role IN ('owner', 'admin')
     )
  THEN
    UPDATE public.messages
    SET deleted_at = now(), deleted_by = v_user_id
    WHERE id = p_message_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Недостатньо прав для видалення повідомлення';
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_message(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_message(uuid) TO authenticated;

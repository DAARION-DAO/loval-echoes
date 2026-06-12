
CREATE OR REPLACE FUNCTION public.profiles_prevent_privileged_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- service_role / superuser / no-auth context: no restriction
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;
  -- Admins (guardians) may change anything
  IF public.is_admin(v_uid) THEN
    RETURN NEW;
  END IF;
  -- Non-admins: block sensitive column changes
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Заборонено змінювати role';
  END IF;
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    RAISE EXCEPTION 'Заборонено змінювати approval_status';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Заборонено змінювати email';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Заборонено змінювати user_id';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Заборонено змінювати id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privileged_self_update ON public.profiles;
CREATE TRIGGER profiles_prevent_privileged_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_prevent_privileged_self_update();

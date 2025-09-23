-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user function to store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'full_name', 
      split_part(NEW.email, '@', 1),
      'Пользователь'
    ),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(
      EXCLUDED.display_name,
      profiles.display_name
    ),
    email = COALESCE(
      EXCLUDED.email,
      profiles.email,
      NEW.email
    );
  RETURN NEW;
END;
$$;
-- Check if the user profile exists for radosvetdamir@gmail.com
INSERT INTO public.profiles (user_id, email, display_name, approval_status, created_at, updated_at)
VALUES (
  'bc9ea22f-d4be-4adb-95fd-852b1ca18022',
  'radosvetdamir@gmail.com', 
  'radosvetdamir',
  'approved',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  approval_status = 'approved',
  updated_at = now();
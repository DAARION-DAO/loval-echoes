-- Injected helper to insert the required auth user for radosvetdamir@gmail.com to prevent FK violation in 20250929131927
INSERT INTO auth.users (id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  'bc9ea22f-d4be-4adb-95fd-852b1ca18022',
  'radosvetdamir@gmail.com',
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"radosvetdamir"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

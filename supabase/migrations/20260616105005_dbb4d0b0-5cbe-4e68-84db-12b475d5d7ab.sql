UPDATE public.profiles
SET role = 'guardian',
    access_tier = 'guardian',
    approval_status = 'approved',
    updated_at = now()
WHERE email = 'radosvetdamir@gmail.com';
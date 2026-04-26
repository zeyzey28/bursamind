-- Profiles RLS Fix
-- Ensure users can insert their own profile during sign-up.
-- Note: If you have email confirmation ENABLED in Supabase, 
-- the client-side profile insert will fail because the user is not yet "authenticated".
-- In that case, the best practice is to use a Database Trigger on auth.users.

-- 1. Ensure RLS is enabled
alter table public.profiles enable row level security;

-- 2. Drop existing to stay clean
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- 3. Re-create policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- This policy allows the insert only if the authenticated user's ID matches the profile ID.
-- If email confirmation is DISABLED, this works perfectly from the client side.
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);


-- OPTIONAL: TRIGGER APPROACH (Recommended if email confirmation is ON)
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'citizen');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/

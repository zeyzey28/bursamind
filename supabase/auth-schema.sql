-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text not null,
  role text not null check (role in ('citizen', 'municipality')),
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle profile updates
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger on_profile_update
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

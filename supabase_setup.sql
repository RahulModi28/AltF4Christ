-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  branch text,
  semester text,
  year text,
  points int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Users policies
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Create resources table
create type resource_category as enum ('notes', 'question_paper', 'assignment', 'project', 'reference');

create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_url text not null,
  file_type text,
  subject text,
  branch text,
  semester int,
  year int,
  category resource_category,
  tags text[],
  uploaded_by uuid references public.users not null,
  average_rating float default 0,
  download_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on resources
alter table public.resources enable row level security;

-- Resources policies
create policy "Resources are viewable by everyone."
  on public.resources for select
  using ( true );

create policy "Authenticated users can upload resources."
  on public.resources for insert
  with check ( auth.uid() = uploaded_by );

-- Create ratings table
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  resource_id uuid references public.resources not null,
  user_id uuid references public.users not null,
  value int check (value >= 1 and value <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(resource_id, user_id)
);

-- Enable RLS on ratings
alter table public.ratings enable row level security;

-- Ratings policies
create policy "Ratings are viewable by everyone."
  on public.ratings for select
  using ( true );

create policy "Authenticated users can rate."
  on public.ratings for insert
  with check ( auth.uid() = user_id );

-- Function to handle new user registration trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, branch, semester, year, created_at)
  values (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'year',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

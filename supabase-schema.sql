-- SABIN MARUHE PORTFOLIO PRO V3 — SUPABASE
-- Execute this script in Supabase SQL Editor.
-- It is safe to run repeatedly: policies are recreated.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Sabin Maruhe',
  email text not null default 'maruhesabin@gmail.com',
  phone text not null default '0845360603',
  location text not null default 'Goma, Nord-Kivu, RDC',
  bio text not null default 'Visuala artisto, fotisto, videisto kaj grafikisto.',
  tagline text not null default 'Mi transformas ideojn en vidajn spertojn.',
  accent text not null default '#dfff3f',
  background text not null default '#08090d',
  font text not null default 'Inter',
  profile_image text,
  background_image text,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id bigint generated always as identity primary key,
  name text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'ĈIO',
  collaborators text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  request_type text not null default 'Kontakto',
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

-- Admin helper. SECURITY DEFINER is intentional: it only answers whether the
-- current authenticated UUID exists in the admins table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
  );
$$;

-- Database rule: a published project must contain at least 4 images.
create or replace function public.enforce_project_image_minimum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  published_now boolean;
  image_count integer;
begin
  pid := coalesce(NEW.project_id, OLD.project_id);

  select p.published into published_now
  from public.projects p
  where p.id = pid;

  -- When a project itself is being deleted, there is no publication rule to enforce.
  if published_now is null then
    return coalesce(NEW, OLD);
  end if;

  select count(*) into image_count
  from public.project_images
  where project_id = pid;

  if published_now and image_count < 4 then
    raise exception 'A published project must have at least 4 images.';
  end if;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists project_images_minimum_trigger on public.project_images;
create constraint trigger project_images_minimum_trigger
after delete or insert or update on public.project_images
deferrable initially deferred
for each row execute function public.enforce_project_image_minimum();

create or replace function public.enforce_project_publish_minimum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  image_count integer;
begin
  if NEW.published then
    select count(*) into image_count
    from public.project_images
    where project_id = NEW.id;

    if image_count < 4 then
      raise exception 'A published project must have at least 4 images.';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists projects_publish_minimum_trigger on public.projects;
create trigger projects_publish_minimum_trigger
before insert or update of published on public.projects
for each row execute function public.enforce_project_publish_minimum();

-- RLS
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.messages enable row level security;
alter table public.subscribers enable row level security;

-- Recreate policies so the script can be rerun.
drop policy if exists "admin can read own admin record" on public.admins;
drop policy if exists "public can read site settings" on public.site_settings;
drop policy if exists "admin can manage settings" on public.site_settings;
drop policy if exists "public can read social links" on public.social_links;
drop policy if exists "admin can manage social links" on public.social_links;
drop policy if exists "public can read published projects" on public.projects;
drop policy if exists "admin can manage projects" on public.projects;
drop policy if exists "public can read images of published projects" on public.project_images;
drop policy if exists "admin can manage project images" on public.project_images;
drop policy if exists "admin can read messages" on public.messages;
drop policy if exists "admin can update messages" on public.messages;
drop policy if exists "admin can delete messages" on public.messages;
drop policy if exists "anyone can send a message" on public.messages;
drop policy if exists "admin can read subscribers" on public.subscribers;
drop policy if exists "admin can delete subscribers" on public.subscribers;
drop policy if exists "anyone can subscribe" on public.subscribers;

create policy "admin can read own admin record"
on public.admins for select
using (auth.uid() = user_id);

create policy "public can read site settings"
on public.site_settings for select
using (true);

create policy "admin can manage settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read social links"
on public.social_links for select
using (true);

create policy "admin can manage social links"
on public.social_links for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published projects"
on public.projects for select
using (published = true or public.is_admin());

create policy "admin can manage projects"
on public.projects for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read images of published projects"
on public.project_images for select
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and (p.published = true or public.is_admin())
  )
);

create policy "admin can manage project images"
on public.project_images for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin can read messages"
on public.messages for select
using (public.is_admin());

create policy "admin can update messages"
on public.messages for update
using (public.is_admin())
with check (public.is_admin());

create policy "admin can delete messages"
on public.messages for delete
using (public.is_admin());

create policy "anyone can send a message"
on public.messages for insert
with check (
  char_length(trim(name)) between 1 and 120
  and char_length(trim(email)) between 3 and 320
  and char_length(trim(message)) between 1 and 5000
);

create policy "admin can read subscribers"
on public.subscribers for select
using (public.is_admin());

create policy "admin can delete subscribers"
on public.subscribers for delete
using (public.is_admin());

create policy "anyone can subscribe"
on public.subscribers for insert
with check (char_length(trim(email)) between 3 and 320);

-- Storage: portfolio images are public to read; only admins can write.
drop policy if exists "public can read portfolio media" on storage.objects;
drop policy if exists "admins can upload portfolio media" on storage.objects;
drop policy if exists "admins can update portfolio media" on storage.objects;
drop policy if exists "admins can delete portfolio media" on storage.objects;

create policy "public can read portfolio media"
on storage.objects for select
using (bucket_id = 'portfolio-media');

create policy "admins can upload portfolio media"
on storage.objects for insert
with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "admins can update portfolio media"
on storage.objects for update
using (bucket_id = 'portfolio-media' and public.is_admin())
with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "admins can delete portfolio media"
on storage.objects for delete
using (bucket_id = 'portfolio-media' and public.is_admin());

-- Initial social links, only when empty.
insert into public.social_links (name, url, sort_order)
select * from (values
  ('Instagram','https://instagram.com/',1),
  ('Facebook','https://facebook.com/',2),
  ('TikTok','https://tiktok.com/',3),
  ('YouTube','https://youtube.com/',4),
  ('Telegramo','https://t.me/',5)
) as seed(name,url,sort_order)
where not exists (select 1 from public.social_links);

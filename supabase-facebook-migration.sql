-- Run once in Supabase SQL Editor before enabling the Facebook link UI.
-- `profiles.name` remains the website display name.
alter table public.profiles
  add column if not exists facebook_name text;

comment on column public.profiles.facebook_name is
  'Public Facebook display name returned by the linked Supabase Auth Facebook identity.';

create table if not exists posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null default '',
  excerpt text not null default '',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_version_id bigint,
  published_at timestamptz,
  last_published_at timestamptz,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists post_versions (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  title text not null,
  excerpt text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_versions_post_idx on post_versions (post_id, created_at desc);

do $$ begin
  alter table posts add constraint posts_published_version_fk
    foreign key (published_version_id) references post_versions(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists post_visitors (
  post_id bigint not null references posts(id) on delete cascade,
  visitor_hash text not null,
  first_seen_at timestamptz not null default now(),
  primary key (post_id, visitor_hash)
);

-- Supabase exposes the public schema over its REST API; RLS with no policies keeps it closed.
-- The apps connect as the database owner, which bypasses RLS.
alter table posts enable row level security;
alter table post_versions enable row level security;
alter table post_visitors enable row level security;

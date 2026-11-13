create table if not exists post_reactions (
  post_id bigint not null references posts(id) on delete cascade,
  voter_id uuid not null,
  value smallint not null check (value in (1, -1)),
  feedback text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, voter_id)
);

create index if not exists post_reactions_feedback_idx on post_reactions (updated_at desc) where feedback <> '';

alter table post_reactions enable row level security;

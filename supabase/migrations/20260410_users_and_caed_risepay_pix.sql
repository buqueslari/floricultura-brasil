-- Campos para correlacionar pedido ↔ RisePay e status do pagamento (webhook)

alter table public.users_and_caed
  add column if not exists risepay_identifier text;

alter table public.users_and_caed
  add column if not exists external_reference text;

alter table public.users_and_caed
  add column if not exists payment_status text not null default 'pending';

create index if not exists users_and_caed_risepay_identifier_idx
  on public.users_and_caed (risepay_identifier)
  where risepay_identifier is not null;

comment on column public.users_and_caed.payment_status is
  'pending | paid — atualizado pelo webhook /api/risepay-webhook';

create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  nome_cliente text not null check (btrim(nome_cliente) <> ''),
  telefone text not null check (btrim(telefone) <> ''),
  endereco_completo text not null check (btrim(endereco_completo) <> ''),
  bairro text not null default '',
  cidade text not null default '',
  complemento text not null default '',
  ponto_referencia text not null default '',
  tipo_servico text not null default '',
  observacoes text not null default '',
  responsavel_id uuid default null,
  responsavel_nome text not null default '',
  origem_contato text not null default '',
  data_visita date not null,
  hora_visita time not null default '08:00',
  status text not null default 'agendada' check (status in ('agendada', 'realizada', 'cancelada', 'reagendada')),
  cliente_id uuid default null,
  orcamento_id uuid default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visitas enable row level security;

drop policy if exists "Tenant isolation on visitas" on public.visitas;
create policy "Tenant isolation on visitas"
  on public.visitas
  for all
  to authenticated
  using (empresa_id = get_user_empresa_id(auth.uid()))
  with check (empresa_id = get_user_empresa_id(auth.uid()));

drop trigger if exists update_visitas_updated_at on public.visitas;
create trigger update_visitas_updated_at
  before update on public.visitas
  for each row
  execute function public.update_updated_at_column();

create index if not exists idx_visitas_empresa_data on public.visitas (empresa_id, data_visita);
create index if not exists idx_visitas_empresa_status on public.visitas (empresa_id, status);

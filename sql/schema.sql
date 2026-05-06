-- Extensiones
create extension if not exists "pgcrypto";

-- Tipos base
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('superusuario', 'decano', 'secretaria', 'administrativo');
  end if;
  if not exists (select 1 from pg_type where typname = 'capability_type') then
    create type capability_type as enum (
      'gestionar_usuarios',
      'revisar_solicitudes',
      'aprobar_solicitudes',
      'generar_solicitudes'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'solicitud_tipo') then
    create type solicitud_tipo as enum ('permiso', 'justificacion');
  end if;
  if not exists (select 1 from pg_type where typname = 'solicitud_estado') then
    create type solicitud_estado as enum (
      'en_borrador',
      'en_revision_secretaria',
      'pendiente_aprobacion_decano',
      'aprobada',
      'rechazada'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nombres text not null,
  apellidos text not null,
  rol app_role not null default 'administrativo',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_capabilities (
  user_id uuid not null references public.profiles(id) on delete cascade,
  capability capability_type not null,
  otorgado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (user_id, capability)
);

create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  creado_por uuid not null references public.profiles(id),
  tipo solicitud_tipo not null default 'justificacion',
  fecha_inicio date not null,
  fecha_fin date not null,
  motivo text not null,
  justificativo_path text not null,
  justificativo_nombre text not null,
  estado solicitud_estado not null default 'en_revision_secretaria',
  revisado_por uuid references public.profiles(id),
  firmado_por uuid references public.profiles(id),
  observaciones_secretaria text,
  observaciones_decano text,
  fecha_firma timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fecha_rango_valido check (fecha_fin >= fecha_inicio)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_solicitudes on public.solicitudes;
create trigger trg_set_updated_at_solicitudes
before update on public.solicitudes
for each row execute procedure public.set_updated_at();

-- Tras crear perfil, asignar capacidades por rol
create or replace function public.handle_profile_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_capabilities(new.id, new.rol);
  return new;
end;
$$;

drop trigger if exists trg_profile_seed_caps on public.profiles;
create trigger trg_profile_seed_caps
after insert on public.profiles
for each row execute procedure public.handle_profile_after_insert();

-- Capacidades por defecto según rol
create or replace function public.seed_default_capabilities(p_user_id uuid, p_role app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_capabilities where user_id = p_user_id;

  if p_role in ('administrativo', 'secretaria', 'decano', 'superusuario') then
    insert into public.user_capabilities(user_id, capability) values (p_user_id, 'generar_solicitudes')
    on conflict do nothing;
  end if;

  if p_role in ('secretaria', 'decano', 'superusuario') then
    insert into public.user_capabilities(user_id, capability) values (p_user_id, 'revisar_solicitudes')
    on conflict do nothing;
  end if;

  if p_role in ('decano', 'superusuario') then
    insert into public.user_capabilities(user_id, capability) values (p_user_id, 'aprobar_solicitudes')
    on conflict do nothing;
  end if;

  -- Regla pedida: solo Decano crea usuarios.
  if p_role = 'decano' then
    insert into public.user_capabilities(user_id, capability) values (p_user_id, 'gestionar_usuarios')
    on conflict do nothing;
  end if;
end;
$$;

-- Permisos y RLS
alter table public.profiles enable row level security;
alter table public.user_capabilities enable row level security;
alter table public.solicitudes enable row level security;

create or replace function public.current_user_role()
returns app_role
language sql
stable
as $$
  select rol from public.profiles where id = auth.uid()
$$;

create or replace function public.has_capability(cap capability_type)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.rol = 'superusuario'
  )
  or exists (
    select 1
    from public.user_capabilities uc
    where uc.user_id = auth.uid() and uc.capability = cap
  )
$$;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read
on public.profiles for select
using (id = auth.uid() or public.current_user_role() in ('decano', 'superusuario'));

drop policy if exists profiles_insert_decano on public.profiles;
create policy profiles_insert_decano
on public.profiles for insert
with check (public.has_capability('gestionar_usuarios'));

drop policy if exists capabilities_read_self on public.user_capabilities;
create policy capabilities_read_self
on public.user_capabilities for select
using (user_id = auth.uid() or public.has_capability('gestionar_usuarios'));

drop policy if exists capabilities_manage_decano on public.user_capabilities;
create policy capabilities_manage_decano
on public.user_capabilities for all
using (public.has_capability('gestionar_usuarios'))
with check (public.has_capability('gestionar_usuarios'));

drop policy if exists solicitudes_select_policy on public.solicitudes;
create policy solicitudes_select_policy
on public.solicitudes for select
using (auth.role() = 'authenticated');

drop policy if exists solicitudes_insert_policy on public.solicitudes;
create policy solicitudes_insert_policy
on public.solicitudes for insert
with check (creado_por = auth.uid());

drop policy if exists solicitudes_update_policy on public.solicitudes;
create policy solicitudes_update_policy
on public.solicitudes for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Bucket para justificativos
insert into storage.buckets (id, name, public)
values ('justificativos', 'justificativos', true)
on conflict (id) do nothing;

drop policy if exists justificativos_select_all on storage.objects;
create policy justificativos_select_all
on storage.objects for select
using (bucket_id = 'justificativos' and auth.role() = 'authenticated');

drop policy if exists justificativos_insert_auth on storage.objects;
create policy justificativos_insert_auth
on storage.objects for insert
with check (bucket_id = 'justificativos' and auth.role() = 'authenticated');

drop policy if exists justificativos_update_auth on storage.objects;
create policy justificativos_update_auth
on storage.objects for update
using (bucket_id = 'justificativos' and auth.role() = 'authenticated')
with check (bucket_id = 'justificativos' and auth.role() = 'authenticated');

-- Malaxus Datenbankschema
-- Einfach komplett in den Supabase SQL Editor einfügen und "Run" klicken.
-- Dieses Skript kann gefahrlos nochmal ausgeführt werden (IF NOT EXISTS / OR REPLACE überall).

-- ------------------------------------------------------------------
-- Admin-E-Mails: wer sich mit einer dieser Adressen registriert, wird
-- automatisch Admin. Weitere Admins können später im Admin-Board
-- ernannt werden (profiles.role manuell auf 'admin' setzen).
-- ------------------------------------------------------------------
create or replace function public.is_admin_email(email text)
returns boolean
language sql
immutable
as $$
  select email in ('funiculera@gmail.com', 'felixschwanke16@gmail.com');
$$;

-- ------------------------------------------------------------------
-- profiles: ein Profil pro Spieler, 1:1 mit auth.users
-- ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  ingame_name text not null unique,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_color text default '#ffd93d',
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Hilfsfunktion, um RLS-Rekursion zu vermeiden (security definer umgeht die Policy der Funktion selbst).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Legt bei jeder neuen Registrierung automatisch ein Profil an.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, ingame_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'ingame_name', split_part(new.email, '@', 1)),
    case when public.is_admin_email(new.email) then 'admin' else 'customer' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- categories
-- ------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select using (true);

drop policy if exists "categories_write_admin" on public.categories;
create policy "categories_write_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------
-- products
-- ------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text not null default '',
  price_diamonds numeric not null default 1,
  unit text not null default 'piece' check (unit in ('piece', 'stack64', 'shulker')),
  type text not null default 'stock' check (type in ('stock', 'on_request')),
  stock_quantity int,
  low_stock_threshold int,
  image_url text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products_select_visible_or_admin" on public.products;
create policy "products_select_visible_or_admin" on public.products
  for select using (is_hidden = false or public.is_admin());

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Atomare Lagerbestand-Änderung (verhindert Race Conditions bei gleichzeitigen Bestellungen).
create or replace function public.adjust_product_stock(p_product_id uuid, p_delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock_quantity = greatest(0, coalesce(stock_quantity, 0) + p_delta)
  where id = p_product_id;
end;
$$;

-- ------------------------------------------------------------------
-- orders + order_items
-- ------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'received'
    check (status in ('received', 'accepted', 'processing', 'ready', 'delivered', 'rejected', 'cancelled')),
  note text,
  estimated_delivery text,
  admin_message text,
  paid boolean not null default false,
  reminder_sent_at timestamptz,
  total_diamonds numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_update_own_or_admin" on public.orders;
create policy "orders_update_own_or_admin" on public.orders
  for update using (auth.uid() = user_id or public.is_admin());

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price_diamonds numeric not null
);

alter table public.order_items enable row level security;

drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_order" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "order_items_insert_via_order" on public.order_items;
create policy "order_items_insert_via_order" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- Lagerbestand automatisch reduzieren, sobald eine Bestellung angenommen wird
-- (nur bei Lagerartikeln; "Auf Anfrage"-Artikel haben keinen Bestand).
create or replace function public.handle_order_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    update public.products p
    set stock_quantity = greatest(0, coalesce(p.stock_quantity, 0) - oi.quantity)
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id and p.type = 'stock';
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_accepted on public.orders;
create trigger on_order_accepted
  after update on public.orders
  for each row execute function public.handle_order_accepted();

-- ------------------------------------------------------------------
-- farms + farm_deliveries
-- ------------------------------------------------------------------
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  daily_amount_estimate text,
  created_at timestamptz not null default now()
);

alter table public.farms enable row level security;

drop policy if exists "farms_select_all" on public.farms;
create policy "farms_select_all" on public.farms for select using (true);

drop policy if exists "farms_write_admin" on public.farms;
create policy "farms_write_admin" on public.farms for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.farm_deliveries (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  quantity int not null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.farm_deliveries enable row level security;

drop policy if exists "farm_deliveries_admin_only" on public.farm_deliveries;
create policy "farm_deliveries_admin_only" on public.farm_deliveries for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------
-- Realtime: Admin-Board und Kunden-Konto hören live auf Änderungen
-- ------------------------------------------------------------------
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;

-- ------------------------------------------------------------------
-- Storage-Bucket für Produktbilder
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- ------------------------------------------------------------------
-- Seed-Daten: Kategorien, Beispielprodukte (inkl. 1 Artikel auf Anfrage),
-- eine Beispielfarm und eine Testbestellung.
-- ------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Baublöcke', 'baubloecke'),
  ('Erze', 'erze'),
  ('Nahrung', 'nahrung'),
  ('Redstone', 'redstone'),
  ('Werkzeuge', 'werkzeuge'),
  ('Seltenes', 'seltenes')
on conflict (slug) do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Eichenholz-Planken', id, 'Klassisches Bauholz für Häuser, Böden und Möbel.', 1, 'stack64', 'stock', 40, 10
from public.categories where slug = 'baubloecke'
on conflict do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Eisen-Barren', id, 'Geschmolzenes Eisen für Werkzeuge, Rüstung und Redstone-Technik.', 4, 'stack64', 'stock', 20, 5
from public.categories where slug = 'erze'
on conflict do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Steak', id, 'Saftiges gebratenes Steak, stillt den Hunger zuverlässig.', 2, 'stack64', 'stock', 30, 8
from public.categories where slug = 'nahrung'
on conflict do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Redstone-Staub', id, 'Für Schaltkreise, Fallen und automatische Türen.', 2, 'stack64', 'stock', 25, 10
from public.categories where slug = 'redstone'
on conflict do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Diamantschwert', id, 'Scharfe Klinge aus Diamant.', 5, 'piece', 'stock', 4, 2
from public.categories where slug = 'werkzeuge'
on conflict do nothing;

insert into public.products (name, category_id, description, price_diamonds, unit, type, stock_quantity, low_stock_threshold)
select 'Beacon', id, 'Strahlt einen weit sichtbaren Lichtstrahl aus und gibt Beacon-Effekte.', 15, 'piece', 'on_request', null, null
from public.categories where slug = 'seltenes'
on conflict do nothing;

insert into public.farms (name, product_id, daily_amount_estimate)
select 'Baumfarm', id, '~10 Stacks/Tag'
from public.products where name = 'Eichenholz-Planken'
limit 1;

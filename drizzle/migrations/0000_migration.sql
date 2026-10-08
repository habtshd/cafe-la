
create type public.app_role as enum ('admin','staff');
create type public.order_status as enum ('received','confirmed','preparing','ready','out_for_delivery','completed','cancelled');
create type public.order_type as enum ('pickup','delivery','dine_in');
create type public.reservation_status as enum ('pending','confirmed','completed','cancelled');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins insert roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admins delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_first_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_first_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.business_settings (
  id int primary key default 1 check (id = 1),
  cafe_name text not null default 'La Nouvelle Cafe',
  tagline text not null default 'Good food. Great coffee. A place to enjoy.',
  about text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  opening_hours text not null default '',
  map_url text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  telegram_url text not null default '',
  tiktok_url text not null default '',
  offers_pickup boolean not null default true,
  offers_delivery boolean not null default true,
  offers_dine_in boolean not null default true,
  offers_reservations boolean not null default true,
  accepting_orders boolean not null default true,
  delivery_fee numeric(10,2) not null default 0,
  prep_time_minutes int not null default 20,
  updated_at timestamptz not null default now()
);
grant select on public.business_settings to anon, authenticated;
grant update on public.business_settings to authenticated;
grant all on public.business_settings to service_role;
alter table public.business_settings enable row level security;
create policy "settings public read" on public.business_settings for select to anon, authenticated using (true);
create policy "admins update settings" on public.business_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger settings_touch before update on public.business_settings for each row execute function public.touch_updated_at();
insert into public.business_settings (id) values (1);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.menu_categories to anon, authenticated;
grant insert, update, delete on public.menu_categories to authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "categories public read" on public.menu_categories for select to anon, authenticated using (archived = false or public.is_staff(auth.uid()));
create policy "staff manage categories" on public.menu_categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  image_path text,
  available boolean not null default true,
  featured boolean not null default false,
  archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.menu_items(category_id);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "items public read" on public.menu_items for select to anon, authenticated using (archived = false or public.is_staff(auth.uid()));
create policy "staff manage items" on public.menu_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger items_touch before update on public.menu_items for each row execute function public.touch_updated_at();

create sequence public.order_number_seq start 1001;
grant usage on sequence public.order_number_seq to service_role;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('LN-' || nextval('public.order_number_seq')),
  tracking_token uuid not null unique default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  order_type public.order_type not null,
  delivery_address text,
  table_number text,
  pickup_time text,
  note text,
  status public.order_status not null default 'received',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders(status, created_at desc);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  note text
);
create index on public.order_items(order_id);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "staff read order items" on public.order_items for select to authenticated using (public.is_staff(auth.uid()));

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  reservation_date date not null,
  reservation_time text not null,
  guests int not null check (guests between 1 and 50),
  special_request text,
  status public.reservation_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index on public.reservations(reservation_date);
grant select, update on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;
create policy "staff read reservations" on public.reservations for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update reservations" on public.reservations for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.reservations;

create policy "staff read menu images" on storage.objects for select to authenticated using (bucket_id = 'menu-images' and public.is_staff(auth.uid()));
create policy "staff upload menu images" on storage.objects for insert to authenticated with check (bucket_id = 'menu-images' and public.is_staff(auth.uid()));
create policy "staff update menu images" on storage.objects for update to authenticated using (bucket_id = 'menu-images' and public.is_staff(auth.uid()));
create policy "staff delete menu images" on storage.objects for delete to authenticated using (bucket_id = 'menu-images' and public.is_staff(auth.uid()));

-- MM Tintas e Complementos
-- Initial production schema: catalog, content, quotes, RBAC, audit and media.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.app_role as enum ('admin', 'editor', 'viewer');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.publication_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.discount_type as enum ('percentage', 'fixed_amount');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.quote_status as enum (
    'new',
    'contacted',
    'in_progress',
    'converted',
    'cancelled'
  );
exception
  when duplicate_object then null;
end
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_path text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    full_name is null or char_length(trim(full_name)) between 2 and 120
  )
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.brands (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  logo_path text,
  website text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_name_not_blank check (char_length(trim(name)) between 1 and 120),
  constraint brands_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint brands_website_format check (
    website is null or website ~ '^https?://'
  ),
  constraint brands_display_order_nonnegative check (display_order >= 0)
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image_path text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (char_length(trim(name)) between 1 and 120),
  constraint categories_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint categories_display_order_nonnegative check (display_order >= 0)
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  sku text,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  application text,
  finish text,
  color text,
  package_size text,
  unit text not null default 'unidade',
  price numeric(12, 2),
  compare_at_price numeric(12, 2),
  cost_price numeric(12, 2),
  stock_quantity numeric(12, 3),
  is_featured boolean not null default false,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_name_not_blank check (char_length(trim(name)) between 1 and 180),
  constraint products_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint products_unit_not_blank check (char_length(trim(unit)) between 1 and 40),
  constraint products_price_nonnegative check (price is null or price >= 0),
  constraint products_compare_price_nonnegative check (
    compare_at_price is null or compare_at_price >= 0
  ),
  constraint products_cost_price_nonnegative check (cost_price is null or cost_price >= 0),
  constraint products_stock_nonnegative check (stock_quantity is null or stock_quantity >= 0),
  constraint products_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.product_images (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  width integer,
  height integer,
  mime_type text,
  created_at timestamptz not null default now(),
  constraint product_images_path_not_blank check (char_length(trim(storage_path)) > 0),
  constraint product_images_display_order_nonnegative check (display_order >= 0),
  constraint product_images_width_positive check (width is null or width > 0),
  constraint product_images_height_positive check (height is null or height > 0)
);

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create table public.promotions (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  badge text,
  discount_type public.discount_type,
  discount_value numeric(12, 2),
  banner_path text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint promotions_name_not_blank check (char_length(trim(name)) between 1 and 180),
  constraint promotions_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint promotions_date_order check (ends_at > starts_at),
  constraint promotions_discount_nonnegative check (
    discount_value is null or discount_value >= 0
  ),
  constraint promotions_percentage_limit check (
    discount_type <> 'percentage'
    or discount_value is null
    or discount_value <= 100
  )
);

create table public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  promotional_price numeric(12, 2),
  created_at timestamptz not null default now(),
  primary key (promotion_id, product_id),
  constraint promotion_products_price_nonnegative check (
    promotional_price is null or promotional_price >= 0
  )
);

create sequence public.quote_protocol_sequence start with 1 increment by 1;

create or replace function public.generate_quote_protocol()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select format(
    'ORC-%s-%s',
    to_char(clock_timestamp(), 'YYYYMMDD'),
    lpad(nextval('public.quote_protocol_sequence')::text, 6, '0')
  );
$$;

create table public.quote_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  protocol text not null unique default public.generate_quote_protocol(),
  customer_name text not null,
  email text,
  phone text not null,
  city text,
  neighborhood text,
  status public.quote_status not null default 'new',
  message text,
  source text not null default 'website',
  privacy_consent boolean not null,
  marketing_consent boolean not null default false,
  estimated_total numeric(12, 2),
  assigned_to uuid references public.profiles(id) on delete set null,
  contacted_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_requests_name_length check (
    char_length(trim(customer_name)) between 2 and 120
  ),
  constraint quote_requests_phone_length check (
    char_length(trim(phone)) between 8 and 30
  ),
  constraint quote_requests_email_length check (
    email is null or char_length(email) <= 254
  ),
  constraint quote_requests_city_length check (
    city is null or char_length(city) <= 120
  ),
  constraint quote_requests_neighborhood_length check (
    neighborhood is null or char_length(neighborhood) <= 120
  ),
  constraint quote_requests_message_length check (
    message is null or char_length(message) <= 5000
  ),
  constraint quote_requests_source_length check (
    char_length(source) between 1 and 80
  ),
  constraint quote_requests_privacy_required check (privacy_consent),
  constraint quote_requests_total_nonnegative check (
    estimated_total is null or estimated_total >= 0
  )
);

create table public.quote_items (
  id uuid primary key default extensions.gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity numeric(12, 3) not null default 1,
  unit text not null default 'unidade',
  notes text,
  created_at timestamptz not null default now(),
  constraint quote_items_product_name_not_blank check (
    char_length(trim(product_name)) between 1 and 180
  ),
  constraint quote_items_quantity_positive check (quantity > 0),
  constraint quote_items_unit_not_blank check (char_length(trim(unit)) between 1 and 40),
  constraint quote_items_notes_length check (
    notes is null or char_length(notes) <= 1000
  )
);

create table public.post_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_categories_name_not_blank check (
    char_length(trim(name)) between 1 and 120
  ),
  constraint post_categories_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint post_categories_display_order_nonnegative check (display_order >= 0)
);

create table public.post_tags (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint post_tags_name_not_blank check (char_length(trim(name)) between 1 and 80),
  constraint post_tags_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create table public.posts (
  id uuid primary key default extensions.gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null,
  excerpt text,
  content text not null,
  cover_image_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint posts_title_not_blank check (char_length(trim(title)) between 1 and 200),
  constraint posts_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint posts_content_not_blank check (char_length(trim(content)) > 0)
);

create table public.post_category_assignments (
  post_id uuid not null references public.posts(id) on delete cascade,
  category_id uuid not null references public.post_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

create table public.post_tag_assignments (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table public.site_settings (
  key text primary key,
  setting_group text not null default 'general',
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_key_format check (
    key ~ '^[a-z][a-z0-9_.-]{1,99}$'
  ),
  constraint site_settings_group_format check (
    setting_group ~ '^[a-z][a-z0-9_-]{1,49}$'
  ),
  constraint site_settings_value_object check (
    jsonb_typeof(value) = 'object'
  ),
  constraint site_settings_contract check (
    (key = 'business_profile' and setting_group = 'business')
    or (key = 'contact_profile' and setting_group = 'contact')
    or (key = 'opening_hours' and setting_group = 'hours')
    or (key = 'seo_defaults' and setting_group = 'seo')
    or (key = 'social_and_features' and setting_group = 'social')
  )
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_valid check (action in ('INSERT', 'UPDATE', 'DELETE')),
  constraint audit_logs_table_not_blank check (char_length(trim(table_name)) > 0)
);

-- Central authorization helpers. SECURITY DEFINER avoids policy recursion while
-- still validating the authenticated user and the active profile.
create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and ur.role = required_role
      and p.active
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and p.active
  );
$$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin'::public.app_role)
    or public.has_role('editor'::public.app_role);
$$;

create or replace function public.is_product_public(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products p
    where p.id = target_product_id
      and p.deleted_at is null
      and p.status = 'published'::public.publication_status
      and p.published_at is not null
      and p.published_at <= now()
  );
$$;

create or replace function public.is_post_public(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target_post_id
      and p.deleted_at is null
      and p.status = 'published'::public.publication_status
      and p.published_at is not null
      and p.published_at <= now()
  );
$$;

create or replace function public.is_promotion_public(target_promotion_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.promotions p
    where p.id = target_promotion_id
      and p.deleted_at is null
      and p.is_active
      and p.status = 'published'::public.publication_status
      and p.published_at is not null
      and p.published_at <= now()
      and p.starts_at <= now()
      and p.ends_at > now()
  );
$$;

-- Safe, publication-aware catalog surface. Internal cost, stock and metadata
-- never reach anonymous clients; prices are exposed only when enabled.
create or replace view public.public_products
with (security_barrier = true)
as
select
  p.id,
  p.brand_id,
  p.sku,
  p.name,
  p.slug,
  p.short_description,
  p.description,
  p.application,
  p.finish,
  p.color,
  p.package_size,
  p.unit,
  case
    when exists (
      select 1
      from public.site_settings s
      where s.key = 'social_and_features'
        and s.is_public
        and s.value ->> 'pricesEnabled' = 'true'
    ) then p.price
    else null
  end as price,
  case
    when exists (
      select 1
      from public.site_settings s
      where s.key = 'social_and_features'
        and s.is_public
        and s.value ->> 'pricesEnabled' = 'true'
    ) then p.compare_at_price
    else null
  end as compare_at_price,
  p.is_featured,
  p.status,
  p.published_at,
  p.seo_title,
  p.seo_description,
  p.created_at,
  p.updated_at,
  p.deleted_at
from public.products p
where p.deleted_at is null
  and p.status = 'published'::public.publication_status
  and p.published_at is not null
  and p.published_at <= now();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'::public.publication_status
    and new.published_at is null then
    new.published_at = now();
  end if;

  if new.status <> 'published'::public.publication_status then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_path)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.log_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id text;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
  if row_id is null and tg_table_name = 'site_settings' then
    row_id := coalesce(to_jsonb(new) ->> 'key', to_jsonb(old) ->> 'key');
  end if;
  if row_id is null and tg_table_name = 'user_roles' then
    row_id := coalesce(to_jsonb(new) ->> 'user_id', to_jsonb(old) ->> 'user_id');
  end if;

  insert into public.audit_logs (
    actor_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

-- Atomic, narrow public entry point for quote submissions. Anonymous callers
-- cannot write arbitrary quote items or read customer data.
create or replace function public.submit_quote_request(payload jsonb)
returns table (id uuid, protocol text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  new_quote public.quote_requests;
  item jsonb;
  item_count integer;
  resolved_product_id uuid;
  resolved_product_name text;
  resolved_unit text;
  resolved_quantity numeric(12, 3);
begin
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'Dados do orçamento inválidos.'
      using errcode = '22023';
  end if;

  if octet_length(payload::text) > 65536 then
    raise exception 'A solicitação excede o tamanho permitido.'
      using errcode = '22023';
  end if;

  if char_length(trim(coalesce(payload ->> 'customer_name', ''))) not between 2 and 120 then
    raise exception 'Informe um nome válido.'
      using errcode = '22023';
  end if;

  if char_length(trim(coalesce(payload ->> 'phone', ''))) not between 8 and 30 then
    raise exception 'Informe um telefone válido.'
      using errcode = '22023';
  end if;

  if char_length(
    regexp_replace(trim(payload ->> 'phone'), '[^0-9+]', '', 'g')
  ) not between 8 and 20 then
    raise exception 'Informe um telefone válido.'
      using errcode = '22023';
  end if;

  if char_length(trim(coalesce(payload ->> 'city', ''))) > 120
    or char_length(trim(coalesce(payload ->> 'neighborhood', ''))) > 120
    or char_length(coalesce(payload ->> 'message', '')) > 5000 then
    raise exception 'Um ou mais campos excedem o tamanho permitido.'
      using errcode = '22023';
  end if;

  if nullif(trim(coalesce(payload ->> 'email', '')), '') is not null
    and (
      char_length(trim(payload ->> 'email')) > 254
      or trim(payload ->> 'email') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ) then
    raise exception 'Informe um e-mail válido.'
      using errcode = '22023';
  end if;

  if coalesce((payload ->> 'privacy_consent')::boolean, false) is not true then
    raise exception 'O consentimento de privacidade é obrigatório.'
      using errcode = '22023';
  end if;

  if payload ? 'items' and jsonb_typeof(payload -> 'items') <> 'array' then
    raise exception 'A lista de itens é inválida.'
      using errcode = '22023';
  end if;

  item_count := coalesce(jsonb_array_length(coalesce(payload -> 'items', '[]'::jsonb)), 0);
  if item_count > 30 then
    raise exception 'O orçamento aceita no máximo 30 itens.'
      using errcode = '22023';
  end if;

  if item_count = 0
    and nullif(trim(coalesce(payload ->> 'message', '')), '') is null then
    raise exception 'Informe ao menos um item ou uma mensagem.'
      using errcode = '22023';
  end if;

  -- A small database-side throttle protects the anonymous RPC even when an
  -- upstream WAF is unavailable. Production should additionally enable
  -- CAPTCHA and IP-based rate limiting at the edge.
  if (
    select count(*) >= 3
    from public.quote_requests qr
    where qr.phone = regexp_replace(trim(payload ->> 'phone'), '[^0-9+]', '', 'g')
      and qr.created_at >= now() - interval '30 minutes'
  ) then
    raise exception 'Muitas solicitações recentes. Aguarde antes de tentar novamente.'
      using errcode = 'P0001';
  end if;

  insert into public.quote_requests (
    customer_name,
    email,
    phone,
    city,
    neighborhood,
    message,
    source,
    privacy_consent,
    marketing_consent
  )
  values (
    trim(payload ->> 'customer_name'),
    nullif(trim(coalesce(payload ->> 'email', '')), ''),
    regexp_replace(trim(payload ->> 'phone'), '[^0-9+]', '', 'g'),
    nullif(trim(coalesce(payload ->> 'city', '')), ''),
    nullif(trim(coalesce(payload ->> 'neighborhood', '')), ''),
    nullif(trim(coalesce(payload ->> 'message', '')), ''),
    left(coalesce(nullif(trim(payload ->> 'source'), ''), 'website'), 80),
    true,
    coalesce((payload ->> 'marketing_consent')::boolean, false)
  )
  returning * into new_quote;

  for item in
    select value from jsonb_array_elements(coalesce(payload -> 'items', '[]'::jsonb))
  loop
    resolved_product_id := null;
    resolved_product_name := null;

    if nullif(item ->> 'product_id', '') is not null then
      begin
        resolved_product_id := (item ->> 'product_id')::uuid;
      exception
        when invalid_text_representation then
          raise exception 'Produto inválido no orçamento.'
            using errcode = '22023';
      end;

      select p.name, p.unit
      into resolved_product_name, resolved_unit
      from public.products p
      where p.id = resolved_product_id
        and public.is_product_public(p.id);

      if not found then
        raise exception 'Produto indisponível no orçamento.'
          using errcode = '22023';
      end if;
    else
      resolved_product_name := nullif(trim(coalesce(item ->> 'product_name', '')), '');
      resolved_unit := nullif(trim(coalesce(item ->> 'unit', '')), '');
    end if;

    if resolved_product_name is null or char_length(resolved_product_name) > 180 then
      raise exception 'Informe um item válido.'
        using errcode = '22023';
    end if;

    if char_length(coalesce(item ->> 'notes', '')) > 1000
      or char_length(coalesce(item ->> 'unit', '')) > 40 then
      raise exception 'Um item do orçamento excede o tamanho permitido.'
        using errcode = '22023';
    end if;

    begin
      resolved_quantity := coalesce((item ->> 'quantity')::numeric, 1);
    exception
      when invalid_text_representation then
        raise exception 'Quantidade inválida no orçamento.'
          using errcode = '22023';
    end;

    if resolved_quantity <= 0 or resolved_quantity > 999999 then
      raise exception 'Quantidade inválida no orçamento.'
        using errcode = '22023';
    end if;

    insert into public.quote_items (
      quote_request_id,
      product_id,
      product_name,
      quantity,
      unit,
      notes
    )
    values (
      new_quote.id,
      resolved_product_id,
      resolved_product_name,
      resolved_quantity,
      coalesce(resolved_unit, 'unidade'),
      nullif(trim(coalesce(item ->> 'notes', '')), '')
    );
  end loop;

  return query select new_quote.id, new_quote.protocol;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger brands_touch_updated_at
  before update on public.brands
  for each row execute function public.touch_updated_at();
create trigger categories_touch_updated_at
  before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
create trigger promotions_touch_updated_at
  before update on public.promotions
  for each row execute function public.touch_updated_at();
create trigger quote_requests_touch_updated_at
  before update on public.quote_requests
  for each row execute function public.touch_updated_at();
create trigger post_categories_touch_updated_at
  before update on public.post_categories
  for each row execute function public.touch_updated_at();
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

create trigger products_sync_published_at
  before insert or update of status, published_at on public.products
  for each row execute function public.sync_published_at();
create trigger promotions_sync_published_at
  before insert or update of status, published_at on public.promotions
  for each row execute function public.sync_published_at();
create trigger posts_sync_published_at
  before insert or update of status, published_at on public.posts
  for each row execute function public.sync_published_at();

create trigger brands_audit
  after insert or update or delete on public.brands
  for each row execute function public.log_row_change();
create trigger categories_audit
  after insert or update or delete on public.categories
  for each row execute function public.log_row_change();
create trigger products_audit
  after insert or update or delete on public.products
  for each row execute function public.log_row_change();
create trigger promotions_audit
  after insert or update or delete on public.promotions
  for each row execute function public.log_row_change();
create trigger posts_audit
  after insert or update or delete on public.posts
  for each row execute function public.log_row_change();
create trigger site_settings_audit
  after insert or update or delete on public.site_settings
  for each row execute function public.log_row_change();
create trigger user_roles_audit
  after insert or update or delete on public.user_roles
  for each row execute function public.log_row_change();

create unique index brands_slug_unique on public.brands (lower(slug));
create index brands_listing_idx on public.brands (is_active, is_featured desc, display_order, name);

create unique index categories_slug_unique on public.categories (lower(slug));
create index categories_listing_idx on public.categories (is_active, display_order, name);

create unique index products_slug_active_unique
  on public.products (lower(slug)) where deleted_at is null;
create unique index products_sku_active_unique
  on public.products (lower(sku)) where sku is not null and deleted_at is null;
create index products_brand_idx on public.products (brand_id) where deleted_at is null;
create index products_publication_idx
  on public.products (status, published_at desc) where deleted_at is null;
create index products_featured_idx
  on public.products (is_featured, published_at desc)
  where deleted_at is null and status = 'published';
create index products_search_idx
  on public.products using gin (
    to_tsvector(
      'portuguese',
      coalesce(name, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(color, '') || ' ' ||
      coalesce(finish, '')
    )
  );

create unique index product_images_path_unique on public.product_images (storage_path);
create unique index product_images_primary_unique
  on public.product_images (product_id) where is_primary;
create index product_images_order_idx
  on public.product_images (product_id, display_order, created_at);
create index product_categories_category_idx
  on public.product_categories (category_id, product_id);

create unique index promotions_slug_active_unique
  on public.promotions (lower(slug)) where deleted_at is null;
create index promotions_publication_idx
  on public.promotions (status, is_active, starts_at, ends_at) where deleted_at is null;
create index promotion_products_product_idx
  on public.promotion_products (product_id, promotion_id);

create index quote_requests_status_created_idx
  on public.quote_requests (status, created_at desc);
create index quote_requests_assigned_idx
  on public.quote_requests (assigned_to, status, created_at desc);
create index quote_requests_contact_idx
  on public.quote_requests (lower(email), phone);
create index quote_requests_phone_created_idx
  on public.quote_requests (phone, created_at desc);
create index quote_items_request_idx on public.quote_items (quote_request_id);
create index quote_items_product_idx on public.quote_items (product_id);

create unique index post_categories_slug_unique on public.post_categories (lower(slug));
create unique index post_tags_slug_unique on public.post_tags (lower(slug));
create unique index posts_slug_active_unique
  on public.posts (lower(slug)) where deleted_at is null;
create index posts_publication_idx
  on public.posts (status, published_at desc) where deleted_at is null;
create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_search_idx
  on public.posts using gin (
    to_tsvector(
      'portuguese',
      coalesce(title, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(content, '')
    )
  );
create index post_category_assignments_category_idx
  on public.post_category_assignments (category_id, post_id);
create index post_tag_assignments_tag_idx
  on public.post_tag_assignments (tag_id, post_id);

create index site_settings_group_idx on public.site_settings (setting_group, key);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_record_idx
  on public.audit_logs (table_name, record_id, created_at desc);
create index user_roles_role_idx on public.user_roles (role, user_id);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;
alter table public.post_categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_category_assignments enable row level security;
alter table public.post_tag_assignments enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_self_or_staff"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_staff());
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) and active)
  with check (id = (select auth.uid()) and active);
create policy "profiles_admin_update"
  on public.profiles for update
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "user_roles_select_self_or_staff"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_staff());
create policy "user_roles_admin_insert"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role('admin'));
create policy "user_roles_admin_update"
  on public.user_roles for update
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
create policy "user_roles_admin_delete"
  on public.user_roles for delete
  to authenticated
  using (public.has_role('admin'));

create policy "brands_public_read"
  on public.brands for select
  to anon, authenticated
  using (is_active);
create policy "brands_staff_read"
  on public.brands for select
  to authenticated
  using (public.is_staff());
create policy "brands_content_insert"
  on public.brands for insert
  to authenticated
  with check (public.can_manage_content());
create policy "brands_content_update"
  on public.brands for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "brands_content_delete"
  on public.brands for delete
  to authenticated
  using (public.can_manage_content());

create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (is_active);
create policy "categories_staff_read"
  on public.categories for select
  to authenticated
  using (public.is_staff());
create policy "categories_content_insert"
  on public.categories for insert
  to authenticated
  with check (public.can_manage_content());
create policy "categories_content_update"
  on public.categories for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "categories_content_delete"
  on public.categories for delete
  to authenticated
  using (public.can_manage_content());

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (public.is_product_public(id));
create policy "products_staff_read"
  on public.products for select
  to authenticated
  using (public.is_staff());
create policy "products_content_insert"
  on public.products for insert
  to authenticated
  with check (public.can_manage_content());
create policy "products_content_update"
  on public.products for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "products_content_delete"
  on public.products for delete
  to authenticated
  using (public.can_manage_content());

create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (public.is_product_public(product_id));
create policy "product_images_staff_read"
  on public.product_images for select
  to authenticated
  using (public.is_staff());
create policy "product_images_content_insert"
  on public.product_images for insert
  to authenticated
  with check (public.can_manage_content());
create policy "product_images_content_update"
  on public.product_images for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "product_images_content_delete"
  on public.product_images for delete
  to authenticated
  using (public.can_manage_content());

create policy "product_categories_public_read"
  on public.product_categories for select
  to anon, authenticated
  using (public.is_product_public(product_id));
create policy "product_categories_staff_read"
  on public.product_categories for select
  to authenticated
  using (public.is_staff());
create policy "product_categories_content_insert"
  on public.product_categories for insert
  to authenticated
  with check (public.can_manage_content());
create policy "product_categories_content_update"
  on public.product_categories for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "product_categories_content_delete"
  on public.product_categories for delete
  to authenticated
  using (public.can_manage_content());

create policy "promotions_public_read"
  on public.promotions for select
  to anon, authenticated
  using (public.is_promotion_public(id));
create policy "promotions_staff_read"
  on public.promotions for select
  to authenticated
  using (public.is_staff());
create policy "promotions_content_insert"
  on public.promotions for insert
  to authenticated
  with check (public.can_manage_content());
create policy "promotions_content_update"
  on public.promotions for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "promotions_content_delete"
  on public.promotions for delete
  to authenticated
  using (public.can_manage_content());

create policy "promotion_products_public_read"
  on public.promotion_products for select
  to anon, authenticated
  using (
    public.is_promotion_public(promotion_id)
    and public.is_product_public(product_id)
  );
create policy "promotion_products_staff_read"
  on public.promotion_products for select
  to authenticated
  using (public.is_staff());
create policy "promotion_products_content_insert"
  on public.promotion_products for insert
  to authenticated
  with check (public.can_manage_content());
create policy "promotion_products_content_update"
  on public.promotion_products for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "promotion_products_content_delete"
  on public.promotion_products for delete
  to authenticated
  using (public.can_manage_content());

create policy "quote_requests_staff_read"
  on public.quote_requests for select
  to authenticated
  using (public.is_staff());
create policy "quote_requests_staff_update"
  on public.quote_requests for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "quote_requests_admin_delete"
  on public.quote_requests for delete
  to authenticated
  using (public.has_role('admin'));

create policy "quote_items_staff_read"
  on public.quote_items for select
  to authenticated
  using (public.is_staff());
create policy "quote_items_staff_insert"
  on public.quote_items for insert
  to authenticated
  with check (public.can_manage_content());
create policy "quote_items_staff_update"
  on public.quote_items for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "quote_items_admin_delete"
  on public.quote_items for delete
  to authenticated
  using (public.has_role('admin'));

create policy "post_categories_public_read"
  on public.post_categories for select
  to anon, authenticated
  using (true);
create policy "post_categories_content_insert"
  on public.post_categories for insert
  to authenticated
  with check (public.can_manage_content());
create policy "post_categories_content_update"
  on public.post_categories for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "post_categories_content_delete"
  on public.post_categories for delete
  to authenticated
  using (public.can_manage_content());

create policy "post_tags_public_read"
  on public.post_tags for select
  to anon, authenticated
  using (true);
create policy "post_tags_content_insert"
  on public.post_tags for insert
  to authenticated
  with check (public.can_manage_content());
create policy "post_tags_content_update"
  on public.post_tags for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "post_tags_content_delete"
  on public.post_tags for delete
  to authenticated
  using (public.can_manage_content());

create policy "posts_public_read"
  on public.posts for select
  to anon, authenticated
  using (public.is_post_public(id));
create policy "posts_staff_read"
  on public.posts for select
  to authenticated
  using (public.is_staff());
create policy "posts_content_insert"
  on public.posts for insert
  to authenticated
  with check (public.can_manage_content());
create policy "posts_content_update"
  on public.posts for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "posts_content_delete"
  on public.posts for delete
  to authenticated
  using (public.can_manage_content());

create policy "post_category_assignments_public_read"
  on public.post_category_assignments for select
  to anon, authenticated
  using (public.is_post_public(post_id));
create policy "post_category_assignments_staff_read"
  on public.post_category_assignments for select
  to authenticated
  using (public.is_staff());
create policy "post_category_assignments_content_insert"
  on public.post_category_assignments for insert
  to authenticated
  with check (public.can_manage_content());
create policy "post_category_assignments_content_update"
  on public.post_category_assignments for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "post_category_assignments_content_delete"
  on public.post_category_assignments for delete
  to authenticated
  using (public.can_manage_content());

create policy "post_tag_assignments_public_read"
  on public.post_tag_assignments for select
  to anon, authenticated
  using (public.is_post_public(post_id));
create policy "post_tag_assignments_staff_read"
  on public.post_tag_assignments for select
  to authenticated
  using (public.is_staff());
create policy "post_tag_assignments_content_insert"
  on public.post_tag_assignments for insert
  to authenticated
  with check (public.can_manage_content());
create policy "post_tag_assignments_content_update"
  on public.post_tag_assignments for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
create policy "post_tag_assignments_content_delete"
  on public.post_tag_assignments for delete
  to authenticated
  using (public.can_manage_content());

create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (is_public);
create policy "site_settings_staff_read"
  on public.site_settings for select
  to authenticated
  using (public.is_staff());
create policy "site_settings_admin_insert"
  on public.site_settings for insert
  to authenticated
  with check (public.has_role('admin'));
create policy "site_settings_admin_update"
  on public.site_settings for update
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
create policy "site_settings_admin_delete"
  on public.site_settings for delete
  to authenticated
  using (public.has_role('admin'));

create policy "audit_logs_admin_read"
  on public.audit_logs for select
  to authenticated
  using (public.has_role('admin'));

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.brands,
  public.categories,
  public.product_images,
  public.product_categories,
  public.promotions,
  public.promotion_products,
  public.post_categories,
  public.post_tags,
  public.posts,
  public.post_category_assignments,
  public.post_tag_assignments,
  public.site_settings
to anon, authenticated;

grant select on public.public_products to anon, authenticated;
grant select on public.products to authenticated;

grant select on public.profiles,
  public.user_roles,
  public.quote_requests,
  public.quote_items,
  public.audit_logs
to authenticated;

grant insert, update, delete on public.brands,
  public.categories,
  public.product_images,
  public.product_categories,
  public.promotion_products,
  public.post_categories,
  public.post_tags,
  public.post_category_assignments,
  public.post_tag_assignments,
  public.quote_items,
  public.site_settings
to authenticated;

grant insert, update on public.products,
  public.promotions,
  public.posts
to authenticated;
grant update (
  status,
  estimated_total,
  assigned_to,
  contacted_at,
  converted_at
) on public.quote_requests to authenticated;
grant delete on public.quote_requests to authenticated;
grant insert, update, delete on public.user_roles to authenticated;
grant update (full_name, avatar_path, phone, active) on public.profiles to authenticated;
grant usage, select on sequence public.audit_logs_id_seq to authenticated;

revoke all on function public.generate_quote_protocol() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.sync_published_at() from public, anon, authenticated;
revoke all on function public.log_row_change() from public, anon, authenticated;

revoke all on function public.has_role(public.app_role) from public;
revoke all on function public.is_staff() from public;
revoke all on function public.can_manage_content() from public;
revoke all on function public.is_product_public(uuid) from public;
revoke all on function public.is_post_public(uuid) from public;
revoke all on function public.is_promotion_public(uuid) from public;
revoke all on function public.submit_quote_request(jsonb) from public;

grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.can_manage_content() to authenticated;
grant execute on function public.is_product_public(uuid) to anon, authenticated;
grant execute on function public.is_post_public(uuid) to anon, authenticated;
grant execute on function public.is_promotion_public(uuid) to anon, authenticated;
grant execute on function public.submit_quote_request(jsonb) to anon, authenticated;

-- Public marketing media. Database rows retain paths and authorization for
-- writes is delegated to the same RBAC helpers as the catalog.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media_content_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and public.can_manage_content()
    and (storage.foldername(name))[1] in ('products', 'brands', 'posts', 'site')
  );

create policy "media_content_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.can_manage_content())
  with check (
    bucket_id = 'media'
    and public.can_manage_content()
    and (storage.foldername(name))[1] in ('products', 'brands', 'posts', 'site')
  );

create policy "media_content_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.can_manage_content());

comment on table public.quote_requests is
  'Solicitações de orçamento. Dados pessoais protegidos por RLS e LGPD.';
comment on function public.submit_quote_request(jsonb) is
  'Cria solicitação e itens atomicamente sem expor tabelas de clientes ao papel anon.';
comment on table public.audit_logs is
  'Trilha imutável das mutações administrativas em entidades críticas.';

-- Idempotent development seed. It establishes data contracts without inventing
-- commercial details; no users or roles are created here.

insert into public.categories (
  name,
  slug,
  description,
  display_order,
  is_active
)
values
  ('Tintas', 'tintas', 'Tintas para ambientes internos e externos.', 10, true),
  ('Complementos', 'complementos', 'Massas, seladores, fundos e outros complementos.', 20, true),
  ('Acessórios', 'acessorios', 'Ferramentas e acessórios para preparação e pintura.', 30, true)
on conflict do nothing;

insert into public.post_categories (
  name,
  slug,
  description,
  display_order
)
values
  ('Dicas de pintura', 'dicas-de-pintura', 'Orientações práticas para preparar e pintar.', 10),
  ('Cores e tendências', 'cores-e-tendencias', 'Inspirações, combinações e novidades.', 20)
on conflict do nothing;

insert into public.site_settings (
  key,
  setting_group,
  value,
  description,
  is_public
)
values
  (
    'business_profile',
    'business',
    '{}'::jsonb,
    'Dados institucionais públicos gerenciados pelo painel.',
    true
  ),
  (
    'contact_profile',
    'contact',
    '{}'::jsonb,
    'Canais de contato e endereço público gerenciados pelo painel.',
    true
  ),
  (
    'opening_hours',
    'hours',
    '{}'::jsonb,
    'Horários públicos de atendimento gerenciados pelo painel.',
    true
  ),
  (
    'seo_defaults',
    'seo',
    '{}'::jsonb,
    'Metadados padrão gerenciados pelo painel.',
    true
  ),
  (
    'social_and_features',
    'social',
    '{}'::jsonb,
    'Redes sociais e recursos públicos gerenciados pelo painel.',
    true
  )
on conflict (key) do update set
  setting_group = excluded.setting_group,
  description = excluded.description,
  is_public = excluded.is_public;

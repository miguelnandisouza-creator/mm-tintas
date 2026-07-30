# MM Tintas e Complementos

Plataforma digital da MM Tintas e Complementos, construída com Next.js 16,
React 19, TypeScript, Tailwind CSS 4, shadcn/ui e Supabase.

O projeto reúne site institucional, catálogo, orçamento via WhatsApp, blog,
calculadora de tinta e painel administrativo.

## Requisitos

- Node.js 24
- npm 11
- Projeto Supabase para persistência e autenticação

## Desenvolvimento

```bash
npm install
copy .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

Sem variáveis do Supabase, o site público usa dados claramente identificados
como demonstração. O painel demonstrativo fica disponível somente em
desenvolvimento; em produção, a área administrativa permanece bloqueada até a
configuração do banco e da autenticação.

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canônica da aplicação |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número com DDI e DDD, apenas dígitos |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail público de atendimento |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública recomendada do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública/anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações administrativas no servidor; nunca expor no cliente |

## Banco de dados

As migrations versionadas ficam em `supabase/migrations`. Para um projeto
Supabase conectado:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Crie o primeiro usuário pelo Supabase Auth e associe seu perfil ao papel
`admin`. As políticas RLS continuam sendo a autorização final das operações.

As consultas públicas usam um cliente anônimo sem cookies e cache por domínio
com revalidação de cinco minutos. Alterações feitas pelo painel invalidam
imediatamente o cache correspondente.

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

## Rotas principais

- `/` — Home
- `/catalogo` e `/produtos/[slug]` — catálogo
- `/marcas` e `/promocoes` — descoberta
- `/blog` e `/blog/[slug]` — conteúdo
- `/calculadora` — estimativa de tinta
- `/sobre` e `/contato` — institucional e orçamento
- `/login` — autenticação de funcionários
- `/admin` — painel administrativo

## Deploy na Vercel

1. Crie um projeto na Vercel a partir do repositório.
2. Cadastre todas as variáveis de ambiente em Production e Preview.
3. Configure a URL de produção em `NEXT_PUBLIC_SITE_URL`.
4. No Supabase Auth, adicione as URLs de produção e preview autorizadas.
5. Rode as migrations no projeto de produção.
6. Faça o primeiro deploy e valide login, upload, WhatsApp, metadata e sitemap.

## Checklist antes da publicação

- Substituir todos os dados demonstrativos pelos dados reais.
- Definir endereço, horários, WhatsApp, e-mail e perfis sociais oficiais.
- Confirmar marcas, imagens, descrições e disponibilidade dos produtos.
- Configurar domínio, Supabase, Storage, SMTP e recuperação de senha.
- Revisar política de privacidade e retenção de solicitações conforme a LGPD.
- Cadastrar Google Business Profile e Search Console.
- Fazer testes de compra/orçamento em aparelhos reais.

## Arquitetura

Consulte [ARQUITETURA.md](./ARQUITETURA.md) para decisões técnicas, limites de
domínio, estratégia de SEO, autenticação e evolução futura.

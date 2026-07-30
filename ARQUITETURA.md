# Arquitetura — MM Tintas e Complementos

## 1. Visão arquitetural

A plataforma será construída como um monólito modular em Next.js. Essa abordagem mantém a operação inicial simples e econômica, mas separa claramente os domínios do negócio para permitir evolução futura sem uma reescrita.

Princípios:

- App Router e Server Components por padrão.
- Client Components apenas quando houver interação no navegador.
- Regras de negócio independentes da camada visual.
- Acesso ao Supabase concentrado em serviços e repositórios.
- Componentes compartilhados sem conhecimento dos domínios.
- Validação de dados nas fronteiras da aplicação.
- Funcionalidades agrupadas por domínio, não apenas por tipo técnico.

## 2. Stack

| Tecnologia | Responsabilidade | Justificativa |
| --- | --- | --- |
| Next.js 16 | Aplicação web, renderização, rotas e APIs | SEO, performance, Server Components e integração direta com a Vercel |
| TypeScript | Tipagem estática | Reduz regressões e torna a evolução mais segura |
| Tailwind CSS | Estilos e responsividade | Consistência visual, produtividade e baixo custo de manutenção |
| shadcn/ui | Primitivos acessíveis | Componentes controláveis, sem dependência de uma biblioteca visual fechada |
| Framer Motion | Movimento e transições | Animações pontuais, respeitando preferências de movimento reduzido |
| Lucide | Ícones | Conjunto leve, consistente e acessível |
| Supabase | PostgreSQL, autenticação, storage e recursos de backend | Reduz complexidade operacional sem abandonar um banco relacional robusto |
| Zod | Validação de entrada e ambiente | Contratos explícitos para formulários, actions e configurações |
| React Hook Form | Formulários complexos | Boa performance e integração com validação |
| Vercel | Hospedagem, previews e observabilidade | Integração natural com Next.js e fluxo de deploy simples |

Dependências devem ser adicionadas apenas quando houver uso real.

## 3. Estrutura de pastas proposta

```text
mm-tintas/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   │   ├── page.tsx
│   │   │   ├── catalogo/
│   │   │   ├── produtos/[slug]/
│   │   │   ├── marcas/
│   │   │   ├── promocoes/
│   │   │   ├── blog/
│   │   │   ├── sobre/
│   │   │   ├── contato/
│   │   │   └── calculadora/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── admin/
│   │   │   ├── (dashboard)/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── manifest.ts
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── marketing/
│   │   └── shared/
│   ├── features/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── promotions/
│   │   ├── quotes/
│   │   ├── blog/
│   │   ├── calculator/
│   │   └── settings/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── seo/
│   │   ├── validation/
│   │   └── utils/
│   ├── hooks/
│   ├── config/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
└── README.md
```

### Regras de organização

- `app` cuida de composição, roteamento, metadata e limites de carregamento/erro.
- `features` contém regras, consultas, mutations, schemas e componentes específicos de cada domínio.
- `components/ui` contém primitivas genéricas do design system.
- `components/layout` contém a estrutura global, como cabeçalho e rodapé.
- `lib` contém integrações e infraestrutura, sem componentes de negócio.
- Cada domínio pode conter `components`, `queries`, `actions`, `schemas`, `types` e `repositories`, criados conforme a necessidade.

## 4. Organização do App Router

O site público ficará no route group `(site)`, permitindo um layout de marketing compartilhado sem alterar as URLs. Autenticação ficará em `(auth)`. O painel usará `/admin`, com layout, navegação e proteção próprios.

Estratégia de renderização:

- Páginas institucionais: geração estática.
- Catálogo, produtos, marcas e blog: renderização no servidor com cache e revalidação.
- Busca e filtros: estado refletido nos parâmetros da URL.
- Painel administrativo: renderização dinâmica e acesso autenticado.
- Alterações no painel: Server Actions quando adequadas; Route Handlers para webhooks e integrações públicas.
- Imagens: `next/image`, tamanhos explícitos e formatos modernos.

## 5. Estratégia de componentes e Design System

O design system terá tokens semânticos para cores, tipografia, espaçamento, raios, sombras e movimento. As cores não serão acopladas diretamente aos componentes; nomes como `primary`, `surface`, `muted` e `danger` facilitarão futuras mudanças de identidade.

Camadas:

1. Primitivas: botão, input, badge, dialog, skeleton.
2. Composições: card de produto, busca, filtro, CTA, seção.
3. Blocos de página: hero, vitrine, marcas e depoimentos.
4. Páginas: apenas compõem blocos e carregam dados.

Todos os componentes interativos deverão suportar teclado, foco visível, leitores de tela e estados de loading, erro, vazio e desabilitado.

## 6. Estratégia de banco de dados

O PostgreSQL do Supabase será a fonte principal de verdade. A modelagem será normalizada, com slugs únicos, timestamps, status de publicação e exclusão lógica onde auditoria for importante.

Entidades iniciais previstas:

- `profiles` e `user_roles`
- `products`
- `product_images`
- `categories`
- `product_categories`
- `brands`
- `promotions`
- `promotion_products`
- `quote_requests` e `quote_items`
- `posts`, `post_categories` e `post_tags`
- `site_settings`
- `audit_logs`

Decisões:

- Preços e estoque podem existir no modelo, mas não precisam aparecer na primeira versão.
- Imagens ficam no Supabase Storage; o banco guarda metadados e caminhos.
- Migrações versionadas serão a única forma de alterar o schema.
- Tipos TypeScript serão gerados a partir do schema.
- Row Level Security será obrigatória nas tabelas expostas.
- Índices serão definidos para slugs, status, relacionamentos, busca e ordenação.

O esquema detalhado, policies e migrations pertencem à ETAPA 5.

## 7. Autenticação e autorização

O Supabase Auth será usado inicialmente apenas para funcionários. Não haverá cadastro público.

- Sessão validada no servidor.
- Middleware fará redirecionamento inicial, mas a autorização real ocorrerá também no servidor e no banco.
- Papéis iniciais: `admin`, `editor` e `viewer`.
- RLS aplicará o menor privilégio possível.
- Operações administrativas sensíveis serão registradas em `audit_logs`.
- Chaves administrativas nunca serão enviadas ao navegador.
- Recuperação de senha e convites usarão fluxos do Supabase Auth.

Essa estrutura permite adicionar futuramente contas de clientes, pintores e parceiros sem misturar perfis com credenciais.

## 8. Estratégia de SEO

SEO será parte da arquitetura, não uma etapa cosmética.

- Metadata API com títulos, descrições, canonical e Open Graph por página.
- `sitemap.xml` dinâmico e `robots.txt`.
- URLs legíveis e estáveis com slugs.
- Dados estruturados: `LocalBusiness`, `Organization`, `Product`, `BreadcrumbList`, `Article` e `FAQPage` quando aplicável.
- Páginas locais voltadas a Tubarão e região, com conteúdo útil e sem repetição artificial de palavras-chave.
- Informações comerciais consistentes: nome, endereço e telefone.
- Conteúdo de produtos e blog renderizado no servidor.
- Redirecionamentos permanentes ao mudar slugs.
- Imagens otimizadas com textos alternativos relevantes.
- Monitoramento futuro com Google Search Console e ferramentas de analytics, mediante consentimento quando necessário.

## 9. Responsividade e acessibilidade

A interface será mobile-first, considerando que boa parte das conversões ocorrerá pelo celular e terminará no WhatsApp.

Faixas serão guiadas pelo conteúdo, usando os breakpoints do Tailwind apenas como base. Grades usarão CSS Grid e Flexbox, containers terão largura máxima controlada e alvos de toque terão tamanho confortável.

Critérios:

- Navegação funcional em telas pequenas.
- Filtros adaptados para painel lateral ou drawer no mobile.
- Tabelas administrativas com alternativas responsivas.
- Tipografia fluida onde trouxer benefício.
- Contraste conforme WCAG 2.2 AA.
- Navegação por teclado e foco previsível.
- `prefers-reduced-motion` respeitado.
- Layout testado em aparelhos e larguras reais, não apenas em presets.

## 10. Performance

- Server Components por padrão para reduzir JavaScript no cliente.
- Carregamento sob demanda para recursos pesados.
- Imagens responsivas e sem mudança inesperada de layout.
- Fontes locais ou otimizadas pelo Next.js.
- Cache e revalidação por domínio.
- Invalidação específica após alterações administrativas.
- Consultas selecionando somente os campos necessários.
- Paginação no catálogo e no painel.
- Monitoramento dos Core Web Vitals.
- Orçamento de performance e revisão com Lighthouse na etapa final.

## 11. Escalabilidade

O monólito modular evita complexidade prematura. Os limites de domínio permitirão extrair serviços no futuro caso volume ou equipe justifiquem.

Preparação para evolução:

- Catálogo desacoplado de checkout e estoque.
- Solicitações de orçamento representadas como dados, mesmo quando enviadas ao WhatsApp.
- Perfis separados da autenticação.
- Mídia abstraída por serviço.
- Integrações externas isoladas por adaptadores.
- Feature flags para lançamentos graduais.
- Jobs assíncronos poderão ser adicionados para e-mails, geração de imagens e IA.
- Identificadores internos não dependerão de slugs públicos.
- Domínios futuros previstos: pedidos, fidelidade, parceiros, recomendações e simulação.

Microserviços não serão usados inicialmente: aumentariam custo, deploys e observabilidade sem benefício proporcional para esta fase.

## 12. Segurança e operação

- Variáveis de ambiente validadas na inicialização.
- Segredos separados entre desenvolvimento, preview e produção.
- Validação e sanitização de toda entrada.
- Proteção contra abuso em formulários e endpoints públicos.
- Cabeçalhos de segurança e política de conteúdo revisados antes da produção.
- Backups e recuperação do Supabase documentados.
- Ambientes local, preview e produção separados.
- Logs sem dados pessoais desnecessários.
- Política de privacidade e tratamento de dados alinhados à LGPD.

## 13. Qualidade e testes

- ESLint, TypeScript estrito e formatação automatizada.
- Testes unitários para regras e cálculos.
- Testes de integração para banco, autenticação e actions críticas.
- Testes E2E para catálogo, orçamento e fluxos administrativos.
- Verificações automatizadas no CI antes do deploy.
- Previews da Vercel para revisão visual.

## 14. Fases de implementação

As dez etapas definidas no briefing permanecem como marcos de aprovação. Cada etapa terá escopo fechado, validação técnica e revisão crítica antes do avanço. Decisões de implementação que pertencem a etapas futuras serão documentadas, mas não antecipadas.

## 15. Riscos e pontos que exigirão confirmação

- Identidade visual definitiva: logotipo, paleta, tipografia e materiais da marca.
- Dados comerciais: endereço, horários, WhatsApp e regiões atendidas.
- Lista inicial de marcas, categorias e produtos.
- Regras comerciais sobre preço, estoque e promoções.
- Usuários e papéis reais do painel.
- Projeto e credenciais do Supabase.
- Domínio e conta da Vercel.
- Política de privacidade, cookies e retenção de solicitações.

Esses itens não bloqueiam a criação da base técnica, mas precisam ser resolvidos antes da publicação.

## 16. Revisão crítica da ETAPA 1

A arquitetura equilibra simplicidade operacional e crescimento: usa recursos nativos do Next.js e Supabase, estabelece limites claros de domínio e evita microserviços prematuros. A separação entre UI, funcionalidades e infraestrutura reduz acoplamento, enquanto SSR, cache e metadata sustentam performance e SEO.

O principal ponto a melhorar após esta aprovação é transformar os conceitos visuais em tokens concretos e definir os dados reais da empresa. Na ETAPA 2, a recomendação é criar somente a fundação técnica, os layouts mínimos e os providers, deixando os componentes completos para a ETAPA 3.

**Status: ETAPA 1 concluída. Nenhuma instalação ou implementação das etapas seguintes foi iniciada.**

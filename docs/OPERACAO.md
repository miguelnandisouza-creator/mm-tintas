# Operação e manutenção

## Publicação de conteúdo

- Produtos, posts e promoções devem permanecer como rascunho até a revisão.
- Slugs publicados devem ser estáveis; ao alterar um slug, crie um
  redirecionamento permanente.
- Imagens precisam de texto alternativo objetivo e não devem conter informações
  essenciais apenas dentro da própria imagem.
- Preço e disponibilidade só devem ser publicados quando houver processo para
  mantê-los atualizados.

## Segurança

- Nunca use `SUPABASE_SERVICE_ROLE_KEY` em Client Components.
- Revise regularmente usuários e papéis administrativos.
- Mantenha RLS ativa em todas as tabelas expostas.
- Revogue imediatamente acessos de funcionários desligados.
- Não registre senhas, tokens ou dados pessoais sensíveis em logs.

## SEO local

- Mantenha nome, endereço e telefone iguais no site e no Google Business
  Profile.
- Publique conteúdo útil para dúvidas reais de clientes da região.
- Evite criar páginas locais duplicadas apenas para repetir palavras-chave.
- Envie `/sitemap.xml` ao Google Search Console após o domínio estar ativo.

## Backups e incidentes

- Confirme a política de backup do plano Supabase contratado.
- Antes de migrations destrutivas, gere backup e teste restauração.
- Em incidente, preserve logs, revogue chaves afetadas e documente a correção.

## Atualizações

Rode mensalmente:

```bash
npm outdated
npm audit
npm run lint
npm run typecheck
npm run test
npm run build
```

Atualizações maiores devem passar por preview da Vercel e revisão visual antes
da produção.

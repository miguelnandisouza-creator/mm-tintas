export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
  accent: string;
};

export const BLOG_DEMO_DISCLAIMER =
  "Conteúdo demonstrativo: estes artigos servem para apresentar a experiência do blog e devem ser revisados pela equipe antes da publicação oficial.";

export type BlogSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  author: string;
  featured: boolean;
  accent: string;
  sections: BlogSection[];
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "planejamento",
    name: "Planejamento",
    description: "Decisões que evitam retrabalho antes de abrir a primeira lata.",
    accent: "#315fbd",
  },
  {
    slug: "cores-e-acabamentos",
    name: "Cores e acabamentos",
    description: "Escolhas práticas para combinar estética, luz e uso do ambiente.",
    accent: "#b64b31",
  },
  {
    slug: "preparacao",
    name: "Preparação",
    description: "Cuidados com a base para melhorar aderência e acabamento.",
    accent: "#197e87",
  },
];

export const posts: BlogPost[] = [
  {
    slug: "como-calcular-tinta-sem-desperdicio",
    title: "Como calcular tinta sem comprar demais",
    description:
      "Um roteiro simples para medir as paredes, considerar demãos e chegar à loja com uma estimativa mais segura.",
    categorySlug: "planejamento",
    publishedAt: "2026-06-18T09:00:00-03:00",
    updatedAt: "2026-06-18T09:00:00-03:00",
    readingTime: "4 min de leitura",
    author: "Equipe MM Tintas",
    featured: true,
    accent: "#315fbd",
    sections: [
      {
        paragraphs: [
          "Comprar tinta na medida certa começa por uma conta simples, mas a embalagem nunca deve ser escolhida apenas pela área do piso. O que importa é a superfície que será pintada.",
          "Meça a largura e a altura de cada parede e multiplique os dois valores. Some as áreas e desconte portas e janelas grandes. Para o teto, use comprimento vezes largura.",
        ],
      },
      {
        heading: "Transforme a medida em uma estimativa",
        paragraphs: [
          "Divida a área total pelo rendimento informado no produto e multiplique pelo número previsto de demãos. Como textura, cor anterior e absorção da parede alteram o consumo, trate o resultado como ponto de partida.",
        ],
        bullets: [
          "Paredes novas ou muito porosas costumam exigir preparação.",
          "Mudanças de uma cor escura para uma clara podem pedir mais demãos.",
          "Reserve uma pequena margem para retoques, sem exagerar.",
        ],
      },
      {
        heading: "Leve contexto, não apenas números",
        paragraphs: [
          "Fotos da superfície, medidas e informação sobre a tinta existente ajudam a equipe da loja a orientar o sistema e a embalagem mais adequados. Assim, o cálculo deixa de ser uma adivinhação e passa a considerar a obra real.",
        ],
      },
    ],
  },
  {
    slug: "fosco-acetinado-ou-semibrilho",
    title: "Fosco, acetinado ou semibrilho: qual escolher?",
    description:
      "Entenda como luz, manutenção e estado da parede influenciam a escolha do acabamento.",
    categorySlug: "cores-e-acabamentos",
    publishedAt: "2026-05-27T09:00:00-03:00",
    updatedAt: "2026-05-27T09:00:00-03:00",
    readingTime: "4 min de leitura",
    author: "Equipe MM Tintas",
    featured: true,
    accent: "#b64b31",
    sections: [
      {
        paragraphs: [
          "O acabamento muda a forma como a luz se espalha pela parede e também interfere na manutenção. Não existe uma única opção correta para toda a casa: o uso do ambiente e a condição da superfície devem orientar a escolha.",
        ],
      },
      {
        heading: "O papel de cada acabamento",
        paragraphs: [
          "O fosco reflete menos luz e costuma disfarçar pequenas irregularidades. O acetinado oferece brilho suave e uma percepção mais sedosa. O semibrilho destaca a cor e tende a evidenciar mais a preparação da base.",
        ],
        bullets: [
          "Fosco: visual discreto e confortável em salas e quartos.",
          "Acetinado: equilíbrio entre aparência e manutenção.",
          "Semibrilho: destaque e maior reflexão de luz.",
        ],
      },
      {
        heading: "Observe o ambiente ao longo do dia",
        paragraphs: [
          "Teste a cor em uma área pequena e observe de manhã, à tarde e com iluminação artificial. A mesma tinta pode parecer diferente conforme a incidência de luz e as cores dos móveis. Para áreas de uso intenso, confirme também a lavabilidade da linha escolhida.",
        ],
      },
    ],
  },
  {
    slug: "por-que-preparar-a-parede-antes-de-pintar",
    title: "Por que preparar a parede antes de pintar",
    description:
      "Descubra os sinais que merecem atenção e por que selador, massa ou fundo não são etapas intercambiáveis.",
    categorySlug: "preparacao",
    publishedAt: "2026-04-30T09:00:00-03:00",
    updatedAt: "2026-04-30T09:00:00-03:00",
    readingTime: "5 min de leitura",
    author: "Equipe MM Tintas",
    featured: false,
    accent: "#197e87",
    sections: [
      {
        paragraphs: [
          "Uma tinta de boa qualidade não corrige uma base solta, úmida ou mal nivelada. Preparar a parede melhora a aderência e ajuda o acabamento a permanecer uniforme por mais tempo.",
          "Antes de começar, procure pó excessivo, partes ocas, descascamento, manchas e fissuras. Umidade ativa exige diagnóstico e correção da origem; simplesmente cobrir a marca tende a adiar o problema.",
        ],
      },
      {
        heading: "Cada produto resolve uma necessidade",
        paragraphs: [
          "Selador costuma ser indicado para uniformizar a absorção de reboco novo. Fundo preparador ajuda a consolidar bases fracas ou muito porosas. Massa serve para nivelar pequenas imperfeições, respeitando o ambiente de uso.",
        ],
        bullets: [
          "Remova material solto e limpe a superfície.",
          "Corrija infiltrações antes do acabamento.",
          "Respeite diluição, secagem e número de demãos do fabricante.",
        ],
      },
      {
        heading: "Na dúvida, mostre a parede",
        paragraphs: [
          "Uma foto bem iluminada e uma breve descrição do histórico da superfície ajudam na orientação inicial. Casos de infiltração, fissuras recorrentes ou perda extensa de material podem exigir avaliação técnica presencial.",
        ],
      },
    ],
  },
];

export function getBlogCategoryBySlug(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category?: string) {
  return category
    ? posts.filter((post) => post.categorySlug === category)
    : posts;
}

export function getRelatedPosts(post: BlogPost, limit = 2) {
  const sameCategory = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.categorySlug === post.categorySlug,
  );
  const others = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.categorySlug !== post.categorySlug,
  );

  return [...sameCategory, ...others].slice(0, limit);
}

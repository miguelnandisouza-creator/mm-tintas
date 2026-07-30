export const CATALOG_DISCLAIMER =
  "Catálogo demonstrativo: marcas, linhas, embalagens e disponibilidade são ilustrativas e devem ser confirmadas com a equipe da MM Tintas.";

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  description: string;
  accent: string;
  demonstrationOnly: true;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  applications: string[];
  packages: string[];
  finish?: string;
  coverage?: string;
  featured: boolean;
  isNew?: boolean;
  promotionSlug?: string;
  visual: {
    background: string;
    foreground: string;
    accent: string;
  };
};

export type Promotion = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  benefit: string;
  productSlugs: string[];
  accent: string;
  active: boolean;
};

export const categories: ProductCategory[] = [
  {
    id: "category-wall",
    slug: "tintas-para-parede",
    name: "Tintas para parede",
    shortName: "Paredes",
    description:
      "Opções para áreas internas, externas e fachadas, em diferentes acabamentos.",
    accent: "#315fbd",
  },
  {
    id: "category-enamel",
    slug: "madeiras-e-metais",
    name: "Madeiras e metais",
    shortName: "Madeiras e metais",
    description:
      "Esmaltes e acabamentos para portas, janelas, grades e mobiliário.",
    accent: "#b64b31",
  },
  {
    id: "category-prep",
    slug: "preparacao-de-superficie",
    name: "Preparação de superfície",
    shortName: "Preparação",
    description:
      "Massas, seladores e fundos para uma base uniforme e um acabamento melhor.",
    accent: "#94743d",
  },
  {
    id: "category-waterproof",
    slug: "impermeabilizacao",
    name: "Impermeabilização",
    shortName: "Impermeabilização",
    description:
      "Soluções para ajudar a proteger lajes, paredes e áreas sujeitas à umidade.",
    accent: "#197e87",
  },
  {
    id: "category-tools",
    slug: "ferramentas-e-acessorios",
    name: "Ferramentas e acessórios",
    shortName: "Ferramentas",
    description:
      "Rolos, trinchas, bandejas e kits para ganhar precisão e produtividade.",
    accent: "#d17b26",
  },
  {
    id: "category-cleaning",
    slug: "limpeza-e-complementos",
    name: "Limpeza e complementos",
    shortName: "Complementos",
    description:
      "Produtos de apoio para preparar, proteger e finalizar cada etapa da obra.",
    accent: "#657144",
  },
];

export const brands: Brand[] = [
  {
    id: "brand-coral",
    slug: "coral",
    name: "Coral",
    description:
      "Marca de referência usada aqui somente para representar a futura navegação do catálogo.",
    accent: "#d93025",
    demonstrationOnly: true,
  },
  {
    id: "brand-suvinil",
    slug: "suvinil",
    name: "Suvinil",
    description:
      "Marca de referência usada em dados demonstrativos, sem indicação de estoque ou parceria.",
    accent: "#f0b429",
    demonstrationOnly: true,
  },
  {
    id: "brand-sherwin-williams",
    slug: "sherwin-williams",
    name: "Sherwin-Williams",
    description:
      "Marca de referência apresentada apenas para validar filtros e páginas de catálogo.",
    accent: "#2767b1",
    demonstrationOnly: true,
  },
  {
    id: "brand-atlas",
    slug: "atlas",
    name: "Atlas",
    description:
      "Marca de referência de ferramentas incluída exclusivamente para demonstração visual.",
    accent: "#e66a27",
    demonstrationOnly: true,
  },
  {
    id: "brand-vedacit",
    slug: "vedacit",
    name: "Vedacit",
    description:
      "Marca de referência para simular a categoria de impermeabilização no catálogo.",
    accent: "#198665",
    demonstrationOnly: true,
  },
  {
    id: "brand-mm-selection",
    slug: "mm-selecao",
    name: "MM Seleção",
    description:
      "Identidade conceitual para itens complementares selecionados pela equipe da loja.",
    accent: "#253f73",
    demonstrationOnly: true,
  },
];

export const products: Product[] = [
  {
    id: "product-01",
    slug: "tinta-acrilica-premium-fosca",
    name: "Tinta Acrílica Premium Fosca",
    brandSlug: "suvinil",
    categorySlug: "tintas-para-parede",
    shortDescription:
      "Acabamento fosco uniforme para renovar ambientes internos com praticidade.",
    description:
      "Uma opção demonstrativa de tinta acrílica premium para projetos residenciais que pedem cobertura uniforme e visual contemporâneo. A indicação final depende da superfície e deve ser confirmada com a equipe.",
    highlights: [
      "Acabamento fosco confortável",
      "Aplicação em ambientes internos",
      "Fácil manutenção no dia a dia",
    ],
    applications: ["Alvenaria", "Reboco", "Massa corrida", "Drywall"],
    packages: ["3,6 L", "18 L"],
    finish: "Fosco",
    coverage: "Consultar rendimento conforme superfície e diluição",
    featured: true,
    promotionSlug: "renove-seu-ambiente",
    visual: {
      background: "#dce6fa",
      foreground: "#18315f",
      accent: "#527dcc",
    },
  },
  {
    id: "product-02",
    slug: "tinta-acrilica-standard-alto-rendimento",
    name: "Tinta Acrílica Standard Alto Rendimento",
    brandSlug: "coral",
    categorySlug: "tintas-para-parede",
    shortDescription:
      "Boa cobertura para grandes áreas e reformas com planejamento de custo.",
    description:
      "Linha demonstrativa para pinturas internas e externas protegidas. Ajuda a visualizar como o catálogo poderá comparar categoria, acabamento e tamanhos disponíveis.",
    highlights: [
      "Indicada para áreas amplas",
      "Acabamento fosco",
      "Boa relação entre cobertura e aplicação",
    ],
    applications: ["Paredes internas", "Tetos", "Áreas externas protegidas"],
    packages: ["3,6 L", "18 L"],
    finish: "Fosco",
    featured: true,
    visual: {
      background: "#f7dfdc",
      foreground: "#66281f",
      accent: "#cc604c",
    },
  },
  {
    id: "product-03",
    slug: "tinta-para-fachada-alta-resistencia",
    name: "Tinta para Fachada Alta Resistência",
    brandSlug: "sherwin-williams",
    categorySlug: "tintas-para-parede",
    shortDescription:
      "Proteção e acabamento para fachadas expostas ao clima do dia a dia.",
    description:
      "Produto demonstrativo pensado para fachadas e muros. Antes da compra, a equipe avalia o estado da base, a preparação necessária e as condições de exposição do local.",
    highlights: [
      "Uso externo",
      "Boa resistência ao intemperismo",
      "Variedade de cores sob consulta",
    ],
    applications: ["Fachadas", "Muros", "Alvenaria externa"],
    packages: ["3,6 L", "18 L"],
    finish: "Fosco",
    featured: true,
    visual: {
      background: "#dbe8f5",
      foreground: "#173b63",
      accent: "#2d6ea8",
    },
  },
  {
    id: "product-04",
    slug: "esmalte-base-agua-acetinado",
    name: "Esmalte Base Água Acetinado",
    brandSlug: "suvinil",
    categorySlug: "madeiras-e-metais",
    shortDescription:
      "Acabamento acetinado para portas, janelas, móveis e estruturas metálicas.",
    description:
      "Alternativa demonstrativa de esmalte base água para projetos que valorizam secagem prática e acabamento suave. A preparação varia conforme o material e o estado da peça.",
    highlights: [
      "Acabamento acetinado",
      "Limpeza de ferramentas com água",
      "Uso em madeira e metal preparados",
    ],
    applications: ["Portas", "Janelas", "Móveis", "Grades"],
    packages: ["900 ml", "3,6 L"],
    finish: "Acetinado",
    featured: true,
    isNew: true,
    promotionSlug: "detalhes-que-renovam",
    visual: {
      background: "#fff0bf",
      foreground: "#614915",
      accent: "#e3a91e",
    },
  },
  {
    id: "product-05",
    slug: "esmalte-sintetico-alto-brilho",
    name: "Esmalte Sintético Alto Brilho",
    brandSlug: "coral",
    categorySlug: "madeiras-e-metais",
    shortDescription:
      "Brilho marcante e proteção para detalhes de madeira e superfícies metálicas.",
    description:
      "Item demonstrativo para acabamentos que pedem brilho e presença. O sistema completo pode exigir fundo, diluente e preparação específica.",
    highlights: [
      "Alto brilho",
      "Película resistente",
      "Cores sob consulta",
    ],
    applications: ["Madeira", "Metal", "Portas", "Esquadrias"],
    packages: ["900 ml", "3,6 L"],
    finish: "Brilhante",
    featured: false,
    visual: {
      background: "#f6d9d5",
      foreground: "#62251e",
      accent: "#bd4638",
    },
  },
  {
    id: "product-06",
    slug: "fundo-preparador-de-paredes",
    name: "Fundo Preparador de Paredes",
    brandSlug: "coral",
    categorySlug: "preparacao-de-superficie",
    shortDescription:
      "Auxilia na uniformização de superfícies porosas, fracas ou com absorção irregular.",
    description:
      "Produto demonstrativo para a etapa de preparação. Uma avaliação simples da parede ajuda a escolher entre fundo preparador, selador ou outra solução.",
    highlights: [
      "Ajuda a uniformizar a absorção",
      "Etapa anterior à pintura",
      "Indicado após avaliação da base",
    ],
    applications: ["Reboco fraco", "Paredes porosas", "Superfícies caiadas"],
    packages: ["3,6 L", "18 L"],
    featured: false,
    visual: {
      background: "#eee5d8",
      foreground: "#514436",
      accent: "#a17f50",
    },
  },
  {
    id: "product-07",
    slug: "massa-corrida-interior",
    name: "Massa Corrida para Interior",
    brandSlug: "suvinil",
    categorySlug: "preparacao-de-superficie",
    shortDescription:
      "Nivela pequenas imperfeições e prepara paredes internas para um acabamento liso.",
    description:
      "Massa demonstrativa para áreas internas secas. O consumo e o número de demãos variam de acordo com a regularidade da superfície.",
    highlights: [
      "Fácil de lixar",
      "Acabamento liso",
      "Uso em ambientes internos secos",
    ],
    applications: ["Reboco", "Concreto", "Paredes internas"],
    packages: ["5,6 kg", "25 kg"],
    featured: false,
    promotionSlug: "renove-seu-ambiente",
    visual: {
      background: "#f0e8d4",
      foreground: "#54472c",
      accent: "#a88946",
    },
  },
  {
    id: "product-08",
    slug: "selador-acrilico",
    name: "Selador Acrílico",
    brandSlug: "sherwin-williams",
    categorySlug: "preparacao-de-superficie",
    shortDescription:
      "Promove uma base mais uniforme em reboco novo e superfícies absorventes.",
    description:
      "Exemplo de selador acrílico para organizar a jornada de preparação no catálogo. A escolha correta depende da coesão e da absorção da parede.",
    highlights: [
      "Uniformiza a absorção",
      "Auxilia no rendimento da tinta",
      "Aplicação antes do acabamento",
    ],
    applications: ["Reboco novo", "Blocos", "Concreto"],
    packages: ["3,6 L", "18 L"],
    featured: false,
    visual: {
      background: "#dce7f2",
      foreground: "#263e56",
      accent: "#557a9d",
    },
  },
  {
    id: "product-09",
    slug: "impermeabilizante-para-lajes",
    name: "Impermeabilizante para Lajes",
    brandSlug: "vedacit",
    categorySlug: "impermeabilizacao",
    shortDescription:
      "Membrana flexível para proteção de lajes e coberturas sem trânsito permanente.",
    description:
      "Solução demonstrativa de impermeabilização. O diagnóstico do local, o caimento e o tratamento de fissuras são essenciais antes de definir o sistema.",
    highlights: [
      "Forma membrana flexível",
      "Aplicação em demãos",
      "Sistema sujeito à preparação técnica",
    ],
    applications: ["Lajes", "Marquises", "Coberturas"],
    packages: ["4 kg", "12 kg"],
    featured: true,
    isNew: true,
    promotionSlug: "proteja-antes-das-chuvas",
    visual: {
      background: "#d7efea",
      foreground: "#164d43",
      accent: "#2f927c",
    },
  },
  {
    id: "product-10",
    slug: "manta-liquida-branca",
    name: "Manta Líquida Branca",
    brandSlug: "vedacit",
    categorySlug: "impermeabilizacao",
    shortDescription:
      "Revestimento flexível e refletivo para superfícies horizontais expostas.",
    description:
      "Produto demonstrativo para apresentar soluções de proteção contra umidade. A aplicação deve seguir as condições e recomendações técnicas da embalagem real.",
    highlights: [
      "Cor branca",
      "Película flexível",
      "Uso externo conforme sistema indicado",
    ],
    applications: ["Lajes", "Coberturas", "Telhas selecionadas"],
    packages: ["4 kg", "12 kg"],
    featured: false,
    promotionSlug: "proteja-antes-das-chuvas",
    visual: {
      background: "#d9f1ed",
      foreground: "#174a42",
      accent: "#51a697",
    },
  },
  {
    id: "product-11",
    slug: "rolo-antirrespingo-23-cm",
    name: "Rolo Antirrespingo 23 cm",
    brandSlug: "atlas",
    categorySlug: "ferramentas-e-acessorios",
    shortDescription:
      "Rolo para aplicação de tintas em paredes lisas e superfícies com pouca textura.",
    description:
      "Ferramenta demonstrativa para compor o catálogo. O tipo de lã e a altura do pelo devem ser escolhidos conforme a textura e o produto aplicado.",
    highlights: [
      "Largura de 23 cm",
      "Indicado para áreas amplas",
      "Compatibilidade a confirmar com a tinta",
    ],
    applications: ["Paredes lisas", "Tetos", "Áreas internas"],
    packages: ["1 unidade"],
    featured: true,
    promotionSlug: "detalhes-que-renovam",
    visual: {
      background: "#fae3ce",
      foreground: "#623a1e",
      accent: "#dc7a31",
    },
  },
  {
    id: "product-12",
    slug: "kit-pintura-essencial-5-pecas",
    name: "Kit Pintura Essencial — 5 peças",
    brandSlug: "atlas",
    categorySlug: "ferramentas-e-acessorios",
    shortDescription:
      "Conjunto prático para pequenos reparos, retoques e primeiras pinturas.",
    description:
      "Kit demonstrativo que reúne os itens básicos para iniciar um projeto. A composição real do conjunto deverá ser confirmada antes da publicação.",
    highlights: [
      "Itens básicos em um conjunto",
      "Boa opção para pequenos projetos",
      "Composição ilustrativa",
    ],
    applications: ["Reparos", "Retoques", "Pequenos ambientes"],
    packages: ["1 kit"],
    featured: false,
    isNew: true,
    promotionSlug: "detalhes-que-renovam",
    visual: {
      background: "#fbe7d2",
      foreground: "#60391f",
      accent: "#c96c2d",
    },
  },
  {
    id: "product-13",
    slug: "trincha-para-acabamento-2-polegadas",
    name: "Trincha para Acabamento 2”",
    brandSlug: "atlas",
    categorySlug: "ferramentas-e-acessorios",
    shortDescription:
      "Precisão em recortes, cantos, rodapés e detalhes de acabamento.",
    description:
      "Trincha demonstrativa para áreas de detalhe. O filamento ideal depende do tipo de tinta e da qualidade de acabamento desejada.",
    highlights: [
      "Tamanho versátil",
      "Controle em recortes",
      "Uso com produto compatível",
    ],
    applications: ["Recortes", "Cantos", "Portas", "Rodapés"],
    packages: ["1 unidade"],
    featured: false,
    visual: {
      background: "#fae6d1",
      foreground: "#58351e",
      accent: "#e08a42",
    },
  },
  {
    id: "product-14",
    slug: "limpador-pos-obra-concentrado",
    name: "Limpador Pós-Obra Concentrado",
    brandSlug: "mm-selecao",
    categorySlug: "limpeza-e-complementos",
    shortDescription:
      "Apoio na remoção de resíduos comuns ao final da reforma.",
    description:
      "Produto conceitual para representar complementos de limpeza. Antes do uso, confirme a compatibilidade com o revestimento e faça um teste em área discreta.",
    highlights: [
      "Uso após teste de compatibilidade",
      "Diluição conforme indicação real",
      "Ajuda na etapa final da obra",
    ],
    applications: ["Pisos resistentes", "Revestimentos compatíveis"],
    packages: ["1 L", "5 L"],
    featured: false,
    visual: {
      background: "#e7eadb",
      foreground: "#3e492b",
      accent: "#78864f",
    },
  },
  {
    id: "product-15",
    slug: "lona-de-protecao-multiuso",
    name: "Lona de Proteção Multiuso",
    brandSlug: "mm-selecao",
    categorySlug: "limpeza-e-complementos",
    shortDescription:
      "Proteção simples para móveis e pisos durante pinturas e pequenos reparos.",
    description:
      "Item conceitual para demonstrar complementos úteis em cada etapa da obra. Medidas e espessuras devem ser cadastradas conforme o estoque real.",
    highlights: [
      "Ajuda a proteger a área",
      "Uso em pinturas e reparos",
      "Medidas sob consulta",
    ],
    applications: ["Pisos", "Móveis", "Bancadas"],
    packages: ["1 unidade"],
    featured: false,
    visual: {
      background: "#e7e8df",
      foreground: "#44473a",
      accent: "#81866d",
    },
  },
];

export const promotions: Promotion[] = [
  {
    id: "promotion-01",
    slug: "renove-seu-ambiente",
    eyebrow: "Seleção para interiores",
    title: "Renove seu ambiente",
    description:
      "Uma seleção demonstrativa de acabamento e preparação para planejar a próxima pintura.",
    benefit: "Condição especial sob consulta",
    productSlugs: [
      "tinta-acrilica-premium-fosca",
      "massa-corrida-interior",
    ],
    accent: "#315fbd",
    active: true,
  },
  {
    id: "promotion-02",
    slug: "proteja-antes-das-chuvas",
    eyebrow: "Cuidado com a umidade",
    title: "Proteja antes das chuvas",
    description:
      "Produtos demonstrativos para iniciar uma conversa sobre impermeabilização e preparação.",
    benefit: "Avaliação de solução com a equipe",
    productSlugs: [
      "impermeabilizante-para-lajes",
      "manta-liquida-branca",
    ],
    accent: "#197e87",
    active: true,
  },
  {
    id: "promotion-03",
    slug: "detalhes-que-renovam",
    eyebrow: "Ferramentas e acabamento",
    title: "Detalhes que renovam",
    description:
      "Itens selecionados para recortes, pequenos reparos e acabamento de madeiras e metais.",
    benefit: "Monte seu kit sob medida",
    productSlugs: [
      "esmalte-base-agua-acetinado",
      "rolo-antirrespingo-23-cm",
      "kit-pintura-essencial-5-pecas",
    ],
    accent: "#d17b26",
    active: true,
  },
];

export type CatalogFilters = {
  query?: string;
  category?: string;
  brand?: string;
  promotion?: string;
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBrandBySlug(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getPromotionBySlug(slug: string) {
  return promotions.find((promotion) => promotion.slug === slug);
}

export function filterProducts({
  query,
  category,
  brand,
  promotion,
}: CatalogFilters) {
  const normalizedQuery = query ? normalizeSearch(query) : "";

  return products.filter((product) => {
    const productCategory = getCategoryBySlug(product.categorySlug);
    const productBrand = getBrandBySlug(product.brandSlug);
    const searchableText = normalizeSearch(
      [
        product.name,
        product.shortDescription,
        productBrand?.name ?? "",
        productCategory?.name ?? "",
      ].join(" "),
    );

    return (
      (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
      (!category || product.categorySlug === category) &&
      (!brand || product.brandSlug === brand) &&
      (!promotion || product.promotionSlug === promotion)
    );
  });
}

export function getRelatedProducts(product: Product, limit = 3) {
  return products
    .filter(
      (candidate) =>
        candidate.slug !== product.slug &&
        (candidate.categorySlug === product.categorySlug ||
          candidate.brandSlug === product.brandSlug),
    )
    .slice(0, limit);
}

export function createWhatsAppQuoteUrl(productName?: string) {
  const configuredNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const message = productName
    ? `Olá! Encontrei o produto "${productName}" no site da MM Tintas e gostaria de solicitar um orçamento.`
    : "Olá! Visitei o site da MM Tintas e gostaria de solicitar um orçamento.";
  const recipient = configuredNumber ? `/${configuredNumber}` : "/";

  return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`;
}

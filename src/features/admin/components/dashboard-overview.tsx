import Link from "next/link";
import {
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  FileText,
  MessageCircle,
  Package,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const demoMetrics = [
  {
    label: "Produtos ativos",
    value: "148",
    detail: "+12 neste mês",
    icon: Package,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    label: "Visitas no catálogo",
    value: "2.840",
    detail: "+18,4% no período",
    icon: Eye,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    label: "Pedidos de orçamento",
    value: "86",
    detail: "+9 esta semana",
    icon: MessageCircle,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Promoções ativas",
    value: "6",
    detail: "2 encerram em breve",
    icon: BadgePercent,
    tone: "bg-amber-50 text-amber-700",
  },
] as const;

const demoChart = [
  { day: "Seg", label: "176", value: 44 },
  { day: "Ter", label: "260", value: 65 },
  { day: "Qua", label: "216", value: 54 },
  { day: "Qui", label: "328", value: 82 },
  { day: "Sex", label: "288", value: 72 },
  { day: "Sáb", label: "384", value: 96 },
  { day: "Dom", label: "272", value: 68 },
] as const;

const demoActivities = [
  {
    title: "Coral Decora Seda adicionada",
    detail: "Produto • há 12 minutos",
    tone: "bg-blue-600",
  },
  {
    title: "Oferta de Inverno atualizada",
    detail: "Promoção • há 1 hora",
    tone: "bg-amber-500",
  },
  {
    title: "Como escolher a tinta ideal publicado",
    detail: "Blog • há 3 horas",
    tone: "bg-cyan-600",
  },
  {
    title: "Marca Suvinil atualizada",
    detail: "Marca • ontem, 16:24",
    tone: "bg-violet-600",
  },
] as const;

export type AdminDashboardData = {
  activeBrands: number;
  activePromotions: number;
  brands: number;
  posts: number;
  products: number;
  promotions: number;
  publishedPosts: number;
  publishedProducts: number;
};

export function DashboardOverview({
  data,
  demoMode,
}: {
  data?: AdminDashboardData | null;
  demoMode: boolean;
}) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const currentDate = formatter.format(new Date());
  const metrics = data
    ? [
        {
          label: "Produtos cadastrados",
          value: String(data.products),
          detail: `${data.publishedProducts} publicados`,
          icon: Package,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Marcas cadastradas",
          value: String(data.brands),
          detail: `${data.activeBrands} ativas`,
          icon: Eye,
          tone: "bg-cyan-50 text-cyan-700",
        },
        {
          label: "Artigos no blog",
          value: String(data.posts),
          detail: `${data.publishedPosts} publicados`,
          icon: FileText,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Promoções",
          value: String(data.promotions),
          detail: `${data.activePromotions} ativas`,
          icon: BadgePercent,
          tone: "bg-amber-50 text-amber-700",
        },
      ]
    : demoMode
      ? demoMetrics
      : [
          {
            label: "Produtos cadastrados",
            value: "—",
            detail: "Dados indisponíveis",
            icon: Package,
            tone: "bg-blue-50 text-blue-700",
          },
          {
            label: "Marcas cadastradas",
            value: "—",
            detail: "Dados indisponíveis",
            icon: Eye,
            tone: "bg-cyan-50 text-cyan-700",
          },
          {
            label: "Artigos no blog",
            value: "—",
            detail: "Dados indisponíveis",
            icon: FileText,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Promoções",
            value: "—",
            detail: "Dados indisponíveis",
            icon: BadgePercent,
            tone: "bg-amber-50 text-amber-700",
          },
        ];
  const realChartValues = data
    ? [
        { day: "Produtos", count: data.products },
        { day: "Marcas", count: data.brands },
        { day: "Promoções", count: data.promotions },
        { day: "Blog", count: data.posts },
      ]
    : [];
  const maxChartValue = Math.max(
    ...realChartValues.map((item) => item.count),
    1,
  );
  const chart = data
    ? realChartValues.map((item) => ({
        day: item.day,
        label: String(item.count),
        value: Math.max(8, Math.round((item.count / maxChartValue) * 100)),
      }))
    : demoChart;
  const activities = data
    ? [
        {
          title: `${data.publishedProducts} produtos estão publicados`,
          detail: `${data.products - data.publishedProducts} aguardam publicação`,
          tone: "bg-blue-600",
        },
        {
          title: `${data.activePromotions} promoções estão ativas`,
          detail: `${data.promotions} campanhas cadastradas`,
          tone: "bg-amber-500",
        },
        {
          title: `${data.publishedPosts} artigos estão no ar`,
          detail: `${data.posts - data.publishedPosts} em edição ou arquivados`,
          tone: "bg-cyan-600",
        },
        {
          title: `${data.activeBrands} marcas estão disponíveis`,
          detail: `${data.brands} marcas cadastradas`,
          tone: "bg-violet-600",
        },
      ]
    : demoActivities;

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium capitalize text-slate-500">
            {currentDate}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-slate-950 sm:text-3xl">
            Bom trabalho, equipe MM.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Acompanhe o desempenho do site e mantenha as informações da loja
            sempre atualizadas.
          </p>
        </div>
        <Link
          href="/admin/produtos"
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
        >
          <Plus className="size-4" />
          Novo produto
        </Link>
      </section>

      {demoMode ? (
        <section className="relative overflow-hidden rounded-2xl bg-[#0c1b32] px-5 py-5 text-white sm:px-6">
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-12 size-40 rounded-full bg-blue-500/20 blur-2xl"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-cyan-300">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Você está vendo dados ilustrativos</p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Conecte o Supabase para transformar este painel em sua central
                  de dados em tempo real.
                </p>
              </div>
            </div>
            <span className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              Demo segura
            </span>
          </div>
        </section>
      ) : null}

      {!demoMode && !data ? (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
          <div>
            <p className="font-bold">Não foi possível sincronizar o resumo</p>
            <p className="mt-1 leading-6">
              Os cadastros continuam acessíveis pelo menu. Atualize a página
              para tentar carregar os indicadores novamente.
            </p>
          </div>
        </section>
      ) : null}

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores principais"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${metric.tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-slate-300" />
              </div>
              <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                {metric.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {metric.label}
              </p>
              <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                {data ? "Conteúdo cadastrado" : "Interesse no catálogo"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {data
                  ? "Distribuição por área administrativa"
                  : "Visualizações dos últimos 7 dias"}
              </p>
            </div>
            {data ? (
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <CheckCircle2 className="size-3.5" />
                Sincronizado
              </div>
            ) : demoMode ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <TrendingUp className="size-3.5" />
                18,4%
              </div>
            ) : null}
          </div>

          <div
            className="mt-8 grid h-56 items-end gap-2 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${chart.length}, minmax(0, 1fr))`,
            }}
          >
            {chart.map((item, index) => (
              <div
                key={item.day}
                className="group flex h-full flex-col items-center justify-end gap-3"
              >
                <div className="relative flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-blue-700 to-cyan-400 transition group-hover:brightness-110"
                    style={{ height: `${item.value}%` }}
                    title={
                      data
                        ? `${item.label} cadastros`
                        : `${item.label} visualizações`
                    }
                  />
                  <span className="absolute -top-6 hidden rounded-md bg-slate-950 px-1.5 py-1 text-[10px] font-bold text-white group-hover:block">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`truncate text-[11px] font-medium ${
                    index === chart.length - (data ? 1 : 2)
                      ? "text-blue-700"
                      : "text-slate-500"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Atividade recente
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Últimas atualizações
              </p>
            </div>
            <Clock3 className="size-4 text-slate-400" />
          </div>
          <ul className="mt-6 space-y-5">
            {activities.map((activity) => (
              <li key={activity.title} className="flex gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${activity.tone}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950">Ações rápidas</h2>
          <span className="text-xs text-slate-500">Atalhos mais usados</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/admin/produtos",
              title: "Cadastrar produto",
              detail: "Inclua um item no catálogo",
              icon: Package,
            },
            {
              href: "/admin/promocoes",
              title: "Criar promoção",
              detail: "Destaque uma nova campanha",
              icon: CircleDollarSign,
            },
            {
              href: "/admin/blog",
              title: "Escrever artigo",
              detail: "Publique conteúdo útil",
              icon: FileText,
            },
            {
              href: "/admin/configuracoes",
              title: "Editar informações",
              detail: "Atualize os dados da loja",
              icon: MessageCircle,
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">
                    {action.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {action.detail}
                  </span>
                </span>
                <ChevronRight className="ml-auto size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

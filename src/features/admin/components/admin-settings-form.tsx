"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Clock3,
  Globe2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Save,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";

import {
  listSiteSettingsAction,
  upsertSiteSettingAction,
  type SiteSettingInput,
} from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type SettingsTab = "business" | "contact" | "hours" | "seo" | "social";

type SettingsValues = {
  businessName: string;
  legalName: string;
  description: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  seoTitle: string;
  seoDescription: string;
  siteUrl: string;
  instagram: string;
  facebook: string;
  youtube: string;
  whatsappEnabled: boolean;
  pricesEnabled: boolean;
};

const placeholderValues: SettingsValues = {
  businessName: "MM Tintas e Complementos",
  legalName: "MM Tintas e Complementos Ltda.",
  description:
    "Tintas, acessórios e complementos para sua obra em Tubarão e região.",
  cnpj: "",
  phone: "(48) 0000-0000",
  whatsapp: "(48) 99962-7339",
  email: "contato@mmtintas.com.br",
  address: "Endereço da loja",
  neighborhood: "Centro",
  city: "Tubarão",
  state: "SC",
  postalCode: "88700-000",
  weekdayHours: "08:00 às 18:00",
  saturdayHours: "08:00 às 12:00",
  sundayHours: "Fechado",
  seoTitle: "MM Tintas e Complementos | Tubarão - SC",
  seoDescription:
    "Tintas, acessórios para pintura, ferramentas e complementos em Tubarão, Santa Catarina.",
  siteUrl: "https://mmtintas.com.br",
  instagram: "https://instagram.com/mmtintas",
  facebook: "",
  youtube: "",
  whatsappEnabled: true,
  pricesEnabled: false,
};

const emptyValues: SettingsValues = {
  businessName: "",
  legalName: "",
  description: "",
  cnpj: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  weekdayHours: "",
  saturdayHours: "",
  sundayHours: "",
  seoTitle: "",
  seoDescription: "",
  siteUrl: "",
  instagram: "",
  facebook: "",
  youtube: "",
  whatsappEnabled: true,
  pricesEnabled: false,
};

const tabs = [
  { value: "business", label: "Empresa", icon: Building2 },
  { value: "contact", label: "Contato e endereço", icon: MapPin },
  { value: "hours", label: "Horários", icon: Clock3 },
  { value: "seo", label: "SEO", icon: Search },
  { value: "social", label: "Redes e recursos", icon: Share2 },
] as const;

const groups: Array<{
  key: SiteSettingInput["key"];
  group: NonNullable<SiteSettingInput["group"]>;
  fields: Array<keyof SettingsValues>;
}> = [
  {
    key: "business_profile",
    group: "business",
    fields: ["businessName", "legalName", "description", "cnpj"],
  },
  {
    key: "contact_profile",
    group: "contact",
    fields: [
      "phone",
      "whatsapp",
      "email",
      "address",
      "neighborhood",
      "city",
      "state",
      "postalCode",
    ],
  },
  {
    key: "opening_hours",
    group: "hours",
    fields: ["weekdayHours", "saturdayHours", "sundayHours"],
  },
  {
    key: "seo_defaults",
    group: "seo",
    fields: ["seoTitle", "seoDescription", "siteUrl"],
  },
  {
    key: "social_and_features",
    group: "social",
    fields: [
      "instagram",
      "facebook",
      "youtube",
      "whatsappEnabled",
      "pricesEnabled",
    ],
  },
];

function mergeRemoteSettings(
  current: SettingsValues,
  rows: unknown[],
): SettingsValues {
  const next = { ...current } as Record<string, string | boolean>;

  rows.forEach((raw) => {
    if (!raw || typeof raw !== "object") return;
    const row = raw as Record<string, unknown>;
    const value = row.value;
    if (!value || typeof value !== "object" || Array.isArray(value)) return;

    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (!(key in next)) return;
      if (typeof item === "string" || typeof item === "boolean") {
        next[key] = item;
      }
    });
  });

  return next as SettingsValues;
}

function SettingsInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  fullWidth,
  help,
}: {
  label: string;
  name: keyof SettingsValues;
  value: string;
  onChange: (name: keyof SettingsValues, value: string | boolean) => void;
  placeholder?: string;
  type?: "text" | "email" | "url" | "tel";
  fullWidth?: boolean;
  help?: string;
}) {
  return (
    <label className={fullWidth ? "sm:col-span-2" : undefined}>
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
      />
      {help ? (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {help}
        </span>
      ) : null}
    </label>
  );
}

function SettingsTextarea({
  label,
  name,
  value,
  onChange,
  maxLength,
  help,
  placeholder,
}: {
  label: string;
  name: keyof SettingsValues;
  value: string;
  onChange: (name: keyof SettingsValues, value: string | boolean) => void;
  maxLength?: number;
  help?: string;
  placeholder?: string;
}) {
  return (
    <label className="sm:col-span-2">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        {label}
        {maxLength ? (
          <span className="text-xs font-normal text-slate-400">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </span>
      <textarea
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
      />
      {help ? (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {help}
        </span>
      ) : null}
    </label>
  );
}

function FeatureToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20",
          checked ? "bg-blue-700" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

export function AdminSettingsForm() {
  const demoMode = !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [values, setValues] = useState<SettingsValues>(emptyValues);
  const [isLoading, setIsLoading] = useState(!demoMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (demoMode) {
      let active = true;

      async function hydrateLocalSettings() {
        await Promise.resolve();
        if (!active) return;

        const local = window.localStorage.getItem("mm-tintas-admin-settings");
        if (local) {
          try {
            setValues((current) => ({
              ...current,
              ...(JSON.parse(local) as Partial<SettingsValues>),
            }));
          } catch {
            window.localStorage.removeItem("mm-tintas-admin-settings");
          }
        }
        setIsLoading(false);
      }

      void hydrateLocalSettings();
      return () => {
        active = false;
      };
    }

    let active = true;
    async function load() {
      const result = await listSiteSettingsAction();
      if (!active) return;

      if (result.ok) {
        setValues((current) => mergeRemoteSettings(current, result.data));
      } else {
        setError(result.message);
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [demoMode]);

  const activeLabel = useMemo(
    () => tabs.find((tab) => tab.value === activeTab)?.label ?? "Configurações",
    [activeTab],
  );

  function updateValue(
    name: keyof SettingsValues,
    value: string | boolean,
  ) {
    setValues((current) => ({ ...current, [name]: value }));
    setSaved(false);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (demoMode) {
        window.localStorage.setItem(
          "mm-tintas-admin-settings",
          JSON.stringify(values),
        );
      } else {
        const activeGroup = groups.find(
          (group) => group.group === activeTab,
        );
        if (!activeGroup) {
          throw new Error("Não foi possível identificar a seção ativa.");
        }

        const results = await Promise.all(
          [activeGroup].map((group) => {
            const groupValue = Object.fromEntries(
              group.fields.map((field) => [field, values[field]]),
            );

            return upsertSiteSettingAction({
              key: group.key,
              group: group.group,
              value: groupValue,
              description: `Configurações de ${group.group} gerenciadas pelo painel.`,
              isPublic: true,
            });
          }),
        );

        const failed = results.find((result) => !result.ok);
        if (failed) throw new Error(failed.message);
      }

      setSaved(true);
      window.setTimeout(() => setSaved(false), 4000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar as configurações.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Preferências do site
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950 sm:text-3xl">
            Configurações
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Centralize os dados da loja usados no site, mecanismos de busca e
            canais de atendimento.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-emerald-600" />
          Alterações protegidas
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {saved ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl"
        >
          <span className="grid size-6 place-items-center rounded-full bg-emerald-500">
            <Check className="size-3.5" />
          </span>
          Configurações salvas com sucesso.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div className="grid lg:grid-cols-[240px_1fr]">
          <nav
            aria-label="Seções das configurações"
            className="border-b border-slate-200 bg-slate-50/70 p-3 lg:border-b-0 lg:border-r lg:p-4"
          >
            <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:w-full",
                      activeTab === tab.value
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950",
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 hidden rounded-2xl bg-[#0c1b32] p-4 text-white lg:block">
              <Globe2 className="size-5 text-cyan-300" />
              <p className="mt-3 text-xs font-bold">Uma fonte de verdade</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                Estes dados alimentam diferentes áreas do site.
              </p>
            </div>
          </nav>

          <section className="min-w-0">
            <header className="border-b border-slate-200 px-5 py-5 sm:px-7">
              <p className="text-base font-bold text-slate-950">{activeLabel}</p>
              <p className="mt-1 text-xs text-slate-500">
                Preencha apenas informações que podem ser exibidas publicamente.
              </p>
            </header>

            {isLoading ? (
              <div className="grid min-h-[440px] place-items-center">
                <div className="text-center text-sm text-slate-500">
                  <LoaderCircle className="mx-auto mb-3 size-6 animate-spin text-blue-700" />
                  Carregando configurações…
                </div>
              </div>
            ) : (
              <div className="grid min-h-[440px] grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
                {activeTab === "business" ? (
                  <>
                    <SettingsInput
                      label="Nome público da empresa"
                      name="businessName"
                      value={values.businessName}
                      onChange={updateValue}
                      placeholder={placeholderValues.businessName}
                    />
                    <SettingsInput
                      label="Razão social"
                      name="legalName"
                      value={values.legalName}
                      onChange={updateValue}
                      placeholder={placeholderValues.legalName}
                    />
                    <SettingsInput
                      label="CNPJ"
                      name="cnpj"
                      value={values.cnpj}
                      placeholder="00.000.000/0000-00"
                      onChange={updateValue}
                    />
                    <div className="hidden sm:block" />
                    <SettingsTextarea
                      label="Apresentação curta"
                      name="description"
                      value={values.description}
                      maxLength={180}
                      onChange={updateValue}
                      placeholder={placeholderValues.description}
                      help="Usada em rodapés, cartões e apresentações resumidas."
                    />
                  </>
                ) : null}

                {activeTab === "contact" ? (
                  <>
                    <SettingsInput
                      label="Telefone"
                      name="phone"
                      type="tel"
                      value={values.phone}
                      onChange={updateValue}
                      placeholder={placeholderValues.phone}
                    />
                    <SettingsInput
                      label="WhatsApp"
                      name="whatsapp"
                      type="tel"
                      value={values.whatsapp}
                      onChange={updateValue}
                      placeholder={placeholderValues.whatsapp}
                    />
                    <SettingsInput
                      label="E-mail de contato"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={updateValue}
                      placeholder={placeholderValues.email}
                      fullWidth
                    />
                    <SettingsInput
                      label="Endereço"
                      name="address"
                      value={values.address}
                      onChange={updateValue}
                      placeholder={placeholderValues.address}
                      fullWidth
                    />
                    <SettingsInput
                      label="Bairro"
                      name="neighborhood"
                      value={values.neighborhood}
                      onChange={updateValue}
                      placeholder={placeholderValues.neighborhood}
                    />
                    <SettingsInput
                      label="Cidade"
                      name="city"
                      value={values.city}
                      onChange={updateValue}
                      placeholder={placeholderValues.city}
                    />
                    <SettingsInput
                      label="Estado"
                      name="state"
                      value={values.state}
                      onChange={updateValue}
                      placeholder={placeholderValues.state}
                    />
                    <SettingsInput
                      label="CEP"
                      name="postalCode"
                      value={values.postalCode}
                      onChange={updateValue}
                      placeholder={placeholderValues.postalCode}
                    />
                  </>
                ) : null}

                {activeTab === "hours" ? (
                  <>
                    <SettingsInput
                      label="Segunda a sexta"
                      name="weekdayHours"
                      value={values.weekdayHours}
                      onChange={updateValue}
                      placeholder={placeholderValues.weekdayHours}
                      fullWidth
                    />
                    <SettingsInput
                      label="Sábado"
                      name="saturdayHours"
                      value={values.saturdayHours}
                      onChange={updateValue}
                      placeholder={placeholderValues.saturdayHours}
                      fullWidth
                    />
                    <SettingsInput
                      label="Domingos e feriados"
                      name="sundayHours"
                      value={values.sundayHours}
                      onChange={updateValue}
                      placeholder={placeholderValues.sundayHours}
                      fullWidth
                    />
                    <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950 sm:col-span-2">
                      <Clock3 className="mt-0.5 size-4 shrink-0 text-blue-700" />
                      Atualize horários especiais em feriados para evitar
                      deslocamentos desnecessários dos clientes.
                    </div>
                  </>
                ) : null}

                {activeTab === "seo" ? (
                  <>
                    <SettingsInput
                      label="Título padrão do site"
                      name="seoTitle"
                      value={values.seoTitle}
                      onChange={updateValue}
                      placeholder={placeholderValues.seoTitle}
                      help="Recomendado: até 60 caracteres."
                      fullWidth
                    />
                    <SettingsTextarea
                      label="Descrição padrão"
                      name="seoDescription"
                      value={values.seoDescription}
                      maxLength={160}
                      onChange={updateValue}
                      placeholder={placeholderValues.seoDescription}
                      help="Resumo exibido nos resultados de busca quando uma página não possuir descrição própria."
                    />
                    <SettingsInput
                      label="Endereço principal do site"
                      name="siteUrl"
                      type="url"
                      value={values.siteUrl}
                      onChange={updateValue}
                      placeholder={placeholderValues.siteUrl}
                      fullWidth
                    />
                  </>
                ) : null}

                {activeTab === "social" ? (
                  <>
                    <SettingsInput
                      label="Instagram"
                      name="instagram"
                      type="url"
                      value={values.instagram}
                      onChange={updateValue}
                      placeholder={placeholderValues.instagram}
                      fullWidth
                    />
                    <SettingsInput
                      label="Facebook"
                      name="facebook"
                      type="url"
                      value={values.facebook}
                      onChange={updateValue}
                      placeholder={placeholderValues.facebook}
                      fullWidth
                    />
                    <SettingsInput
                      label="YouTube"
                      name="youtube"
                      type="url"
                      value={values.youtube}
                      onChange={updateValue}
                      placeholder={placeholderValues.youtube}
                      fullWidth
                    />
                    <FeatureToggle
                      label="Atalho flutuante do WhatsApp"
                      description="Exibe um botão de atendimento nas páginas públicas."
                      checked={values.whatsappEnabled}
                      onChange={(checked) =>
                        updateValue("whatsappEnabled", checked)
                      }
                    />
                    <FeatureToggle
                      label="Exibir preços no catálogo"
                      description="Quando desativado, os produtos usam a mensagem “Consulte”."
                      checked={values.pricesEnabled}
                      onChange={(checked) =>
                        updateValue("pricesEnabled", checked)
                      }
                    />
                  </>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <MessageCircle className="size-4" />
            Revise telefone e WhatsApp antes de publicar.
          </p>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar configurações
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}

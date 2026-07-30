"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWhatsAppUrl } from "@/components/shared/whatsapp-link";
import { createClient } from "@/lib/supabase/client";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  city: string;
  neighborhood: string;
  profile: string;
  subject: string;
  details: string;
  privacyConsent: boolean;
};

const initialValues: FormValues = {
  name: "",
  phone: "",
  email: "",
  city: "",
  neighborhood: "",
  profile: "",
  subject: "",
  details: "",
  privacyConsent: false,
};

export function QuoteForm({ whatsapp = "" }: { whatsapp?: string }) {
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsPending(true);

    const message = [
      "Olá! Gostaria de solicitar um orçamento.",
      `Nome: ${values.name}`,
      `Telefone: ${values.phone}`,
      values.email ? `E-mail: ${values.email}` : "",
      values.city ? `Cidade: ${values.city}` : "",
      values.neighborhood ? `Bairro: ${values.neighborhood}` : "",
      values.profile ? `Perfil: ${values.profile}` : "",
      `Assunto: ${values.subject}`,
      `Detalhes: ${values.details}`,
    ]
      .filter(Boolean)
      .join("\n");
    const target = getWhatsAppUrl(message, whatsapp);
    const whatsappWindow = window.open("about:blank", "_blank");
    const supabase = createClient();

    try {
      if (supabase) {
        const { data, error } = await supabase.rpc("submit_quote_request", {
          payload: {
            city: values.city.trim(),
            customer_name: values.name.trim(),
            email: values.email.trim(),
            items: [],
            marketing_consent: false,
            message,
            neighborhood: values.neighborhood.trim(),
            phone: values.phone.trim(),
            privacy_consent: values.privacyConsent,
            source: "contact_form",
          },
        });

        if (error) {
          setFeedback(
            "O WhatsApp será aberto, mas não foi possível registrar a solicitação no site.",
          );
        } else {
          const protocol = data?.[0]?.protocol;
          setFeedback(
            protocol
              ? `Solicitação registrada com o protocolo ${protocol}.`
              : "Solicitação registrada com sucesso.",
          );
        }
      }

    } catch {
      setFeedback(
        "O WhatsApp será aberto, mas não foi possível registrar a solicitação no site.",
      );
    } finally {
      setSubmitted(true);
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = target;
      } else {
        window.location.href = target;
      }
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="quote-name">Seu nome</Label>
        <Input
          id="quote-name"
          required
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quote-phone">Telefone ou WhatsApp</Label>
        <Input
          id="quote-phone"
          required
          type="tel"
          autoComplete="tel"
          minLength={8}
          maxLength={30}
          placeholder="(48) 99999-9999"
          value={values.phone}
          onChange={(event) =>
            setValues((current) => ({ ...current, phone: event.target.value }))
          }
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quote-email">E-mail (opcional)</Label>
        <Input
          id="quote-email"
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder="voce@exemplo.com"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          className="h-11"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="quote-city">Cidade (opcional)</Label>
          <Input
            id="quote-city"
            autoComplete="address-level2"
            maxLength={120}
            value={values.city}
            onChange={(event) =>
              setValues((current) => ({ ...current, city: event.target.value }))
            }
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quote-neighborhood">Bairro (opcional)</Label>
          <Input
            id="quote-neighborhood"
            autoComplete="address-level3"
            maxLength={120}
            value={values.neighborhood}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                neighborhood: event.target.value,
              }))
            }
            className="h-11"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quote-profile">Você é</Label>
        <Select
          value={values.profile}
          onValueChange={(profile) =>
            setValues((current) => ({ ...current, profile }))
          }
        >
          <SelectTrigger id="quote-profile" className="h-11 w-full">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cliente final">Cliente final</SelectItem>
            <SelectItem value="Pintor profissional">
              Pintor profissional
            </SelectItem>
            <SelectItem value="Arquiteto ou engenheiro">
              Arquiteto ou engenheiro
            </SelectItem>
            <SelectItem value="Empresa ou condomínio">
              Empresa ou condomínio
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quote-subject">O que você procura?</Label>
        <Input
          id="quote-subject"
          required
          placeholder="Ex.: tinta para fachada"
          value={values.subject}
          onChange={(event) =>
            setValues((current) => ({ ...current, subject: event.target.value }))
          }
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quote-details">Conte um pouco sobre a obra</Label>
        <Textarea
          id="quote-details"
          required
          minLength={10}
          rows={5}
          placeholder="Área aproximada, tipo de superfície, ambiente interno ou externo..."
          value={values.details}
          onChange={(event) =>
            setValues((current) => ({ ...current, details: event.target.value }))
          }
        />
      </div>
      <label className="flex items-start gap-3 rounded-2xl border bg-muted/35 p-4 text-sm leading-6">
        <input
          type="checkbox"
          required
          checked={values.privacyConsent}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              privacyConsent: event.target.checked,
            }))
          }
          className="mt-1 size-4 shrink-0 accent-primary"
        />
        <span>
          Concordo com o uso dos dados para responder a esta solicitação,
          conforme a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            className="font-semibold text-primary underline underline-offset-4"
          >
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Preparando solicitação…" : "Continuar no WhatsApp"}
        <ArrowRight aria-hidden="true" />
      </Button>
      {submitted ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-emerald-700"
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Abrimos o WhatsApp com os dados preenchidos.
        </p>
      ) : null}
      {feedback ? (
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          {feedback}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">
        Ao continuar, a mensagem será aberta no WhatsApp. Quando o banco estiver
        conectado, a solicitação também será registrada com segurança para
        acompanhamento da equipe.
      </p>
    </form>
  );
}

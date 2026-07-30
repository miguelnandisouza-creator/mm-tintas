"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, CheckCircle2, Info } from "lucide-react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculatePaint } from "@/features/calculator/paint-math";

type CalculatorValues = {
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
  coats: number;
  yieldPerLiter: number;
};

const initialValues: CalculatorValues = {
  length: 4,
  width: 3,
  height: 2.7,
  doors: 1,
  windows: 1,
  coats: 2,
  yieldPerLiter: 10,
};

export function PaintCalculator({
  whatsapp = "",
  whatsappEnabled = false,
}: {
  whatsapp?: string;
  whatsappEnabled?: boolean;
}) {
  const [values, setValues] = useState(initialValues);

  const result = useMemo(() => {
    return calculatePaint(values);
  }, [values]);

  function updateValue(field: keyof CalculatorValues, value: number) {
    setValues((current) => ({
      ...current,
      [field]: Number.isFinite(value) ? Math.max(value, 0) : 0,
    }));
  }

  const packageText =
    result.packages.length > 0
      ? result.packages
          .map(({ quantity, size }) => `${quantity} embalagem(ns) de ${size} L`)
          .join(" + ")
      : "Sem embalagem necessária";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Medidas do ambiente</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Consideramos as quatro paredes do cômodo. Portas e janelas são
            descontadas automaticamente.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Comprimento"
              suffix="m"
              value={values.length}
              onChange={(value) => updateValue("length", value)}
            />
            <NumberField
              label="Largura"
              suffix="m"
              value={values.width}
              onChange={(value) => updateValue("width", value)}
            />
            <NumberField
              label="Altura"
              suffix="m"
              value={values.height}
              onChange={(value) => updateValue("height", value)}
            />
            <div className="grid gap-2">
              <Label htmlFor="coats">Número de demãos</Label>
              <Select
                value={String(values.coats)}
                onValueChange={(value) => updateValue("coats", Number(value))}
              >
                <SelectTrigger id="coats" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((coats) => (
                    <SelectItem key={coats} value={String(coats)}>
                      {coats} {coats === 1 ? "demão" : "demãos"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              label="Portas"
              value={values.doors}
              step={1}
              onChange={(value) => updateValue("doors", value)}
            />
            <NumberField
              label="Janelas"
              value={values.windows}
              step={1}
              onChange={(value) => updateValue("windows", value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yield">Rendimento informado na embalagem</Label>
            <Select
              value={String(values.yieldPerLiter)}
              onValueChange={(value) =>
                updateValue("yieldPerLiter", Number(value))
              }
            >
              <SelectTrigger id="yield" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 m² por litro</SelectItem>
                <SelectItem value="10">10 m² por litro</SelectItem>
                <SelectItem value="12">12 m² por litro</SelectItem>
                <SelectItem value="14">14 m² por litro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Alert>
            <Info aria-hidden="true" />
            <AlertTitle>Estimativa orientativa</AlertTitle>
            <AlertDescription>
              Textura, absorção, cor anterior e método de aplicação alteram o
              consumo. Confirme o rendimento na embalagem do produto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card
        aria-live="polite"
        className="h-fit overflow-hidden rounded-3xl border-primary/20 bg-primary text-primary-foreground"
      >
        <CardHeader className="border-b border-primary-foreground/15">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary-foreground/12">
            <Calculator aria-hidden="true" className="size-5" />
          </span>
          <p className="text-sm font-semibold text-primary-foreground/70">
            Quantidade estimada
          </p>
          <CardTitle className="text-4xl tracking-[-0.04em]">
            {result.litersWithMargin.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}{" "}
            litros
          </CardTitle>
          <p className="text-sm text-primary-foreground/70">
            Inclui margem técnica de 10%.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <ResultRow
              label="Área total das paredes"
              value={`${result.wallArea.toFixed(1)} m²`}
            />
            <ResultRow
              label="Desconto de aberturas"
              value={`${result.openingArea.toFixed(1)} m²`}
            />
            <ResultRow
              label="Área líquida"
              value={`${result.netArea.toFixed(1)} m²`}
            />
            <ResultRow label="Sugestão de compra" value={packageText} stacked />
          </div>
          <div className="mt-7 rounded-2xl bg-primary-foreground/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Leve esta estimativa para nossa equipe
            </p>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
              Ajudamos a ajustar a quantidade para o produto e a superfície
              escolhidos.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="mt-5 w-full">
            {whatsappEnabled ? (
              <WhatsAppLink
                message={`Olá! Calculei aproximadamente ${result.litersWithMargin.toFixed(1)} litros para ${result.netArea.toFixed(1)} m², com ${values.coats} demãos. Gostaria de ajuda com os produtos.`}
                phone={whatsapp}
              >
                Pedir orientação
              </WhatsAppLink>
            ) : (
              <Link href="/contato">Solicitar orientação</Link>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  suffix?: string;
  step?: number;
  onChange: (value: number) => void;
};

function NumberField({
  label,
  value,
  suffix,
  step = 0.1,
  onChange,
}: NumberFieldProps) {
  const id = label.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
          className="h-11 pr-10"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  stacked = false,
}: {
  label: string;
  value: string;
  stacked?: boolean;
}) {
  return (
    <div
      className={
        stacked
          ? "border-t border-primary-foreground/15 pt-4"
          : "flex items-center justify-between gap-5"
      }
    >
      <p className="text-sm text-primary-foreground/65">{label}</p>
      <p className={stacked ? "mt-1 font-semibold" : "text-sm font-semibold"}>
        {value}
      </p>
    </div>
  );
}

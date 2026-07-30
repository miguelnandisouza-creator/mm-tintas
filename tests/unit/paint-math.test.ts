import { describe, expect, it } from "vitest";

import {
  calculatePaint,
  recommendPaintPackages,
} from "../../src/features/calculator/paint-math";

describe("calculatePaint", () => {
  it("calcula paredes, desconta aberturas e inclui margem", () => {
    const result = calculatePaint({
      length: 4,
      width: 3,
      height: 2.7,
      doors: 1,
      windows: 1,
      coats: 2,
      yieldPerLiter: 10,
    });

    expect(result.wallArea).toBeCloseTo(37.8);
    expect(result.openingArea).toBeCloseTo(3.12);
    expect(result.netArea).toBeCloseTo(34.68);
    expect(result.litersWithMargin).toBeCloseTo(7.6296);
  });

  it("nunca retorna área ou volume negativos", () => {
    const result = calculatePaint({
      length: -4,
      width: -3,
      height: -2.7,
      doors: 10,
      windows: 10,
      coats: 2,
      yieldPerLiter: 0,
    });

    expect(result.netArea).toBe(0);
    expect(result.liters).toBe(0);
    expect(result.packages).toEqual([]);
  });
});

describe("recommendPaintPackages", () => {
  it("combina embalagens e arredonda a menor para cima", () => {
    expect(recommendPaintPackages(21)).toEqual([
      { size: 18, quantity: 1 },
      { size: 3.6, quantity: 1 },
    ]);
  });

  it("evita muitas embalagens pequenas quando uma lata maior é prática", () => {
    expect(recommendPaintPackages(17.1)).toEqual([
      { size: 18, quantity: 1 },
    ]);
  });

  it("trata entradas não finitas sem bloquear a interface", () => {
    expect(recommendPaintPackages(Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it.each([
    [3.5, [{ size: 3.6, quantity: 1 }]],
    [17.9, [{ size: 18, quantity: 1 }]],
    [
      4,
      [
        { size: 3.6, quantity: 1 },
        { size: 0.9, quantity: 1 },
      ],
    ],
  ])("escolhe combinações práticas para %s litros", (liters, expected) => {
    expect(recommendPaintPackages(liters)).toEqual(expected);
  });
});

export type PaintCalculationInput = {
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
  coats: number;
  yieldPerLiter: number;
  safetyMargin?: number;
};

export type PaintPackage = {
  size: number;
  quantity: number;
};

const packageSizes = [18, 3.6, 0.9] as const;
const packageUnits = [20, 4, 1] as const;
const packageHandlingWeight = 0.4;

export function recommendPaintPackages(liters: number): PaintPackage[] {
  if (!Number.isFinite(liters) || liters <= 0) return [];

  const target = liters;
  const targetUnits = Math.ceil(target / packageSizes[2] - 0.0001);
  let best:
    | {
        quantities: [number, number, number];
        overage: number;
        count: number;
        score: number;
      }
    | undefined;

  for (
    let capacityUnits = targetUnits;
    capacityUnits < targetUnits + packageUnits[0];
    capacityUnits += 1
  ) {
    const large = Math.floor(capacityUnits / packageUnits[0]);
    const afterLarge = capacityUnits % packageUnits[0];
    const medium = Math.floor(afterLarge / packageUnits[1]);
    const small = afterLarge % packageUnits[1];
    const total = capacityUnits * packageSizes[2];
    const overage = Math.max(total - target, 0);
    const count = large + medium + small;
    const candidate = {
      quantities: [large, medium, small] as [number, number, number],
      overage,
      count,
      score: overage + count * packageHandlingWeight,
    };

    if (
      !best ||
      candidate.score < best.score - 0.0001 ||
      (Math.abs(candidate.score - best.score) < 0.0001 &&
        (candidate.overage < best.overage - 0.0001 ||
          (Math.abs(candidate.overage - best.overage) < 0.0001 &&
            candidate.count < best.count)))
    ) {
      best = candidate;
    }
  }

  return packageSizes.flatMap((size, index) => {
    const quantity = best?.quantities[index] ?? 0;
    return quantity > 0 ? [{ size, quantity }] : [];
  });
}

export function calculatePaint(input: PaintCalculationInput) {
  const values = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      Number.isFinite(value) ? Math.max(value, 0) : 0,
    ]),
  ) as unknown as Required<PaintCalculationInput>;

  const wallArea = 2 * (values.length + values.width) * values.height;
  const openingArea = values.doors * 1.68 + values.windows * 1.44;
  const netArea = Math.max(wallArea - openingArea, 0);
  const liters =
    values.yieldPerLiter > 0
      ? (netArea * values.coats) / values.yieldPerLiter
      : 0;
  const requestedMargin = input.safetyMargin ?? 0.1;
  const margin = Number.isFinite(requestedMargin)
    ? Math.max(requestedMargin, 0)
    : 0.1;
  const litersWithMargin = liters * (1 + Math.max(margin, 0));

  return {
    wallArea,
    openingArea,
    netArea,
    liters,
    litersWithMargin,
    packages: recommendPaintPackages(litersWithMargin),
  };
}

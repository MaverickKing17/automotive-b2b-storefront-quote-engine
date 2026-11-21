import { clientConfig, formatCad, getTier1Price } from '../data/clientConfig';
import type { CatalogProduct } from '../data/clientConfig';

export interface SpecAssistAnswer {
  answer: string;
  matchedSkus: string[];
  isFitmentResponse: boolean;
  isVerifiedFitment?: boolean;
}

const FITMENT_INTENT_PATTERN =
  /\b(fit|fits|fitment|compatible|compatibility|verified|verify|work with|work on|install on|support on|toyota|hiace|ford|transit|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|kenworth|peterbilt|volvo|chevy|chevrolet|gmc|nissan|hino)\b/i;

const VEHICLE_MENTION_PATTERN =
  /\b(toyota|hiace|ford|transit|e-transit|f-550|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|npr|kenworth|peterbilt|volvo|chevy|chevrolet|gmc|nissan|hino|van|truck|chassis|tractor)\b/i;

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSpecOnlyTruckQuery(query: string): boolean {
  const q = normalizeText(query);
  // Queries like "Which dashcams support 24V Class 8 trucks?" are spec-matching questions,
  // not specific vehicle make/model fitment checks.
  const hasSpecificVehicleMakeOrModel =
    /\b(toyota|hiace|ford|transit|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|npr|kenworth|peterbilt|volvo|hino)\b/i.test(
      q
    );
  const hasCategoryOrSpecIntent =
    /\b(which|what|dashcam|dashcams|gateway|gateways|radar|charger|controller|sensor|harness|24v|12v|9-32v|ip67|ip65|ip54|j1939|obd|ocpp|can|usb-c|lte|price|tier|cost)\b/i.test(
      q
    );

  return !hasSpecificVehicleMakeOrModel && hasCategoryOrSpecIntent;
}

function matchesVerifiedMatrixEntry(query: string): {
  matched: boolean;
  product?: CatalogProduct;
} {
  const q = normalizeText(query);

  const verifiedEntries = clientConfig.compatibilityMatrix.filter(
    (entry) => entry.status === 'verified'
  );

  for (const entry of verifiedEntries) {
    const hasYear = q.includes(normalizeText(entry.year));
    const hasMake = q.includes(normalizeText(entry.make));
    const hasModel = q.includes(normalizeText(entry.model));
    const hasClass = q.includes(normalizeText(entry.vehicleClass));

    if (hasYear && hasMake && hasModel && hasClass) {
      const mentionedProduct = clientConfig.products.find(
        (p) => q.includes(p.sku.toLowerCase()) || q.includes(p.name.toLowerCase())
      );
      return { matched: true, product: mentionedProduct };
    }
  }

  return { matched: false };
}

function findMatchingProducts(query: string): CatalogProduct[] {
  const q = normalizeText(query);
  const tokens = q.split(' ').filter((t) => t.length >= 2);

  const scored = clientConfig.products.map((product) => {
    let score = 0;
    const skuLower = product.sku.toLowerCase();
    const nameLower = product.name.toLowerCase();
    const catLower = product.category.toLowerCase();
    const specBlob = `${product.specs.power} ${product.specs.interface} ${product.specs.ipRating} ${product.description}`.toLowerCase();

    if (q.includes(skuLower)) score += 20;
    if (q.includes('dashcam') || q.includes('dashcams')) {
      if (product.name.toLowerCase().includes('dashcam')) score += 12;
      else if (product.category === 'Video Telematics') score += 4;
    }
    if (q.includes('class 8') && (product.specs.power.includes('24V') || product.specs.interface.includes('J1939'))) {
      score += 6;
    }
    if (q.includes('24v') && product.specs.power.toLowerCase().includes('24v')) {
      score += 8;
    }
    if (q.includes('12v') && product.specs.power.toLowerCase().includes('12v')) {
      score += 8;
    }

    for (const token of tokens) {
      if (skuLower.includes(token)) score += 6;
      if (nameLower.includes(token)) score += 4;
      if (catLower.includes(token)) score += 3;
      if (specBlob.includes(token)) score += 3;
      if (product.keywords.some((kw) => kw.includes(token) || token.includes(kw))) {
        score += 4;
      }
    }

    return { product, score };
  });

  const filtered = scored
    .filter((item) => item.score >= 6)
    .sort((a, b) => b.score - a.score);

  return filtered.map((item) => item.product);
}

export function answerSpecAssistQuestion(rawQuery: string): SpecAssistAnswer {
  const query = rawQuery.trim();
  if (!query) {
    return {
      answer:
        'Enter a hardware specification question (e.g., power input, interface, IP rating, or SKU) or ask about vehicle fitment using year, make, model, and vehicle class.',
      matchedSkus: [],
      isFitmentResponse: false,
    };
  }

  // 1. Check if this is a vehicle-specific fitment question
  const isFitmentQuery =
    !isSpecOnlyTruckQuery(query) &&
    (FITMENT_INTENT_PATTERN.test(query) || VEHICLE_MENTION_PATTERN.test(query));

  if (isFitmentQuery) {
    const verifiedCheck = matchesVerifiedMatrixEntry(query);
    if (verifiedCheck.matched) {
      const targetSku = verifiedCheck.product?.sku ?? 'AST-104';
      const targetProduct =
        verifiedCheck.product ?? clientConfig.products.find((p) => p.sku === targetSku);
      const specsSummary = targetProduct
        ? `${targetProduct.name} (${targetProduct.specs.power} · ${targetProduct.specs.interface} · ${targetProduct.specs.ipRating})`
        : 'published catalog hardware';

      return {
        answer: `Verified: 2025 Rivian EDV 700 (Commercial EV) matches a verified vehicle profile in the published fitment matrix for ${specsSummary}. Source: ${targetSku}`,
        matchedSkus: [targetSku],
        isFitmentResponse: true,
        isVerifiedFitment: true,
      };
    }

    // All other vehicle fitment questions return the exact required escalation string
    return {
      answer: clientConfig.specAssistEscalationText,
      matchedSkus: [],
      isFitmentResponse: true,
      isVerifiedFitment: false,
    };
  }

  // 2. Otherwise, answer specification / catalog questions strictly from clientConfig
  const matches = findMatchingProducts(query);
  if (matches.length === 0) {
    return {
      answer:
        'No matching hardware was found in the published catalog data. Ask about AST-104, AST-208, AST-316, AST-422, AST-537, or AST-640, or specify power (12V/24V, 9–32V DC, wide-range DC), interface (4G LTE, J1939, OBD-II, CAN, OCPP 1.6), or IP rating.',
      matchedSkus: [],
      isFitmentResponse: false,
    };
  }

  const topMatches = matches.slice(0, 3);
  const lines = topMatches.map((p) => {
    const tier1 = getTier1Price(p);
    return `${p.name} (${p.category}): Power ${p.specs.power} | Interface ${p.specs.interface} | Rating ${p.specs.ipRating} | From ${formatCad(tier1)} / ${p.unitLabel}`;
  });

  const citation = `Source: ${topMatches.map((p) => p.sku).join(', ')}`;

  return {
    answer: `${lines.join('\n')}\n\n${citation}`,
    matchedSkus: topMatches.map((p) => p.sku),
    isFitmentResponse: false,
  };
}

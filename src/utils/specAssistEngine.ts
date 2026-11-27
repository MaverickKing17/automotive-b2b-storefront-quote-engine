import { clientConfig, formatCad, getTier1Price } from '../data/clientConfig';
import type { CatalogProduct } from '../data/clientConfig';
import { STOREFRONTS, type StorefrontId } from '../data/storefronts';

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
  const hasSpecificVehicleMakeOrModel =
    /\b(toyota|hiace|ford|transit|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|npr|kenworth|peterbilt|volvo|hino)\b/i.test(
      q
    );
  const hasCategoryOrSpecIntent =
    /\b(which|what|compare|show|dashcam|dashcams|gateway|gateways|radar|charger|chargers|pedestal|pedestals|wallbox|dispenser|bollard|metering|controller|sensor|harness|tracker|trackers|eld|tablet|beacon|antenna|reefer|cold-chain|shelving|partition|bulkhead|lightbar|rack|inverter|alarm|24v|12v|9-32v|9-36v|208|240v|480v|600v|3-phase|19\.2kw|120kw|3000w|ip68|ip67|ip66|ip65|ip54|nema|j1939|obd|ocpp|modbus|can|usb-c|lte|ble|price|tier|tiers|cad|cost)\b/i.test(
      q
    );

  return !hasSpecificVehicleMakeOrModel && hasCategoryOrSpecIntent;
}

function matchesMatrixEntry(
  query: string,
  catalog: CatalogProduct[]
): {
  entry?: (typeof clientConfig.compatibilityMatrix)[number];
  product?: CatalogProduct;
} {
  const q = normalizeText(query);

  for (const entry of clientConfig.compatibilityMatrix) {
    const hasYear = q.includes(normalizeText(entry.year));
    const hasMake = q.includes(normalizeText(entry.make));
    const hasModel = q.includes(normalizeText(entry.model));
    const normalizedClass = normalizeText(entry.vehicleClass);
    const mentionedOtherClass = clientConfig.fitmentOptions.vehicleClasses.some((vc) => {
      const n = normalizeText(vc);
      return n !== normalizedClass && q.includes(n);
    });

    if (hasYear && hasMake && hasModel && !mentionedOtherClass) {
      const mentionedProduct = catalog.find(
        (p) => q.includes(p.sku.toLowerCase()) || q.includes(p.name.toLowerCase())
      );
      return { entry, product: mentionedProduct };
    }
  }

  return {};
}

function isUnavailableMetadataQuery(query: string): boolean {
  const q = normalizeText(query);
  return /\b(stock|inventory|in stock|lead time|delivery date|manufacturer|oem|certif|ul listed|fcc|ce|iso|install step|wiring diagram|pinout)\b/i.test(
    q
  );
}

function findMatchingProducts(query: string, catalog: CatalogProduct[]): CatalogProduct[] {
  const q = normalizeText(query);
  const tokens = q.split(' ').filter((t) => t.length >= 2);

  const scored = catalog.map((product) => {
    let score = 0;
    const skuLower = product.sku.toLowerCase();
    const nameLower = product.name.toLowerCase();
    const catLower = product.category.toLowerCase();
    const specBlob = `${product.specs.power} ${product.specs.interface} ${product.specs.ipRating} ${product.description}`.toLowerCase();

    if (q.includes(skuLower)) score += 24;
    if (q.includes('dashcam') || q.includes('dashcams')) {
      if (nameLower.includes('dashcam')) score += 12;
      else if (product.category === 'Video Telematics') score += 4;
    }
    if (
      q.includes('class 8') &&
      (product.specs.power.includes('24V') ||
        product.specs.power.includes('36V') ||
        product.specs.interface.includes('J1939'))
    ) {
      score += 6;
    }
    if (q.includes('24v') && product.specs.power.toLowerCase().includes('24v')) {
      score += 8;
    }
    if (q.includes('12v') && product.specs.power.toLowerCase().includes('12v')) {
      score += 8;
    }
    if (q.includes('480v') && specBlob.includes('480v')) {
      score += 10;
    }
    if (q.includes('240v') && specBlob.includes('240v')) {
      score += 8;
    }
    if (q.includes('ocpp') && specBlob.includes('ocpp')) {
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

export function answerSpecAssistQuestion(
  rawQuery: string,
  storefrontId: StorefrontId = 'astrateq'
): SpecAssistAnswer {
  const query = rawQuery.trim();
  const storefront = STOREFRONTS[storefrontId] ?? STOREFRONTS.astrateq;
  const catalog = storefront.products;

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
    const matrixResult = matchesMatrixEntry(query, catalog);
    if (matrixResult.entry) {
      const targetProduct = matrixResult.product ?? catalog[0];
      const targetSku = targetProduct.sku;
      const harnessSku =
        matrixResult.entry.recommendedHarnessSku || targetProduct.recommendedHarnessSku;
      const citedSkus = harnessSku && harnessSku !== targetSku ? [targetSku, harnessSku] : [targetSku];
      const specsSummary = `${targetProduct.name} (${targetProduct.specs.power} · ${targetProduct.specs.interface} · ${targetProduct.specs.ipRating})`;

      if (matrixResult.entry.status === 'verified') {
        if (targetProduct.category === 'EV Power & Diagnostics') {
          return {
            answer: `Requires confirmation: ${targetProduct.name} is a stationary depot controller (${targetProduct.specs.interface}). Depot electrical service and OCPP configuration must be confirmed by the supplier.\n\nSource: ${targetSku}`,
            matchedSkus: [targetSku],
            isFitmentResponse: true,
            isVerifiedFitment: false,
          };
        }
        return {
          answer: `Verified (sample fitment matrix): ${matrixResult.entry.year} ${matrixResult.entry.make} ${matrixResult.entry.model} (${matrixResult.entry.vehicleClass}) matches a published sample profile for ${specsSummary}. ${matrixResult.entry.notes}${harnessSku ? ` Recommended harness: ${harnessSku}.` : ''} Final harness pinout confirmation applies at RFQ.\n\nSource: ${citedSkus.join(', ')}`,
          matchedSkus: citedSkus,
          isFitmentResponse: true,
          isVerifiedFitment: true,
        };
      }

      return {
        answer: `Requires confirmation: ${matrixResult.entry.year} ${matrixResult.entry.make} ${matrixResult.entry.model} (${matrixResult.entry.vehicleClass}) — ${matrixResult.entry.notes}${harnessSku ? ` Recommended harness check: ${harnessSku}.` : ''} Attach this vehicle group to your quote request for supplier engineering confirmation.\n\nSource: ${citedSkus.join(', ')}`,
        matchedSkus: citedSkus,
        isFitmentResponse: true,
        isVerifiedFitment: false,
      };
    }

    return {
      answer: `Not yet verified: ${clientConfig.specAssistEscalationText}`,
      matchedSkus: [],
      isFitmentResponse: true,
      isVerifiedFitment: false,
    };
  }

  // 2. Check if user asks for metadata not present in sample catalogue (inventory, manufacturer, certifications, wiring diagrams)
  const matches = findMatchingProducts(query, catalog);
  if (isUnavailableMetadataQuery(query)) {
    const citedNote =
      matches.length > 0
        ? `\n\nPublished catalogue record (${matches[0].sku}): Power ${matches[0].specs.power} | Interface ${matches[0].specs.interface} | Rating ${matches[0].specs.ipRating}${matches[0].recommendedHarnessSku ? ` | Recommended harness: ${matches[0].recommendedHarnessSku}` : ''}.`
        : '';
    return {
      answer: `Information unavailable in demonstration catalogue: live stock availability, OEM manufacturer assignments, regulatory certifications, lead times, and vehicle-specific wiring instructions are not published in this sample environment. Submit an RFQ to request confirmed documentation from a supplier.${citedNote}`,
      matchedSkus: matches.slice(0, 1).map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 3. Otherwise, answer specification / catalog questions strictly from the active storefront catalog
  if (matches.length === 0) {
    const skuList = catalog.map((p) => p.sku).join(', ');
    return {
      answer: `No matching hardware was found in the published ${storefront.brandName} sample catalog. Ask about ${skuList}, or query by power input, interface, enclosure rating, or CAD tiers. For unlisted requirements, submit an RFQ for supplier confirmation.`,
      matchedSkus: [],
      isFitmentResponse: false,
    };
  }

  const topMatches = matches.slice(0, 3);
  const lines = topMatches.map((p) => {
    const tier1 = getTier1Price(p);
    const tier2 = p.tiers[1];
    const tier2Text =
      tier2 && tier2.unitPrice !== null ? ` | ${tier2.label}: ${formatCad(tier2.unitPrice)}` : '';
    const harnessText = p.recommendedHarnessSku
      ? ` | Recommended accessory: ${p.recommendedHarnessSku}`
      : '';
    return `${p.name} (${p.category}): Power ${p.specs.power} | Interface ${p.specs.interface} | Rating ${p.specs.ipRating} | Sample From ${formatCad(tier1)} / ${p.unitLabel}${tier2Text}${harnessText}`;
  });

  const citation = `Source: ${topMatches.map((p) => p.sku).join(', ')} (sample demonstration data)`;

  return {
    answer: `${lines.join('\n')}\n\n${citation}`,
    matchedSkus: topMatches.map((p) => p.sku),
    isFitmentResponse: false,
  };
}

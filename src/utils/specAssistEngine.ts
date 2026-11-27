import {
  clientConfig,
  evaluateVehicleFitment,
  formatCad,
  getNormalizedProductMetadata,
  getTier1Price,
  type CatalogProduct,
} from '../data/clientConfig';
import { STOREFRONTS, type StorefrontId } from '../data/storefronts';

export interface SpecAssistAnswer {
  answer: string;
  matchedSkus: string[];
  isFitmentResponse: boolean;
  isVerifiedFitment?: boolean;
}

const FITMENT_INTENT_PATTERN =
  /\b(fit|fits|fitment|compatible|compatibility|verified|verify|work with|work on|install on|support on|suitable for|toyota|hiace|ford|transit|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|kenworth|peterbilt|volvo|chevy|chevrolet|gmc|nissan|hino|unlisted|202\d\s+vehicle)\b/i;

const VEHICLE_MENTION_PATTERN =
  /\b(toyota|hiace|ford|transit|e-transit|f-550|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|npr|kenworth|peterbilt|volvo|chevy|chevrolet|gmc|nissan|hino|van|truck|chassis|tractor|vehicle)\b/i;

const UNIVERSAL_FITMENT_PATTERN =
  /\b(every|all|any|entire|universal|guarantee|guaranteed|always works|unlisted|not listed)\b/i;

const MAX_VOLTAGE_QUERY_PATTERN =
  /\b(max(?:imum)?\s+(?:supported\s+)?voltage|peak\s+voltage|surge\s+voltage|voltage\s+limit|overvoltage|min(?:imum)?\s+voltage|exact\s+voltage\s+range)\b/i;

const CERTIFICATION_QUERY_PATTERN =
  /\b(certif(?:y|ied|ication|ications)?|ul\s*listed|ul|fcc|ce|csa|iso|rohs|sae|mil-std|fmcsa|ptcrb|ece|ip69k|safety\s+standard|regulatory|compliance\s+approval|approved\s+by)\b/i;

const HARNESS_QUERY_PATTERN =
  /\b(harness|wiring\s+kit|y-splitter|adapter\s+cable|which\s+(?:installation\s+)?harness|required\s+harness|contains\s+no\s+harness|no\s+harness\s+information)\b/i;

const OTHER_UNAVAILABLE_META_PATTERN =
  /\b(stock|inventory|in\s+stock|lead\s+time|delivery\s+date|manufacturer|oem|install\s+step|wiring\s+diagram|pinout|operating\s+temp(?:erature)?|weight|dimensions|resolution|storage\s+capacity|cellular\s+band|warranty\s+period)\b/i;

const COMPARISON_PATTERN = /\b(compare|comparison|vs\.?|versus|difference\s+between)\b/i;

const INSTALLATION_QUERY_PATTERN = /\b(install|installation|mounting|commission|setup)\b/i;

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractMentionedSkus(query: string, catalog: CatalogProduct[]): CatalogProduct[] {
  const qLower = query.toLowerCase();
  const matched: CatalogProduct[] = [];
  for (const product of catalog) {
    const skuRe = new RegExp(`\\b${product.sku.toLowerCase().replace('-', '[-\\s]?')}\\b`, 'i');
    if (skuRe.test(qLower) || qLower.includes(product.name.toLowerCase())) {
      matched.push(product);
    }
  }
  return matched;
}

function isSpecOnlyTruckQuery(query: string): boolean {
  const q = normalizeText(query);
  if (UNIVERSAL_FITMENT_PATTERN.test(q)) {
    return false;
  }
  const hasSpecificVehicleMakeOrModel =
    /\b(toyota|hiace|ford|transit|rivian|edv|freightliner|cascadia|sprinter|mercedes|promaster|ram|isuzu|npr|kenworth|peterbilt|volvo|hino|unlisted)\b/i.test(
      q
    );
  const hasCategoryOrSpecIntent =
    /\b(which|what|compare|vs|versus|show|dashcam|dashcams|gateway|gateways|radar|charger|chargers|pedestal|pedestals|wallbox|dispenser|bollard|metering|controller|sensor|harness|tracker|trackers|eld|tablet|beacon|antenna|reefer|cold-chain|shelving|partition|bulkhead|lightbar|rack|inverter|alarm|24v|12v|9-32v|9-36v|208|240v|480v|600v|3-phase|19\.2kw|120kw|3000w|ip68|ip67|ip66|ip65|ip54|nema|j1939|obd|ocpp|modbus|can|usb-c|lte|ble|price|tier|tiers|cad|cost)\b/i.test(
      q
    );

  return !hasSpecificVehicleMakeOrModel && hasCategoryOrSpecIntent;
}

function matchesMatrixEntry(
  query: string,
  catalog: CatalogProduct[]
): {
  entry?: (typeof clientConfig.compatibilityMatrix)[number];
  mentionedProducts: CatalogProduct[];
} {
  const q = normalizeText(query);
  const mentionedProducts = extractMentionedSkus(query, catalog);

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
      return { entry, mentionedProducts };
    }
  }

  return { mentionedProducts };
}

const QUERY_STOPWORDS = new Set([
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'if',
  'no',
  'not',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'or',
  'and',
  'with',
  'by',
  'from',
  'this',
  'that',
  'these',
  'those',
  'what',
  'which',
  'who',
  'how',
  'when',
  'where',
  'why',
  'can',
  'you',
  'your',
  'does',
  'do',
  'did',
  'has',
  'have',
  'had',
  'will',
  'would',
  'could',
  'should',
  'any',
  'all',
  'every',
  'there',
  'available',
  'published',
  'specification',
  'specifications',
  'specs',
  'spec',
  'product',
  'products',
  'catalogue',
  'catalog',
  'information',
  'contains',
  'required',
  'supported',
  'maximum',
  'minimum',
]);

function findMatchingProducts(
  query: string,
  catalog: CatalogProduct[],
  options: { suppressGenericHarnessBoost?: boolean } = {}
): CatalogProduct[] {
  const explicitlyMentioned = extractMentionedSkus(query, catalog);
  if (explicitlyMentioned.length > 0) {
    return explicitlyMentioned;
  }

  const q = normalizeText(query);
  const tokens = q.split(' ').filter((t) => {
    if (t.length < 2) return false;
    if (QUERY_STOPWORDS.has(t)) return false;
    if (
      options.suppressGenericHarnessBoost &&
      ['harness', 'wiring', 'cable', 'install', 'installation', 'accessory'].includes(t)
    ) {
      return false;
    }
    return true;
  });

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

  return scored
    .filter((item) => item.score >= 6)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

function formatProductDetailLine(product: CatalogProduct): string {
  const meta = getNormalizedProductMetadata(product);
  const tier1 = getTier1Price(product);
  const tier2 = product.tiers[1];
  const tier2Text =
    tier2 && tier2.unitPrice !== null ? ` | ${tier2.label}: ${formatCad(tier2.unitPrice)}` : '';
  return [
    `${product.name} (${product.category})`,
    `Specs (Sample): Power ${product.specs.power} | Interface ${product.specs.interface} | Rating ${product.specs.ipRating}`,
    `Manufacturer: ${meta.manufacturer}`,
    `Installation: ${meta.installationRequirements}`,
    `Accessories: ${meta.accessoryRequirements.note}`,
    `Compatibility: ${meta.compatibilityProfile.scopeNote}`,
    `Sample CAD Pricing: From ${formatCad(tier1)} / ${product.unitLabel}${tier2Text} (50+: formal quote)`,
  ].join('\n');
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
        'Enter a hardware specification question (e.g., power input, interface, IP rating, comparison, or SKU) or ask about vehicle fitment using exact year, make, model, and vehicle class.',
      matchedSkus: [],
      isFitmentResponse: false,
    };
  }

  const explicitSkus = extractMentionedSkus(query, catalog);

  // 1. Negative test: missing electrical limits (e.g. maximum supported voltage when unpublished)
  if (MAX_VOLTAGE_QUERY_PATTERN.test(query)) {
    const targets = explicitSkus.length > 0 ? explicitSkus : findMatchingProducts(query, catalog);
    if (targets.length === 0) {
      return {
        answer:
          'Information unavailable in demonstration catalogue: no maximum supported voltage limit is published when a product does not specify numeric voltage bounds.\n\nIn the published Astrateq sample catalogue, only AST-208 lists a numeric range (9–32V DC). AST-104, AST-316, AST-537, and AST-640 list nominal "12V/24V" only, and AST-422 lists "wide-range DC" without numeric min/max ratings. Maximum/peak surge voltage limits cannot be inferred and require supplier engineering confirmation.',
        matchedSkus: [],
        isFitmentResponse: false,
      };
    }

    const details = targets.map((p) => {
      const hasBoundedRange = /\d+\s*[–-]\s*\d+\s*v/i.test(p.specs.power);
      return hasBoundedRange
        ? `${p.sku}: Published input range is "${p.specs.power}" (sample data). Peak transient / surge overvoltage limits beyond this range are not published and require supplier confirmation.`
        : `${p.sku}: Published catalogue value is "${p.specs.power}" only — no numeric maximum supported voltage limit is published in the demonstration catalogue. Maximum voltage cannot be inferred and requires supplier confirmation.`;
    });

    return {
      answer: `Missing voltage limit specification:\n${details.join('\n')}\n\nSource: ${targets.map((p) => p.sku).join(', ')} (sample demonstration data; supplier confirmation required)`,
      matchedSkus: targets.map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 2. Negative test: undocumented regulatory/safety certifications
  if (CERTIFICATION_QUERY_PATTERN.test(query)) {
    const targets = explicitSkus.length > 0 ? explicitSkus : findMatchingProducts(query, catalog);
    const citedDetails =
      targets.length > 0
        ? `\n\nPublished sample enclosure rating only (${targets
            .map((p) => `${p.sku}: ${p.specs.ipRating}`)
            .join('; ')}) — enclosure ingress protection ratings are not regulatory, safety, emissions, or OEM certifications.`
        : '';

    return {
      answer: `Information unavailable in demonstration catalogue: no regulatory, safety, wireless, or OEM certifications (such as FCC, UL, CSA, CE, SAE, FMCSA, or ISO approvals) are documented for ${storefront.brandName} sample products. Request formal compliance documentation from the supplier via RFQ.${citedDetails}`,
      matchedSkus: targets.map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 3. Negative test: harness question when catalogue contains no harness info for target or generically
  if (HARNESS_QUERY_PATTERN.test(query) && !COMPARISON_PATTERN.test(query)) {
    const targets =
      explicitSkus.length > 0
        ? explicitSkus
        : findMatchingProducts(query, catalog, { suppressGenericHarnessBoost: true });

    if (targets.length === 0) {
      return {
        answer:
          'Information unavailable in demonstration catalogue: no vehicle-specific installation harness requirement can be confirmed without a product SKU and vehicle year/make/model/class.\n\nWhere no harness information is published for a product or vehicle in the catalogue, Spec Assist will not assume or substitute a harness. Request a harness pinout check from the supplier via RFQ.',
        matchedSkus: [],
        isFitmentResponse: false,
      };
    }

    const harnessLines = targets.map((p) => {
      const meta = getNormalizedProductMetadata(p);
      if (meta.accessoryRequirements.recommendedSku) {
        return `${p.sku}: ${meta.accessoryRequirements.note} (Note: required vs. optional vehicle-specific harness pinouts are not published in this demo catalogue and require supplier confirmation.)`;
      }
      return `${p.sku}: No installation harness requirement is listed in the demonstration catalogue. ${meta.accessoryRequirements.note}`;
    });

    return {
      answer: `${harnessLines.join('\n')}\n\nSource: ${targets.map((p) => p.sku).join(', ')} (sample demonstration data)`,
      matchedSkus: targets.map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 4. Negative test: universal compatibility / guarantees / unlisted vehicles
  if (
    UNIVERSAL_FITMENT_PATTERN.test(query) &&
    (FITMENT_INTENT_PATTERN.test(query) || VEHICLE_MENTION_PATTERN.test(query))
  ) {
    return {
      answer:
        'Requires confirmation — compatibility cannot be guaranteed across an entire vehicle brand, model family, or for any unlisted vehicle.\n\nIn this demonstration catalogue, compatibility is never inferred from vehicle make, category, or year. Published sample matrix coverage exists only for exact listed combinations (2025 Rivian EDV 700 Commercial EV for AST-104 and AST-640; 2025 Ford Transit 350 Cargo Van is marked Requires Confirmation). Any unlisted vehicle or SKU lacks published compatibility data and requires supplier engineering confirmation via RFQ.',
      matchedSkus: explicitSkus.map((p) => p.sku),
      isFitmentResponse: true,
      isVerifiedFitment: false,
    };
  }

  // 5. Vehicle-specific fitment lookup
  const isFitmentQuery =
    !isSpecOnlyTruckQuery(query) &&
    (FITMENT_INTENT_PATTERN.test(query) || VEHICLE_MENTION_PATTERN.test(query));

  if (isFitmentQuery) {
    const matrixResult = matchesMatrixEntry(query, catalog);
    const mentionedDepot = explicitSkus.find(
      (p) => getNormalizedProductMetadata(p).compatibilityProfile.deploymentEnvironment === 'stationary-depot'
    );

    if (mentionedDepot) {
      const meta = getNormalizedProductMetadata(mentionedDepot);
      return {
        answer: `Not Compatible (for in-vehicle chassis mounting): ${mentionedDepot.name} is stationary depot equipment (${mentionedDepot.specs.interface}), not a vehicle-mounted hardware unit. ${meta.compatibilityProfile.scopeNote}\n\nSource: ${mentionedDepot.sku} (sample demonstration data)`,
        matchedSkus: [mentionedDepot.sku],
        isFitmentResponse: true,
        isVerifiedFitment: false,
      };
    }

    if (matrixResult.entry) {
      const entry = matrixResult.entry;
      const requestedSku = explicitSkus[0]?.sku;
      const evalResult = evaluateVehicleFitment(
        {
          year: entry.year,
          make: entry.make,
          model: entry.model,
          vehicleClass: entry.vehicleClass,
        },
        undefined,
        requestedSku
      );

      if (evalResult.status === 'verified') {
        const verifiedScope = entry.compatibleSkus?.length
          ? entry.compatibleSkus.join(', ')
          : requestedSku || 'listed sample SKUs';
        const targetSku = requestedSku ?? entry.compatibleSkus?.[0] ?? catalog[0].sku;
        const harnessSku = entry.recommendedHarnessSku;
        const citedSkus =
          harnessSku && harnessSku !== targetSku ? [targetSku, harnessSku] : [targetSku];

        return {
          answer: `Verified (sample fitment matrix): ${entry.year} ${entry.make} ${entry.model} (${entry.vehicleClass}) is marked Verified in the sample matrix for ${
            requestedSku ? requestedSku : verifiedScope
          }. ${entry.notes}${
            !requestedSku
              ? ` Note: other SKUs not listed in [${verifiedScope}] remain Requires Confirmation.`
              : ''
          }\n\nSource: ${citedSkus.join(', ')} (sample demonstration matrix — supplier confirmation applies at RFQ)`,
          matchedSkus: citedSkus,
          isFitmentResponse: true,
          isVerifiedFitment: true,
        };
      }

      if (evalResult.status === 'not-compatible') {
        return {
          answer: `Not Compatible: ${evalResult.summaryText}\n\nSource: ${requestedSku ?? 'Sample fitment matrix'}`,
          matchedSkus: requestedSku ? [requestedSku] : [],
          isFitmentResponse: true,
          isVerifiedFitment: false,
        };
      }

      const citedSkus = requestedSku ? [requestedSku] : [];
      return {
        answer: `Requires Confirmation: ${entry.year} ${entry.make} ${entry.model} (${entry.vehicleClass}) — ${evalResult.summaryText} Attach this vehicle group to your quote request for supplier engineering confirmation.\n\nSource: ${citedSkus.length > 0 ? citedSkus.join(', ') : 'Sample fitment matrix'} (sample demonstration data)`,
        matchedSkus: citedSkus,
        isFitmentResponse: true,
        isVerifiedFitment: false,
      };
    }

    return {
      answer: `Requires Confirmation (missing compatibility data): No compatibility record exists for that exact vehicle in the published sample matrix, and compatibility cannot be inferred from similar models or vehicle classes. ${clientConfig.specAssistEscalationText}`,
      matchedSkus: explicitSkus.map((p) => p.sku),
      isFitmentResponse: true,
      isVerifiedFitment: false,
    };
  }

  // 6. Product comparisons
  if (COMPARISON_PATTERN.test(query) || explicitSkus.length >= 2) {
    const compareList =
      explicitSkus.length >= 2
        ? explicitSkus
        : findMatchingProducts(query, catalog).slice(0, 3);

    if (compareList.length < 2) {
      const skuList = catalog.map((p) => p.sku).join(', ');
      return {
        answer: `Specify at least two hardware SKUs or categories to compare from ${storefront.brandName} (${skuList}). Missing specifications (such as certifications, exact surge limits, or unpublished vehicle pinouts) will be flagged for supplier confirmation.`,
        matchedSkus: compareList.map((p) => p.sku),
        isFitmentResponse: false,
      };
    }

    const comparisonBlocks = compareList.map((p) => formatProductDetailLine(p));
    return {
      answer: `Product Comparison (Demonstration Sample Data):\n\n${comparisonBlocks.join(
        '\n\n'
      )}\n\nNote on missing data: Regulatory certifications, OEM authorizations, stock lead times, and vehicle-specific pinout diagrams are not published in this demo and require supplier confirmation at RFQ.\n\nSource: ${compareList
        .map((p) => p.sku)
        .join(', ')}`,
      matchedSkus: compareList.map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 7. Other missing metadata queries (stock, OEM manufacturer, wiring diagrams, environmental limits)
  const matches = findMatchingProducts(query, catalog);
  if (OTHER_UNAVAILABLE_META_PATTERN.test(query)) {
    const citedNote =
      matches.length > 0
        ? `\n\nPublished demonstration record (${matches[0].sku}):\n${formatProductDetailLine(matches[0])}`
        : '';
    return {
      answer: `Information unavailable in demonstration catalogue: live stock availability, authorized OEM manufacturer details, lead times, environmental/dimension sheets, and vehicle-specific wiring pinout diagrams are not published in this demonstration environment. Submit an RFQ to request verified documentation from a supplier.${citedNote}`,
      matchedSkus: matches.slice(0, 1).map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 8. Installation requirements queries
  if (INSTALLATION_QUERY_PATTERN.test(query) && matches.length > 0) {
    const installBlocks = matches.slice(0, 3).map((p) => {
      const meta = getNormalizedProductMetadata(p);
      return `${p.sku} (${p.name}): ${meta.installationRequirements} | Accessories: ${meta.accessoryRequirements.note}`;
    });
    return {
      answer: `Installation Requirements (Sample Demonstration Data):\n${installBlocks.join(
        '\n'
      )}\n\nNote: Step-by-step wiring diagrams and chassis-specific connector pinouts are not published here and require supplier confirmation.\n\nSource: ${matches
        .slice(0, 3)
        .map((p) => p.sku)
        .join(', ')}`,
      matchedSkus: matches.slice(0, 3).map((p) => p.sku),
      isFitmentResponse: false,
    };
  }

  // 9. Standard catalogue specification lookup
  if (matches.length === 0) {
    const skuList = catalog.map((p) => p.sku).join(', ');
    return {
      answer: `No matching hardware was found in the published ${storefront.brandName} demonstration catalogue. Ask about ${skuList}, or query by power input, interface, enclosure rating, product comparison, or vehicle fitment. For unlisted specifications, submit an RFQ for supplier confirmation.`,
      matchedSkus: [],
      isFitmentResponse: false,
    };
  }

  const topMatches = matches.slice(0, 3);
  const lines = topMatches.map((p) => {
    const meta = getNormalizedProductMetadata(p);
    const tier1 = getTier1Price(p);
    const tier2 = p.tiers[1];
    const tier2Text =
      tier2 && tier2.unitPrice !== null ? ` | ${tier2.label}: ${formatCad(tier2.unitPrice)}` : '';
    const accessoryText = meta.accessoryRequirements.recommendedSku
      ? ` | Optional accessory: ${meta.accessoryRequirements.recommendedSku}`
      : ' | Accessories: none listed in demo';
    return `${p.name} (${p.category}): Power ${p.specs.power} | Interface ${p.specs.interface} | Rating ${p.specs.ipRating}${accessoryText} | Sample From ${formatCad(tier1)} / ${p.unitLabel}${tier2Text}\n  Install note: ${meta.installationRequirements}`;
  });

  const citation = `Source: ${topMatches
    .map((p) => p.sku)
    .join(', ')} (demonstration sample data — supplier confirmation required for certifications & vehicle-specific pinouts)`;

  return {
    answer: `${lines.join('\n')}\n\n${citation}`,
    matchedSkus: topMatches.map((p) => p.sku),
    isFitmentResponse: false,
  };
}

import type { FitmentEvaluation, FitmentStatus, PowerSourceOption, VehicleSelection } from '../types/quote';

export interface ProductTier {
  id: string;
  label: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number | null;
  formalQuoteText?: string;
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface CatalogProduct {
  sku: string;
  name: string;
  category: string;
  unitLabel: 'unit' | 'bundle';
  description: string;
  imageUrl: string;
  manufacturer?: string;
  installationNote?: string;
  specs: {
    power: string;
    interface: string;
    ipRating: string;
  };
  fullSpecs: ProductSpecItem[];
  tiers: ProductTier[];
  recommendedHarnessSku?: string;
  keywords: string[];
}

export interface CategoryShowcaseItem {
  category: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface CompatibilityMatrixEntry {
  year: string;
  make: string;
  model: string;
  vehicleClass: string;
  status: FitmentStatus;
  recommendedHarnessSku?: string;
  notes: string;
}

export interface PolicyItem {
  id: string;
  title: string;
  summary: string;
  demoTag: string;
  fullText: string[];
}

export const clientConfig = {
  brand: {
    name: 'Astrateq Gadgets',
    shortMark: 'AG',
    logoUrl: 'https://i.ibb.co/gbf3KGBx/Chat-GPT-Image-Jun-9-2026-07-07-30-PM.png',
    tagline: 'Automotive Technology · Fleet Solutions',
    demoNote: 'Demo catalogue — sample data',
    copyright: '© 2026 Astrateq Gadgets. Demo storefront — sample catalog & fitment data.',
    heroImageUrl: '/src/assets/images/hero_astrateq_sedan_dusk_1795291942896.jpg',
  },
  categoryShowcase: [
    {
      category: 'Video Telematics',
      title: 'Dashcams & Video Telematics',
      subtitle: 'Dual-lens AI dashcams & cabin sensors',
      imageUrl: '/src/assets/images/cat_video_telematics_1795290659913.jpg',
    },
    {
      category: 'Fleet ELD & GPS',
      title: 'Vehicle Diagnostics',
      subtitle: 'J1939 & OBD-II diagnostic gateways',
      imageUrl: '/src/assets/images/cat_fleet_eld_gps_1795290659703.jpg',
    },
    {
      category: 'EV Power & Diagnostics',
      title: 'EV Solutions',
      subtitle: 'Depot OCPP 1.6 charger controllers',
      imageUrl: '/src/assets/images/cat_ev_power_1795290659544.jpg',
    },
    {
      category: 'ADAS Retrofits',
      title: 'Fleet Management',
      subtitle: 'Blind-spot radar & chassis retrofits',
      imageUrl: '/src/assets/images/cat_adas_retrofits_1795290660333.jpg',
    },
    {
      category: 'ADAS Retrofits',
      title: 'Accessories',
      subtitle: 'Sealed wiring harnesses & mounting kits',
      imageUrl: '/src/assets/images/cat_accessories_twilight_1795291942843.jpg',
    },
  ] satisfies CategoryShowcaseItem[],
  theme: {
    background: '#171A1D',
    surface: '#1D2126',
    elevated: '#23282E',
    border: '#2B3138',
    textPrimary: '#F2EFE9',
    textSecondary: '#A7B0BC',
    cyan: '#22D3EE',
    amber: '#F59E0B',
  },
  currency: 'CAD' as const,
  webhookUrl: '',
  categories: [
    'All Hardware',
    'Video Telematics',
    'Fleet ELD & GPS',
    'ADAS Retrofits',
    'EV Power & Diagnostics',
  ] as const,
  catalogHeaderLine: 'Sample demonstration pricing in CAD. Volume allocations (50+ units) require formal supplier quote.',
  fitmentDisclaimer:
    'SAMPLE FITMENT MATRIX DATA. UNLISTED OR CONDITIONAL COMBINATIONS REQUIRE SUPPLIER ENGINEERING CONFIRMATION.',
  specAssistEscalationText:
    'This combination is not yet verified in the published sample catalog data. Attach the vehicle group in the Fitment Finder or include it in your quotation request for supplier confirmation.',
  products: [
    {
      sku: 'AST-104',
      name: 'AST-104 Dual-Lens AI Fleet Dashcam',
      category: 'Video Telematics',
      unitLabel: 'unit',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Requires 12V/24V vehicle power verification; AST-640 harness recommended where pinout applies.',
      description: 'Road-facing and driver-cabin event camera with cellular clip offload.',
      imageUrl: '/src/assets/images/prod_ast104_dashcam_1795290659601.jpg',
      specs: {
        power: '12V/24V',
        interface: '4G LTE · Wi-Fi',
        ipRating: 'IP67',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-104' },
        { label: 'Category', value: 'Video Telematics' },
        { label: 'Power Input', value: '12V/24V' },
        { label: 'Connectivity / Interface', value: '4G LTE · Wi-Fi' },
        { label: 'Ingress Protection', value: 'IP67' },
        { label: 'Pricing Basis', value: 'Per unit (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 349 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 319 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      recommendedHarnessSku: 'AST-640',
      keywords: ['dashcam', 'camera', 'video', 'telematics', '12v', '24v', 'lte', 'wifi', 'ip67', 'class 8', 'truck'],
    },
    {
      sku: 'AST-208',
      name: 'AST-208 J1939 / OBD-II Telematics Gateway',
      category: 'Fleet ELD & GPS',
      unitLabel: 'unit',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Requires OBD-II or J1939 port check; AST-640 harness recommended for heavy-duty pinouts.',
      description: 'Commercial vehicle bus bridge for ELD compliance, fault telemetry, and GPS tracking.',
      imageUrl: '/src/assets/images/prod_ast208_gateway_1795290660444.jpg',
      specs: {
        power: '9–32V DC',
        interface: 'OBD-II / J1939',
        ipRating: 'IP54',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-208' },
        { label: 'Category', value: 'Fleet ELD & GPS' },
        { label: 'Power Input', value: '9–32V DC' },
        { label: 'Vehicle Interface', value: 'OBD-II / J1939' },
        { label: 'Ingress Protection', value: 'IP54' },
        { label: 'Pricing Basis', value: 'Per unit (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 279 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 249 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      recommendedHarnessSku: 'AST-640',
      keywords: ['gateway', 'telematics', 'eld', 'gps', 'j1939', 'obd', 'obd-ii', '9-32v', 'ip54'],
    },
    {
      sku: 'AST-316',
      name: 'AST-316 Blind-Spot Radar Retrofit Kit',
      category: 'ADAS Retrofits',
      unitLabel: 'unit',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Requires 12V/24V CAN & discrete I/O integration; installer coordination recommended.',
      description: 'Side-zone blind-spot detection retrofit kit engineered for commercial chassis.',
      imageUrl: '/src/assets/images/prod_ast316_radar_1795290659543.jpg',
      specs: {
        power: '12V/24V',
        interface: 'CAN · discrete I/O',
        ipRating: 'IP67 sensors',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-316' },
        { label: 'Category', value: 'ADAS Retrofits' },
        { label: 'Power Input', value: '12V/24V' },
        { label: 'Signal Interface', value: 'CAN · discrete I/O' },
        { label: 'Ingress Protection', value: 'IP67 sensors' },
        { label: 'Pricing Basis', value: 'Per unit (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 499 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 459 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      recommendedHarnessSku: 'AST-640',
      keywords: ['radar', 'blind-spot', 'blind spot', 'adas', 'retrofit', 'can', 'discrete', 'ip67', '12v', '24v'],
    },
    {
      sku: 'AST-422',
      name: 'AST-422 EV Fleet Depot Charger Controller',
      category: 'EV Power & Diagnostics',
      unitLabel: 'unit',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Stationary depot controller requiring wide-range DC and wired OCPP 1.6 Ethernet review.',
      description: 'Depot charging controller with OCPP 1.6 session telemetry and wired Ethernet uplink.',
      imageUrl: '/src/assets/images/prod_ast422_ev_controller_1795290660817.jpg',
      specs: {
        power: 'wide-range DC',
        interface: 'OCPP 1.6 · Ethernet',
        ipRating: 'IP65',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-422' },
        { label: 'Category', value: 'EV Power & Diagnostics' },
        { label: 'Power Input', value: 'wide-range DC' },
        { label: 'Control Interface', value: 'OCPP 1.6 · Ethernet' },
        { label: 'Ingress Protection', value: 'IP65' },
        { label: 'Pricing Basis', value: 'Per unit (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 749 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 719 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      keywords: ['ev', 'charger', 'depot', 'controller', 'ocpp', 'ethernet', 'diagnostics', 'ip65', 'dc'],
    },
    {
      sku: 'AST-537',
      name: 'AST-537 Cabin Driver-Fatigue Sensor',
      category: 'Video Telematics',
      unitLabel: 'unit',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Requires 12V/24V cabin mounting & CAN/USB-C check; AST-640 harness optional.',
      description: 'In-cab driver attentiveness and drowsiness alert sensor with CAN bus output.',
      imageUrl: '/src/assets/images/prod_ast537_fatigue_sensor_1795290659283.jpg',
      specs: {
        power: '12V/24V',
        interface: 'CAN · USB-C',
        ipRating: 'IP54',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-537' },
        { label: 'Category', value: 'Video Telematics' },
        { label: 'Power Input', value: '12V/24V' },
        { label: 'Interface', value: 'CAN · USB-C' },
        { label: 'Ingress Protection', value: 'IP54' },
        { label: 'Pricing Basis', value: 'Per unit (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 419 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 389 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      recommendedHarnessSku: 'AST-640',
      keywords: ['fatigue', 'driver', 'cabin', 'sensor', 'video', 'telematics', 'can', 'usb-c', 'ip54', '12v', '24v'],
    },
    {
      sku: 'AST-640',
      name: 'AST-640 Heavy-Duty Wiring Harness Bundle',
      category: 'ADAS Retrofits',
      unitLabel: 'bundle',
      manufacturer: 'Sample catalogue entry (supplier pending)',
      installationNote: 'Vehicle-specific pinout verified against year/make/model prior to dispatch.',
      description: 'Sealed vehicle power and diagnostic interconnect harness bundle for fleet retrofits.',
      imageUrl: '/src/assets/images/prod_ast640_harness_1795290659605.jpg',
      specs: {
        power: '12V/24V rated',
        interface: 'J1939 · OBD-II',
        ipRating: 'IP67 connectors',
      },
      fullSpecs: [
        { label: 'SKU', value: 'AST-640' },
        { label: 'Category', value: 'ADAS Retrofits' },
        { label: 'Power Rating', value: '12V/24V rated' },
        { label: 'Connector Interface', value: 'J1939 · OBD-II' },
        { label: 'Connector Protection', value: 'IP67 connectors' },
        { label: 'Pricing Basis', value: 'Per bundle (CAD)' },
      ],
      tiers: [
        { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 109 },
        { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 99 },
        {
          id: 't3',
          label: '50+ Units',
          minQty: 50,
          maxQty: null,
          unitPrice: null,
          formalQuoteText: 'Subject to formal fleet quote',
        },
      ],
      keywords: ['harness', 'wiring', 'cable', 'bundle', 'j1939', 'obd', 'ip67', 'adas', '12v', '24v'],
    },
  ] satisfies CatalogProduct[],
  fitmentOptions: {
    years: ['2026', '2025', '2024', '2023', '2022', '2021'],
    makes: ['Rivian', 'Ford', 'Freightliner', 'Mercedes-Benz', 'RAM', 'Isuzu'],
    modelsByMake: {
      Rivian: ['EDV 700', 'EDV 500', 'Unlisted / Custom Chassis'],
      Ford: ['Transit 350', 'E-Transit', 'F-550 Chassis', 'Unlisted / Custom Chassis'],
      Freightliner: ['Cascadia', 'M2 106', 'MT45 Step Van', 'Unlisted / Custom Chassis'],
      'Mercedes-Benz': ['Sprinter 2500', 'eSprinter', 'Unlisted / Custom Chassis'],
      RAM: ['ProMaster 3500', '5500 Tradesman', 'Unlisted / Custom Chassis'],
      Isuzu: ['NPR-HD', 'NRR EV', 'Unlisted / Custom Chassis'],
    } as Record<string, string[]>,
    allModelsFallback: ['EDV 700', 'Transit 350', 'Cascadia', 'Sprinter 2500', 'ProMaster 3500', 'NPR-HD', 'Unlisted / Custom Chassis'],
    vehicleClasses: [
      'Commercial EV',
      'Cargo Van',
      'Step Van',
      'Class 8 Tractor',
      'Box Truck',
      'Service Chassis',
    ],
  },
  compatibilityMatrix: [
    {
      year: '2025',
      make: 'Rivian',
      model: 'EDV 700',
      vehicleClass: 'Commercial EV',
      status: 'verified',
      recommendedHarnessSku: 'AST-640',
      notes: 'Published EV Port & CAN telemetry profile confirmed for 2025 Rivian EDV 700.',
    },
    {
      year: '2025',
      make: 'Ford',
      model: 'Transit 350',
      vehicleClass: 'Cargo Van',
      status: 'requires-verification',
      recommendedHarnessSku: 'AST-640',
      notes: 'Upfitter auxiliary connector pinout varies by factory prep package; engineering review required.',
    },
  ] satisfies CompatibilityMatrixEntry[],
  deploymentOptions: {
    powerSources: ['OBD-II', 'J1939', '12V', '24V', 'USB-C', 'EV Port', "I don't know"] as const,
    installationPreferences: ['Self-install', 'Installer required', 'Not sure yet'] as const,
    fleetSizes: ['1–5 vehicles', '6–25 vehicles', '26–100 vehicles', '100+ vehicles'] as const,
    rolloutTimelines: [
      'Immediate (0–30 days)',
      'Next Quarter (30–90 days)',
      '3–6 Months',
      'Planning / Budgeting',
    ] as const,
    provincesAndRegions: [
      'Ontario (ON)',
      'Quebec (QC)',
      'British Columbia (BC)',
      'Alberta (AB)',
      'Manitoba (MB)',
      'Saskatchewan (SK)',
      'Atlantic Canada (NB / NS / PE / NL)',
      'Northern Territories (YT / NT / NU)',
      'United States / International',
    ] as const,
    installationAddon: {
      id: 'SVC-INSTALL',
      label: 'Installation — request installer coordination · subject to formal fleet quote',
      shortLabel: 'Installer coordination service',
      note: 'Scoped during engineering & rollout review; pricing provided on formal fleet quote.',
    },
  },
  processSteps: [
    {
      step: '01',
      title: 'Verify the platform',
      description:
        'Check vehicle year, make, model, and class against published fitment profiles. Any unlisted or unverified combination is flagged for a human engineering check before hardware ships.',
    },
    {
      step: '02',
      title: 'Specify the hardware',
      description:
        'Select dashcams, telematics gateways, ADAS radar retrofits, depot charger controllers, or wiring bundles with transparent CAD pricing tiers across 1–9, 10–49, and 50+ formal fleet quotes.',
    },
    {
      step: '03',
      title: 'Plan the rollout',
      description:
        'Attach every vehicle group with vehicle counts, power source, installation preference, and rollout timeline so our fleet engineering team can issue an accurate formal quote.',
    },
  ],
  policies: [
    {
      id: 'shipping',
      title: 'Shipping & Delivery Policy',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Sample policy structure for commercial freight dispatch and consolidated multi-depot delivery scheduling.',
      fullText: [
        'Demonstration policy placeholder — Shipping & Delivery Policy (supplier configuration required before production use).',
        'In a live supplier deployment, commercial orders confirmed via formal quotation are scheduled for courier or LTL freight dispatch based on unit volume and depot region.',
        'Shipments requiring vehicle pinout or harness confirmation are held until technical compatibility is verified.',
      ],
    },
    {
      id: 'returns-rma',
      title: 'Returns & RMA Policy',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Sample policy structure for unopened commercial hardware returns and structured RMA diagnostic intake.',
      fullText: [
        'Demonstration policy placeholder — Returns & RMA Policy (supplier configuration required before production use).',
        'A supplier RMA workflow typically defines eligibility windows for unopened commercial hardware and sealed harness bundles.',
        'Field-installed sensors and custom-terminated harnesses generally require bench inspection prior to credit or replacement.',
      ],
    },
    {
      id: 'warranty',
      title: 'Warranty Policy',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Sample policy structure for commercial hardware defect coverage conditioned on approved power interfaces.',
      fullText: [
        'Demonstration policy placeholder — Hardware Warranty Policy (supplier configuration required before production use).',
        'No active manufacturer warranty is offered by this demonstration environment.',
        'In a configured supplier storefront, hardware warranty terms apply when units are installed using verified vehicle power and harness specifications.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Explains how fleet contact details and vehicle configurations are stored in this demo intake portal.',
      fullText: [
        'Demonstration policy text — Privacy & Data Handling for Astrateq Gadgets Demo Portal.',
        'Contact details, vehicle groups, and deployment parameters are used to assemble your structured RFQ payload.',
        'Draft quote progress is cached in your browser localStorage, and submitted RFQs are posted to the local demonstration backend (/api/rfq) unless an external supplier webhook is explicitly configured.',
      ],
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Clarifies sample CAD pricing tiers, non-binding demonstration status, and formal quotation requirements.',
      fullText: [
        'Demonstration policy text — Commercial Terms & Conditions.',
        'All hardware pricing shown in this portal represents sample demonstration data in Canadian Dollars (CAD). Final pricing, taxes, freight, and lead times require a formal written supplier quote.',
        'Fitment designations in this demonstration represent sample matrix data and do not constitute an engineering guarantee.',
      ],
    },
    {
      id: 'product-support',
      title: 'Product Support Information',
      demoTag: 'Demo placeholder — supplier config required',
      summary:
        'Sample support intake guidance for vehicle fitment escalation, harness pinout checks, and post-quote assistance.',
      fullText: [
        'Demonstration policy placeholder — Product Support Information (supplier contact & SLA configuration required).',
        'Use the Vehicle Fitment Finder and Spec Assist on this portal to review published sample hardware specs and flag unlisted vehicle combinations.',
        'In a production supplier rollout, dedicated technical support channels and RMA escalation contacts replace these demonstration placeholders.',
      ],
    },
  ] satisfies PolicyItem[],
};

export function getProductBySku(sku: string): CatalogProduct | undefined {
  return clientConfig.products.find((p) => p.sku === sku);
}

export function getTierForQuantity(product: CatalogProduct, quantity: number): ProductTier {
  const safeQty = Math.max(1, Math.floor(quantity) || 1);
  const matched = product.tiers.find(
    (tier) => safeQty >= tier.minQty && (tier.maxQty === null || safeQty <= tier.maxQty)
  );
  return matched ?? product.tiers[0];
}

export function getTier1Price(product: CatalogProduct): number {
  const tier1 = product.tiers[0];
  return tier1?.unitPrice ?? 0;
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString('en-CA')} ${clientConfig.currency}`;
}

export function evaluateVehicleFitment(
  vehicle: VehicleSelection,
  powerSource?: PowerSourceOption
): FitmentEvaluation {
  const normalize = (v: string) => v.trim().toLowerCase();

  const matrixMatch = clientConfig.compatibilityMatrix.find(
    (entry) =>
      normalize(entry.year) === normalize(vehicle.year) &&
      normalize(entry.make) === normalize(vehicle.make) &&
      normalize(entry.model) === normalize(vehicle.model) &&
      normalize(entry.vehicleClass) === normalize(vehicle.vehicleClass)
  );

  // Rule: if power source is "I don't know", downgrade to requires-verification
  if (powerSource === "I don't know") {
    return {
      status: 'requires-verification',
      headlineBadge: 'Requires confirmation',
      summaryText: 'Vehicle power source is unknown — attach this vehicle for supplier confirmation.',
      drawerBadgeText: 'Requires confirmation — power source unknown',
      reason: 'power source unknown',
      recommendedHarnessSku: matrixMatch?.recommendedHarnessSku ?? 'AST-640',
    };
  }

  // Rule: verified ONLY if exact matrix entry is marked "verified"
  if (matrixMatch && matrixMatch.status === 'verified') {
    return {
      status: 'verified',
      headlineBadge: 'Verified',
      summaryText: `${matrixMatch.notes} Sample fitment matrix match — confirm final harness pinout at RFQ.`,
      drawerBadgeText: 'Verified — sample fitment matrix',
      recommendedHarnessSku: matrixMatch.recommendedHarnessSku ?? 'AST-640',
    };
  }

  // Rule: matrix entry explicitly marked requires-verification
  if (matrixMatch && matrixMatch.status === 'requires-verification') {
    return {
      status: 'requires-verification',
      headlineBadge: 'Requires confirmation',
      summaryText: matrixMatch.notes,
      drawerBadgeText: 'Requires confirmation — upfitter pinout varies',
      reason: 'conditional fitment in matrix',
      recommendedHarnessSku: matrixMatch.recommendedHarnessSku ?? 'AST-640',
    };
  }

  // Default with NO matrix entry is ALWAYS not-verified
  return {
    status: 'not-verified',
    headlineBadge: 'Not yet verified',
    summaryText:
      'Not in the published sample fitment matrix. Attach this vehicle group to flag it for supplier engineering confirmation.',
    drawerBadgeText: 'Not yet verified — supplier confirmation required',
    recommendedHarnessSku: 'AST-640',
  };
}

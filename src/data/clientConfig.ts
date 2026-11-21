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
  category:
    | 'Video Telematics'
    | 'Fleet ELD & GPS'
    | 'ADAS Retrofits'
    | 'EV Power & Diagnostics';
  unitLabel: 'unit' | 'bundle';
  description: string;
  imageUrl: string;
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
  category: CatalogProduct['category'] | 'All Hardware';
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
  catalogHeaderLine: 'All prices in CAD. Volume pricing is subject to formal fleet quote.',
  fitmentDisclaimer:
    'FITMENT DATA IS VEHICLE-SPECIFIC. UNLISTED COMBINATIONS REQUIRE ENGINEERING REVIEW. DEMO CATALOGUE — SAMPLE FITMENT DATA.',
  specAssistEscalationText:
    "I can't confirm that fitment from the published catalog data. Unverified fitment is escalated for a technical fitment check — add the vehicle in the fitment checker or include it in your quote request.",
  products: [
    {
      sku: 'AST-104',
      name: 'AST-104 Dual-Lens AI Fleet Dashcam',
      category: 'Video Telematics',
      unitLabel: 'unit',
      description: 'Road-facing and driver-cabin AI event camera with cellular clip offload.',
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
      title: 'Shipping Policy',
      demoTag: 'Sample demo text',
      summary:
        'Sample demo text: Commercial freight dispatch and multi-depot consolidated pallet scheduling from Canadian distribution hubs.',
      fullText: [
        'Sample demo policy text — Shipping Policy for Astrateq Gadgets commercial fleet orders.',
        'Hardware orders confirmed via formal fleet quote are scheduled for ground courier or LTL freight dispatch based on unit count and depot destination across Canada.',
        'Orders requiring engineering or harness verification are held from dispatch until pinout compatibility is signed off by a fleet technician.',
      ],
    },
    {
      id: 'returns-rma',
      title: 'Returns & RMA Policy',
      demoTag: 'Sample demo text',
      summary:
        'Sample demo text: Unopened commercial hardware return window and structured RMA diagnostic intake for fleet accounts.',
      fullText: [
        'Sample demo policy text — Returns & RMA Policy for Astrateq Gadgets.',
        'Unopened, uninstalled units and sealed wiring harness bundles may be submitted for Return Merchandise Authorization within 30 days of commercial delivery.',
        'Custom-terminated harnesses and field-installed sensors are evaluated through standard RMA bench inspection prior to credit or replacement.',
      ],
    },
    {
      id: 'warranty',
      title: 'Warranty Policy',
      demoTag: 'Sample demo text',
      summary:
        'Sample demo text: Commercial hardware coverage against manufacturing defects when installed per approved power specifications.',
      fullText: [
        'Sample demo policy text — Hardware Warranty Policy for Astrateq Gadgets.',
        'Commercial telematics, video, ADAS, and charger controller hardware is covered against defects in materials and workmanship under normal fleet operating conditions.',
        'Coverage applies when units are connected using approved vehicle power interfaces verified during the RFQ engineering review.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      demoTag: 'Sample demo text',
      summary:
        'Sample demo text: Fleet contact and vehicle configuration data handling limited strictly to RFQ preparation and engineering review.',
      fullText: [
        'Sample demo policy text — Privacy Policy for Astrateq Gadgets.',
        'Contact details, fleet vehicle rosters, and deployment timelines submitted through the Quote Engine are used exclusively to prepare formal fleet quotes and technical fitment checks.',
        'In this demo environment, RFQ data stays in your browser local storage unless an optional endpoint webhook is explicitly configured.',
      ],
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      demoTag: 'Sample demo text',
      summary:
        'Sample demo text: Commercial quotation validity, CAD currency terms, and engineering verification contingencies.',
      fullText: [
        'Sample demo policy text — Commercial Terms & Conditions for Astrateq Gadgets.',
        'All published tier pricing is stated in Canadian Dollars (CAD). Volume allocations of 50+ units and multi-site installations are governed by formal written quotation.',
        'Fitment designations in this digital showroom represent sample catalogue data and do not constitute a binding installation warranty until confirmed by formal engineering sign-off.',
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

  // Rule: if power source is "I don't know", downgrade even if matrix marks verified
  if (powerSource === "I don't know") {
    return {
      status: 'requires-verification',
      headlineBadge: 'Requires Engineering / Harness Verification',
      summaryText: 'attach this vehicle for a compatibility review',
      drawerBadgeText: 'Requires engineering / harness verification — power source unknown',
      reason: 'power source unknown',
      recommendedHarnessSku: matrixMatch?.recommendedHarnessSku ?? 'AST-640',
    };
  }

  // Rule: verified ONLY if exact matrix entry is marked "verified"
  if (matrixMatch && matrixMatch.status === 'verified') {
    return {
      status: 'verified',
      headlineBadge: 'Verified Plug-and-Play Fitment',
      summaryText: 'matched to a verified vehicle profile',
      drawerBadgeText: 'Verified fitment',
      recommendedHarnessSku: matrixMatch.recommendedHarnessSku ?? 'AST-640',
    };
  }

  // Default with NO matrix entry or non-verified entry is ALWAYS requires-verification
  return {
    status: 'requires-verification',
    headlineBadge: 'Requires Engineering / Harness Verification',
    summaryText: 'attach this vehicle for a compatibility review',
    drawerBadgeText: 'Requires engineering / harness verification',
    recommendedHarnessSku: matrixMatch?.recommendedHarnessSku ?? 'AST-640',
  };
}

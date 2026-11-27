import { clientConfig, type CatalogProduct, type PolicyItem } from './clientConfig';

export type StorefrontId = 'astrateq' | 'northlink' | 'voltdepot' | 'truenorth';

export interface StorefrontTheme {
  isLight: boolean;
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  bgInput: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentInfo: string;
  accentPrimary: string;
  ctaBg: string;
  ctaHoverBg: string;
  ctaText: string;
  badgeVerifiedBg: string;
  badgeVerifiedBorder: string;
  badgeVerifiedText: string;
  badgeWarnBg: string;
  badgeWarnBorder: string;
  badgeWarnText: string;
  headerBg: string;
  heroScrimClass: string;
}

export interface TrustPillar {
  title: string;
  subtitle: string;
  icon: 'shield' | 'layers' | 'wrench' | 'zap' | 'mappin';
}

export interface StorefrontCategoryCard {
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
}

export interface ProcessStepItem {
  step: string;
  title: string;
  description: string;
}

export interface StorefrontConfig {
  id: StorefrontId;
  badgeNumber: string;
  shortLabel: string;
  roleTitle: string;
  brandName: string;
  brandTitleMain: string;
  brandTitleSub: string;
  logoUrl?: string;
  tagline: string;
  heroHeadlinePrefix: string;
  heroHeadlineHighlight?: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  quoteButtonLabel: string;
  headerActionLabel?: string;
  navLinks: Array<{ label: string; category?: string; href: string; hasDropdown?: boolean }>;
  heroLayout: 'docked-right-finder' | 'corporate-quick-quote' | 'ev-split-finder' | 'upfitter-pillars';
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  categoryViewAllLabel: string;
  categoryCardStyle: 'dark-overlay' | 'light-framed';
  categoryCards: StorefrontCategoryCard[];
  catalogKicker: string;
  catalogTitle: string;
  catalogSubtitle: string;
  demoNote: string;
  categories: string[];
  products: CatalogProduct[];
  recommendedAddonSku: string;
  installationAddonLabel: string;
  installationAddonNote: string;
  defaultCategory: string;
  trustPillars: TrustPillar[];
  processSteps: ProcessStepItem[];
  policies: PolicyItem[];
  specAssistPrompts: string[];
  specAssistPlaceholder: string;
  northlinkOptions?: {
    fleetSizes: string[];
    vehicleTypes: string[];
    trackingRequirements: string[];
    connectivityPreferences: string[];
  };
  upfitLocations?: string[];
  upfitWorkflowOptions?: {
    vehicleUses: string[];
    requiredEquipment: string[];
    installationRequirements: string[];
  };
  chargingOptions?: {
    fleetSizes: string[];
    chargingTypes: string[];
    chargingBays: string[];
    siteConditions: string[];
    electricalServices: string[];
    regions: string[];
  };
  contactInfo: {
    email: string;
    phone: string;
    regionLabel: string;
  };
  theme: StorefrontTheme;
}

const NORTHLINK_PRODUCTS: CatalogProduct[] = [
  {
    sku: 'NLT-101',
    name: 'NLT-101 Ruggedized 4G LTE Fleet GPS Tracker',
    category: 'GPS & Telematics',
    unitLabel: 'unit',
    description:
      'Dual-constellation GNSS and LTE-M cellular vehicle tracker with ignition detection and harsh-event buffering.',
    imageUrl: '/src/assets/images/prod_nlt_gps_tracker_1795294357611.jpg',
    specs: {
      power: '9–36V DC',
      interface: '4G LTE · CAN / GPIO',
      ipRating: 'IP67',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-101' },
      { label: 'Category', value: 'GPS & Telematics' },
      { label: 'Power Input', value: '9–36V DC' },
      { label: 'Connectivity / Interface', value: '4G LTE · CAN / GPIO' },
      { label: 'Ingress Protection', value: 'IP67' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 219 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 189 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'NLT-606',
    keywords: ['gps', 'tracker', 'telematics', 'lte', 'gnss', 'can', 'gpio', 'ip67', '9-36v'],
  },
  {
    sku: 'NLT-204',
    name: 'NLT-204 Cab-Mount ELD Compliance Tablet',
    category: 'ELD & Compliance',
    unitLabel: 'unit',
    description:
      '8-inch locking cab display terminal for driver hours-of-service logging, DVIR inspection checklists, and dispatch messaging.',
    imageUrl: '/src/assets/images/prod_nlt_eld_tablet_1795294357940.jpg',
    specs: {
      power: '12V/24V Dock',
      interface: 'LTE · BT 5.2 · J1939',
      ipRating: 'IP65 front',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-204' },
      { label: 'Category', value: 'ELD & Compliance' },
      { label: 'Power Input', value: '12V/24V Dock' },
      { label: 'Connectivity / Interface', value: 'LTE · BT 5.2 · J1939' },
      { label: 'Ingress Protection', value: 'IP65 front' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 449 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 409 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'NLT-606',
    keywords: ['eld', 'tablet', 'hos', 'dvir', 'compliance', 'cab', 'j1939', 'bluetooth', '12v', '24v'],
  },
  {
    sku: 'NLT-309',
    name: 'NLT-309 Solar Trailer & Container Asset Beacon',
    category: 'Asset & Cold-Chain',
    unitLabel: 'unit',
    description:
      'Self-powered magnetic and bolt-on solar GPS beacon engineered for unpowered trailers, containers, and yellow-iron equipment.',
    imageUrl: '/src/assets/images/prod_nlt_asset_beacon_1795294357862.jpg',
    specs: {
      power: 'Solar + LiFePO4',
      interface: 'LTE-M · BLE 5.0',
      ipRating: 'IP68 / IK09',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-309' },
      { label: 'Category', value: 'Asset & Cold-Chain' },
      { label: 'Power Source', value: 'Solar + LiFePO4' },
      { label: 'Connectivity / Interface', value: 'LTE-M · BLE 5.0' },
      { label: 'Ingress Protection', value: 'IP68 / IK09' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 289 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 259 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['solar', 'trailer', 'asset', 'beacon', 'container', 'lte-m', 'ble', 'ip68', 'tracking'],
  },
  {
    sku: 'NLT-415',
    name: 'NLT-415 5-in-1 Roof MIMO LTE/GNSS Antenna',
    category: 'Connectivity & Harnesses',
    unitLabel: 'unit',
    description:
      'Low-profile roof-mount 2x2 MIMO LTE, 2x2 Wi-Fi, and active GNSS puck antenna with 5m low-loss SMA coaxial pigtails.',
    imageUrl: '/src/assets/images/prod_nlt_mimo_antenna_1795294358201.jpg',
    specs: {
      power: 'Passive / 3.3V LNA',
      interface: '5x SMA · LTE/GNSS',
      ipRating: 'IP67 dome',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-415' },
      { label: 'Category', value: 'Connectivity & Harnesses' },
      { label: 'Power Draw', value: 'Passive / 3.3V LNA' },
      { label: 'RF Connectors', value: '5x SMA · LTE/GNSS' },
      { label: 'Ingress Protection', value: 'IP67 dome' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 179 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 159 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['antenna', 'mimo', 'roof', 'lte', 'gnss', 'sma', 'connectivity', 'ip67'],
  },
  {
    sku: 'NLT-520',
    name: 'NLT-520 Wireless Reefer Temperature & Door Probe',
    category: 'Asset & Cold-Chain',
    unitLabel: 'unit',
    description:
      'Sub-zero BLE cold-chain temperature logger and magnetic rear-door contact sensor pairing directly to NorthLink gateways.',
    imageUrl: '/src/assets/images/prod_nlt_reefer_probe_1795294357797.jpg',
    specs: {
      power: '3.6V Li-SOCl2',
      interface: 'BLE 5.0 · 1-Wire',
      ipRating: 'IP68 food-zone',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-520' },
      { label: 'Category', value: 'Asset & Cold-Chain' },
      { label: 'Battery', value: '3.6V Li-SOCl2' },
      { label: 'Sensor Interface', value: 'BLE 5.0 · 1-Wire' },
      { label: 'Ingress Protection', value: 'IP68 food-zone' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 149 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 129 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['reefer', 'temperature', 'cold-chain', 'door', 'probe', 'sensor', 'ble', 'ip68'],
  },
  {
    sku: 'NLT-606',
    name: 'NLT-606 Universal J1939 / OBD-II Y-Splitter Harness',
    category: 'Connectivity & Harnesses',
    unitLabel: 'bundle',
    description:
      'Concealed dash-mount Y-splitter harness keeping factory diagnostic port accessible for shop scan tools.',
    imageUrl: '/src/assets/images/prod_nlt_obd_harness_1795294357685.jpg',
    specs: {
      power: '12V/24V rated',
      interface: 'J1939 9-pin · OBD-II',
      ipRating: 'IP65 Loom',
    },
    fullSpecs: [
      { label: 'SKU', value: 'NLT-606' },
      { label: 'Category', value: 'Connectivity & Harnesses' },
      { label: 'Power Rating', value: '12V/24V rated' },
      { label: 'Bus Connectors', value: 'J1939 9-pin · OBD-II' },
      { label: 'Protection', value: 'IP65 Loom' },
      { label: 'Pricing Basis', value: 'Per bundle (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 79 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 69 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['harness', 'y-splitter', 'j1939', 'obd', 'obd-ii', 'diagnostic', 'bundle', '12v', '24v'],
  },
];

const VOLTDEPOT_PRODUCTS: CatalogProduct[] = [
  {
    sku: 'VDS-110',
    name: 'VDS-110 Dual-Port 19.2kW Commercial AC Pedestal',
    category: 'AC Depot Chargers',
    unitLabel: 'unit',
    description:
      'Dual SAE J1772 depot charging pedestal with automated cable retractors, RFID access, and OCPP 1.6 uplink.',
    imageUrl: '/src/assets/images/prod_vds_ac_pedestal_1795294370488.jpg',
    specs: {
      power: '208/240V · 80A max',
      interface: 'OCPP 1.6 · LTE/Eth',
      ipRating: 'NEMA 4 / IP65',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-110' },
      { label: 'Category', value: 'AC Depot Chargers' },
      { label: 'Input Service', value: '208/240V · 80A max' },
      { label: 'Control Interface', value: 'OCPP 1.6 · LTE/Eth' },
      { label: 'Enclosure Rating', value: 'NEMA 4 / IP65' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 3490 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 3190 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'VDS-612',
    keywords: ['ac', 'pedestal', 'level 2', '19.2kw', 'j1772', 'ocpp', 'nema 4', 'ip65', 'depot'],
  },
  {
    sku: 'VDS-220',
    name: 'VDS-220 120kW Split-Cabinet Fleet DC Fast Dispenser',
    category: 'DC Fast Charging',
    unitLabel: 'unit',
    description:
      'High-output dual-CCS1 commercial DC fast charger cabinet engineered for rapid midday turnaround of delivery vans and box trucks.',
    imageUrl: '/src/assets/images/prod_vds_dc_fast_1795294371231.jpg',
    specs: {
      power: '480V 3-Phase',
      interface: 'CCS1 · OCPP 1.6/2.0',
      ipRating: 'NEMA 3R / IP54',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-220' },
      { label: 'Category', value: 'DC Fast Charging' },
      { label: 'Electrical Service', value: '480V 3-Phase' },
      { label: 'Connector & Protocol', value: 'CCS1 · OCPP 1.6/2.0' },
      { label: 'Enclosure Rating', value: 'NEMA 3R / IP54' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 38500 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 35900 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'VDS-612',
    keywords: ['dc', 'fast', '120kw', 'ccs1', '480v', '3-phase', 'ocpp', 'dispenser', 'depot'],
  },
  {
    sku: 'VDS-330',
    name: 'VDS-330 OCPP 1.6 Dynamic Site Load Controller',
    category: 'Load & OCPP Control',
    unitLabel: 'unit',
    description:
      'Local edge energy controller balancing EVSE amperage limits dynamically across transformer feeders without costly utility upgrades.',
    imageUrl: '/src/assets/images/prod_vds_load_panel_1795294371529.jpg',
    specs: {
      power: '120/240V AC Aux',
      interface: 'Modbus TCP · OCPP 1.6',
      ipRating: 'IP65 cabinet',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-330' },
      { label: 'Category', value: 'Load & OCPP Control' },
      { label: 'Control Power', value: '120/240V AC Aux' },
      { label: 'Telemetry Interface', value: 'Modbus TCP · OCPP 1.6' },
      { label: 'Enclosure Rating', value: 'IP65 cabinet' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 1899 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 1690 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'VDS-612',
    keywords: ['load', 'controller', 'ocpp', 'modbus', 'energy', 'management', 'panel', 'ip65'],
  },
  {
    sku: 'VDS-440',
    name: 'VDS-440 Weatherproof 11.5kW Fleet Depot Wallbox',
    category: 'AC Depot Chargers',
    unitLabel: 'unit',
    description:
      'Compact wall- or column-mounted 48A Level 2 fleet charger with cold-weather rated cable and scheduled off-peak telemetry.',
    imageUrl: '/src/assets/images/prod_vds_wallbox_1795294371723.jpg',
    specs: {
      power: '240V AC · 48A',
      interface: 'Wi-Fi · Eth · OCPP 1.6',
      ipRating: 'NEMA 4 / IP66',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-440' },
      { label: 'Category', value: 'AC Depot Chargers' },
      { label: 'Electrical Input', value: '240V AC · 48A' },
      { label: 'Connectivity', value: 'Wi-Fi · Eth · OCPP 1.6' },
      { label: 'Enclosure Rating', value: 'NEMA 4 / IP66' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 1290 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 1140 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'VDS-612',
    keywords: ['wallbox', '11.5kw', '48a', 'level 2', 'ac', 'ocpp', 'nema 4', 'ip66'],
  },
  {
    sku: 'VDS-550',
    name: 'VDS-550 Heavy-Duty Steel Pedestal Protection Bollard',
    category: 'Site Infrastructure',
    unitLabel: 'unit',
    description:
      '4.5-inch schedule-40 powder-coated steel crash bollard with reflective collar and galvanized base anchor plate.',
    imageUrl: '/src/assets/images/prod_vds_bollard_1795294374931.jpg',
    specs: {
      power: 'Passive Structural',
      interface: '4-Bolt Surface Mount',
      ipRating: 'Outdoor Powder Coat',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-550' },
      { label: 'Category', value: 'Site Infrastructure' },
      { label: 'Construction', value: '4.5 in Schedule-40 Steel' },
      { label: 'Mounting', value: '4-Bolt Surface Mount' },
      { label: 'Finish', value: 'Outdoor Powder Coat' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 320 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 280 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['bollard', 'steel', 'protection', 'site', 'infrastructure', 'pedestal', 'safety'],
  },
  {
    sku: 'VDS-612',
    name: 'VDS-612 Revenue-Grade CT Sub-Metering Kit',
    category: 'Site Infrastructure',
    unitLabel: 'bundle',
    description:
      'Split-core current transformer metering bundle for monitoring EV panel feeder demand and per-bay energy allocation.',
    imageUrl: '/src/assets/images/prod_vds_ct_metering_1795294374144.jpg',
    specs: {
      power: 'Up to 600V 3-Phase',
      interface: 'RS-485 · Modbus RTU',
      ipRating: 'IP54 DIN Module',
    },
    fullSpecs: [
      { label: 'SKU', value: 'VDS-612' },
      { label: 'Category', value: 'Site Infrastructure' },
      { label: 'Service Voltage', value: 'Up to 600V 3-Phase' },
      { label: 'Telemetry Output', value: 'RS-485 · Modbus RTU' },
      { label: 'Protection', value: 'IP54 DIN Module' },
      { label: 'Pricing Basis', value: 'Per bundle (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 540 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 490 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['ct', 'metering', 'sub-metering', 'modbus', 'rs-485', '600v', '3-phase', 'bundle'],
  },
];

const TRUENORTH_PRODUCTS: CatalogProduct[] = [
  {
    sku: 'TNU-105',
    name: 'TNU-105 Modular Aluminum High-Roof Van Shelving Kit',
    category: 'Storage & Shelving',
    unitLabel: 'bundle',
    description:
      'Extruded aluminum 3-tier cargo shelving system with lockable tool drawers and contour end panels for commercial vans.',
    imageUrl: '/src/assets/images/prod_tnu_shelving_1795294388036.jpg',
    specs: {
      power: 'Mechanical Mount',
      interface: 'Plusnut / Floor Track',
      ipRating: 'Anodized Alloy',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-105' },
      { label: 'Category', value: 'Storage & Shelving' },
      { label: 'Material', value: 'Anodized Aluminum' },
      { label: 'Mounting System', value: 'Plusnut / Floor Track' },
      { label: 'Finish', value: 'Powder-Coat Steel & Alloy' },
      { label: 'Pricing Basis', value: 'Per bundle (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 1480 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 1340 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'TNU-530',
    keywords: ['shelving', 'storage', 'van', 'aluminum', 'drawer', 'upfit', 'cargo'],
  },
  {
    sku: 'TNU-212',
    name: 'TNU-212 Low-Profile Amber/White LED Fleet Lightbar',
    category: 'Lighting & Beacons',
    unitLabel: 'unit',
    description:
      'Weather-sealed dual-color roof strobe and scene work-light bar with programmable flash patterns and cab switch loom.',
    imageUrl: '/src/assets/images/prod_tnu_lightbar_1795294458924.jpg',
    specs: {
      power: '12V/24V DC',
      interface: 'Upfitter Switch Loom',
      ipRating: 'IP68 sealed',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-212' },
      { label: 'Category', value: 'Lighting & Beacons' },
      { label: 'Power Input', value: '12V/24V DC' },
      { label: 'Control Interface', value: 'Upfitter Switch Loom' },
      { label: 'Ingress Protection', value: 'IP68 sealed' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 640 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 580 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    recommendedHarnessSku: 'TNU-530',
    keywords: ['lightbar', 'led', 'amber', 'strobe', 'beacon', 'lighting', '12v', '24v', 'ip68'],
  },
  {
    sku: 'TNU-318',
    name: 'TNU-318 Contoured Steel Cargo Partition Bulkhead',
    category: 'Safety & Partitions',
    unitLabel: 'unit',
    description:
      'Heavy-gauge contoured steel cab-to-cargo divider with perforated visibility screen and slam-latch pass-through door.',
    imageUrl: '/src/assets/images/prod_tnu_bulkhead_1795294459047.jpg',
    specs: {
      power: 'Structural Safety',
      interface: 'OEM B-Pillar Brackets',
      ipRating: '14-Ga Powder Steel',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-318' },
      { label: 'Category', value: 'Safety & Partitions' },
      { label: 'Material', value: '14-Ga Powder Steel' },
      { label: 'Mounting', value: 'OEM B-Pillar Brackets' },
      { label: 'Configuration', value: 'Pass-Through Latch Door' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 890 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 810 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['bulkhead', 'partition', 'steel', 'cargo', 'safety', 'divider', 'van'],
  },
  {
    sku: 'TNU-424',
    name: 'TNU-424 Hydraulic Drop-Down Commercial Ladder Rack',
    category: 'Racks & Power',
    unitLabel: 'unit',
    description:
      'Single-motion gas-strut drop-down aluminum roof rack engineered for curbside ladder loading on high-roof service vans.',
    imageUrl: '/src/assets/images/prod_tnu_ladder_rack_1795294458506.jpg',
    specs: {
      power: 'Gas-Strut Assist',
      interface: 'Roof Track Rail Mount',
      ipRating: 'Marine-Grade Alloy',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-424' },
      { label: 'Category', value: 'Racks & Power' },
      { label: 'Actuation', value: 'Gas-Strut Assist' },
      { label: 'Mounting Interface', value: 'Roof Track Rail Mount' },
      { label: 'Construction', value: 'Marine-Grade Alloy' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 1790 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 1620 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['ladder', 'rack', 'roof', 'carrier', 'hydraulic', 'aluminum', 'van'],
  },
  {
    sku: 'TNU-530',
    name: 'TNU-530 Rear Ultrasonic Park-Assist & Alarm Kit',
    category: 'Safety & Partitions',
    unitLabel: 'bundle',
    description:
      'Four bumper-mount ultrasonic proximity sensors paired with a waterproof backup alarm and cab LED bar.',
    imageUrl: '/src/assets/images/prod_tnu_safety_kit_1795294459564.jpg',
    specs: {
      power: '12V/24V Reverse',
      interface: '4x Ultrasonic · I/O',
      ipRating: 'IP68 sensors',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-530' },
      { label: 'Category', value: 'Safety & Partitions' },
      { label: 'Power Input', value: '12V/24V Reverse' },
      { label: 'Sensor Array', value: '4x Ultrasonic · I/O' },
      { label: 'Ingress Protection', value: 'IP68 sensors' },
      { label: 'Pricing Basis', value: 'Per bundle (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 360 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 325 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['backup', 'alarm', 'ultrasonic', 'parking', 'sensor', 'safety', 'bundle', '12v', '24v', 'ip68'],
  },
  {
    sku: 'TNU-625',
    name: 'TNU-625 3000W Pure Sine Auxiliary Power Inverter Kit',
    category: 'Racks & Power',
    unitLabel: 'unit',
    description:
      'Heavy-duty 12V DC-to-120V AC pure sine inverter with dual GFCI outlets, chassis breaker, and dash-mount remote switch.',
    imageUrl: '/src/assets/images/prod_tnu_power_inverter_1795294458870.jpg',
    specs: {
      power: '12V DC -> 3000W AC',
      interface: 'Dual GFCI · Remote',
      ipRating: 'IP20 Interior Cab',
    },
    fullSpecs: [
      { label: 'SKU', value: 'TNU-625' },
      { label: 'Category', value: 'Racks & Power' },
      { label: 'Power Output', value: '12V DC -> 3000W AC' },
      { label: 'AC Outlets & Control', value: 'Dual GFCI · Remote' },
      { label: 'Protection', value: 'IP20 Interior Cab' },
      { label: 'Pricing Basis', value: 'Per unit (CAD)' },
    ],
    tiers: [
      { id: 't1', label: '1–9 Units', minQty: 1, maxQty: 9, unitPrice: 980 },
      { id: 't2', label: '10–49 Units', minQty: 10, maxQty: 49, unitPrice: 890 },
      {
        id: 't3',
        label: '50+ Units',
        minQty: 50,
        maxQty: null,
        unitPrice: null,
        formalQuoteText: 'Subject to formal fleet quote',
      },
    ],
    keywords: ['inverter', '3000w', 'power', 'pure sine', 'gfci', 'auxiliary', '12v', 'ac'],
  },
];

function buildStorefrontPolicies(brandName: string, scopeSummary: string): PolicyItem[] {
  return [
    {
      id: 'shipping',
      title: 'Shipping Policy',
      demoTag: 'Sample demo text',
      summary: `Sample demo text: Commercial dispatch and multi-site freight scheduling for ${brandName} fleet orders.`,
      fullText: [
        `Sample demo policy text — Shipping Policy for ${brandName} commercial procurement orders.`,
        `${scopeSummary} Dispatch timing and pallet consolidation are confirmed on the formal fleet quote.`,
        'Orders requiring vehicle or site engineering sign-off are scheduled for dispatch once technical specifications are confirmed.',
      ],
    },
    {
      id: 'returns-rma',
      title: 'Returns & RMA Policy',
      demoTag: 'Sample demo text',
      summary: `Sample demo text: Unopened commercial hardware return intake and structured RMA review for ${brandName}.`,
      fullText: [
        `Sample demo policy text — Returns & RMA Policy for ${brandName}.`,
        'Unopened, uninstalled units in original packaging may be submitted for Return Merchandise Authorization within 30 days of commercial delivery.',
        'Field-installed assemblies and custom-length wiring kits undergo bench inspection prior to credit or replacement.',
      ],
    },
    {
      id: 'warranty',
      title: 'Warranty Policy',
      demoTag: 'Sample demo text',
      summary: `Sample demo text: Hardware coverage terms when installed per published electrical and mounting specs.`,
      fullText: [
        `Sample demo policy text — Hardware Warranty Policy for ${brandName}.`,
        'Demonstration hardware entries illustrate coverage against material and workmanship defects under commercial fleet service.',
        'Coverage terms depend on adhering to published voltage, enclosure, and installation requirements.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      demoTag: 'Sample demo text',
      summary: `Sample demo text: Procurement contact, site, and vehicle data retained strictly for RFQ intake and engineering review.`,
      fullText: [
        `Sample demo policy text — Privacy Policy for ${brandName}.`,
        'Contact details, deployment parameters, and vehicle groups submitted via the Quote Engine are persisted to the RFQ backend strictly for demonstration quotation review.',
        'No consumer payment details are collected on this B2B quote platform.',
      ],
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      demoTag: 'Sample demo text',
      summary: `Sample demo text: Demonstration CAD pricing tiers, 50+ formal fleet quote terms, and engineering verification.`,
      fullText: [
        `Sample demo policy text — Commercial Terms & Conditions for ${brandName}.`,
        'All published demonstration prices are stated in Canadian Dollars (CAD). Volume allocations of 50+ units are subject to formal fleet quote.',
        'Catalogue specifications and pricing in this showroom represent sample demonstration data and do not constitute a binding commercial offer or certification.',
      ],
    },
  ];
}

export const STOREFRONTS: Record<StorefrontId, StorefrontConfig> = {
  astrateq: {
    id: 'astrateq',
    badgeNumber: '01',
    shortLabel: 'Astrateq Gadgets',
    roleTitle: 'B2B Fleet Quote Intake Portal (Demo)',
    brandName: 'Astrateq Gadgets',
    brandTitleMain: 'ASTRATEQ',
    brandTitleSub: 'GADGETS',
    logoUrl: 'https://i.ibb.co/gbf3KGBx/Chat-GPT-Image-Jun-9-2026-07-07-30-PM.png',
    tagline: 'B2B Fleet Quote Intake Portal · Demonstration Storefront',
    heroHeadlinePrefix: 'Fleet Technology.',
    heroHeadlineHighlight: 'Configured for Your Vehicles.',
    heroSubtitle:
      'Explore fleet hardware, review technical specifications, identify deployment requirements and submit a structured quotation request for your operation.',
    heroImageUrl: '/src/assets/images/hero_astrateq_sedan_dusk_1795291942896.jpg',
    heroImageAlt:
      'Commercial sedan on dusk highway representing fleet hardware deployment environments',
    primaryCtaLabel: 'Explore Fleet Hardware',
    secondaryCtaLabel: 'Request a Fleet Quote',
    quoteButtonLabel: 'Quote List',
    navLinks: [
      { label: 'Hardware', category: 'All Hardware', href: '#hardware', hasDropdown: true },
      { label: 'Fitment', href: '#fitment', hasDropdown: false },
      { label: 'Spec Assist', href: '#spec-assist', hasDropdown: false },
      { label: 'Policies & Support', href: '#policies', hasDropdown: false },
    ],
    heroLayout: 'docked-right-finder',
    categorySectionTitle: 'Browse Fleet Hardware Categories',
    categorySectionSubtitle: 'Sample demonstration categories — select a focus area to filter SKUs.',
    categoryViewAllLabel: 'View All Categories',
    categoryCardStyle: 'dark-overlay',
    categoryCards: [
      {
        title: 'Dashcams & Video Telematics',
        subtitle: 'Dual-lens dashcams & cabin sensors',
        category: 'Video Telematics',
        imageUrl: '/src/assets/images/cat_video_telematics_1795290659913.jpg',
      },
      {
        title: 'Vehicle Diagnostics',
        subtitle: 'J1939 & OBD-II diagnostic gateways',
        category: 'Fleet ELD & GPS',
        imageUrl: '/src/assets/images/cat_fleet_eld_gps_1795290659703.jpg',
      },
      {
        title: 'EV Solutions',
        subtitle: 'Depot OCPP 1.6 charger controllers',
        category: 'EV Power & Diagnostics',
        imageUrl: '/src/assets/images/cat_ev_power_1795290659544.jpg',
      },
      {
        title: 'Fleet Management',
        subtitle: 'Blind-spot radar & chassis retrofits',
        category: 'ADAS Retrofits',
        imageUrl: '/src/assets/images/cat_adas_retrofits_1795290660333.jpg',
      },
      {
        title: 'Accessories',
        subtitle: 'Sealed wiring harnesses & mounting kits',
        category: 'ADAS Retrofits',
        imageUrl: '/src/assets/images/cat_accessories_twilight_1795291942843.jpg',
      },
    ],
    catalogKicker: '02 · Hardware Catalog',
    catalogTitle: 'Commercial Fleet Hardware',
    catalogSubtitle:
      'Sample CAD tier pricing for demonstration. Final pricing, availability, and compatibility require supplier confirmation.',
    demoNote: 'Demonstration environment — sample catalogue & fitment data',
    categories: [...clientConfig.categories],
    products: clientConfig.products,
    recommendedAddonSku: 'AST-640',
    installationAddonLabel: clientConfig.deploymentOptions.installationAddon.label,
    installationAddonNote: clientConfig.deploymentOptions.installationAddon.note,
    defaultCategory: 'All Hardware',
    trustPillars: [
      {
        title: 'Explicit Fitment States',
        subtitle: 'Verified, conditional, or unverified',
        icon: 'shield',
      },
      {
        title: 'Structured CAD Tiers',
        subtitle: 'Sample 1–9, 10–49 & 50+ quotes',
        icon: 'layers',
      },
      {
        title: 'Deployment Qualification',
        subtitle: 'Vehicle groups, power & harness notes',
        icon: 'wrench',
      },
    ],
    processSteps: clientConfig.processSteps,
    policies: clientConfig.policies,
    specAssistPrompts: [
      'Which dashcams support 24V Class 8 trucks?',
      'Is AST-104 verified for 2025 Rivian EDV 700 Commercial EV?',
      'Does AST-208 fit a 2025 Ford Transit 350 Cargo Van?',
      'What EV charger controllers and harnesses are in the catalog?',
    ],
    specAssistPlaceholder: 'Ask about 24V dashcams, J1939 gateways, or vehicle fitment...',
    contactInfo: {
      email: 'Demo placeholder — supplier contact email pending configuration (RFQs route server-side)',
      phone: 'Demo placeholder — supplier phone pending configuration',
      regionLabel: 'Demo Storefront · Supplier address & distribution hub pending configuration',
    },
    theme: {
      isLight: false,
      bgCanvas: '#090E16',
      bgSurface: '#0F1622',
      bgElevated: '#151E2D',
      bgInput: '#0B111B',
      border: '#1D293B',
      borderStrong: '#2A3950',
      textPrimary: '#F3F6FA',
      textSecondary: '#9FB0C4',
      textMuted: '#A8B3BF',
      accentInfo: '#22D3EE',
      accentPrimary: '#F59E0B',
      ctaBg: '#F59E0B',
      ctaHoverBg: '#FBBF24',
      ctaText: '#090E16',
      badgeVerifiedBg: 'rgba(34, 211, 238, 0.12)',
      badgeVerifiedBorder: 'rgba(34, 211, 238, 0.45)',
      badgeVerifiedText: '#22D3EE',
      badgeWarnBg: 'rgba(245, 158, 11, 0.12)',
      badgeWarnBorder: 'rgba(245, 158, 11, 0.45)',
      badgeWarnText: '#F59E0B',
      headerBg: 'rgba(8, 13, 21, 0.96)',
      heroScrimClass:
        'bg-gradient-to-r from-[#060B13]/85 via-[#060B13]/40 via-28% to-transparent',
    },
  },

  northlink: {
    id: 'northlink',
    badgeNumber: '02',
    shortLabel: 'NorthLink Telematics',
    roleTitle: 'Corporate Procurement',
    brandName: 'NorthLink Telematics',
    brandTitleMain: 'NorthLink',
    brandTitleSub: 'TELEMATICS',
    tagline: 'FLEET TELEMATICS & CONNECTIVITY PROCUREMENT',
    heroHeadlinePrefix: 'Smarter Fleet',
    heroHeadlineHighlight: 'Management Starts Here.',
    heroSubtitle:
      'GPS trackers, cab ELD terminals, cold-chain beacons, and fleet connectivity hardware configured for enterprise rollouts.',
    heroImageUrl: '/src/assets/images/hero_northlink_fleet_1795291341250.jpg',
    heroImageAlt: 'White commercial transit cargo vans parked outside corporate logistics hub',
    primaryCtaLabel: 'Browse Products',
    secondaryCtaLabel: 'Request a Fleet Quote',
    quoteButtonLabel: 'Quote List',
    headerActionLabel: 'Request A Quote',
    navLinks: [
      { label: 'Products', category: 'All Hardware', href: '#hardware', hasDropdown: true },
      { label: 'Fleet Solutions', category: 'GPS & Telematics', href: '#fitment', hasDropdown: true },
      { label: 'Support', href: '#spec-assist', hasDropdown: true },
      { label: 'About', href: '#policies', hasDropdown: true },
    ],
    heroLayout: 'corporate-quick-quote',
    categorySectionTitle: 'Telematics & Connectivity Categories',
    categorySectionSubtitle: 'Sample demonstration hardware across GPS tracking, ELD compliance, cold-chain, and RF harnesses.',
    categoryViewAllLabel: 'View All Solutions',
    categoryCardStyle: 'light-framed',
    categoryCards: [
      {
        title: 'GPS & Telematics',
        subtitle: 'NLT-101 rugged LTE vehicle trackers',
        category: 'GPS & Telematics',
        imageUrl: '/src/assets/images/prod_nlt_gps_tracker_1795294357611.jpg',
      },
      {
        title: 'ELD & Compliance',
        subtitle: 'Cab-mount HOS & DVIR terminals',
        category: 'ELD & Compliance',
        imageUrl: '/src/assets/images/prod_nlt_eld_tablet_1795294357940.jpg',
      },
      {
        title: 'Asset & Cold-Chain',
        subtitle: 'Solar beacons & BLE reefer probes',
        category: 'Asset & Cold-Chain',
        imageUrl: '/src/assets/images/prod_nlt_asset_beacon_1795294357862.jpg',
      },
      {
        title: 'Connectivity & Harnesses',
        subtitle: '5-in-1 MIMO antennas & Y-splitters',
        category: 'Connectivity & Harnesses',
        imageUrl: '/src/assets/images/prod_nlt_mimo_antenna_1795294358201.jpg',
      },
    ],
    catalogKicker: '02 · Telematics Procurement Catalogue',
    catalogTitle: 'Fleet Tracking, ELD & Connectivity Hardware',
    catalogSubtitle:
      'Demo catalogue — sample data in CAD across 1–9, 10–49, and 50+ formal fleet quote tiers.',
    demoNote: 'Demo catalogue — sample pricing',
    categories: [
      'All Hardware',
      'GPS & Telematics',
      'ELD & Compliance',
      'Asset & Cold-Chain',
      'Connectivity & Harnesses',
    ],
    products: NORTHLINK_PRODUCTS,
    recommendedAddonSku: 'NLT-606',
    installationAddonLabel:
      'Telematics commissioning & Y-harness install coordination — subject to formal fleet quote',
    installationAddonNote:
      'Includes APN/connectivity provisioning review and OBD/J1939 port allocation planning.',
    defaultCategory: 'All Hardware',
    trustPillars: [
      {
        title: 'Multi-Chassis Telemetry',
        subtitle: 'J1939, OBD-II & unpowered assets',
        icon: 'layers',
      },
      {
        title: 'Transparent CAD Tiers',
        subtitle: '1–9, 10–49 & 50+ formal RFQ',
        icon: 'shield',
      },
      {
        title: 'Procurement Intake',
        subtitle: 'Connectivity & tracking scoping',
        icon: 'wrench',
      },
    ],
    northlinkOptions: {
      fleetSizes: ['1–5 vehicles', '6–25 vehicles', '26–100 vehicles', '100+ vehicles'],
      vehicleTypes: [
        'Mixed Vans & Light Commercial',
        'Heavy Class 8 Tractors (J1939)',
        'Refrigerated Trailers & Containers',
        'Municipal / Utility Fleet',
      ],
      trackingRequirements: [
        'Real-Time GPS & Trip Telemetry',
        'ELD Hours-of-Service & DVIR Compliance',
        'Cold-Chain Temperature & Trailer Tracking',
        'Full Fleet Telematics + Asset Beacons',
      ],
      connectivityPreferences: [
        '4G LTE-M Multi-Carrier SIM',
        'Dual-Modem Cellular + Roof MIMO',
        'BLE Sensor + Gateway Bridge',
        'Customer-Supplied Enterprise APN',
      ],
    },
    processSteps: [
      {
        step: '01',
        title: 'Profile fleet & connectivity',
        description:
          'Specify fleet size, vehicle classes, tracking objectives, and cellular/BLE connectivity preferences in the procurement bar or Quote Drawer.',
      },
      {
        step: '02',
        title: 'Select telematics SKUs',
        description:
          'Combine NLT-101 GPS trackers, NLT-204 ELD terminals, cold-chain probes, and NLT-606 harnesses with clear CAD tier pricing.',
      },
      {
        step: '03',
        title: 'Submit enterprise RFQ',
        description:
          'Persist your structured telematics deployment, vehicle groups, and procurement contact details directly to the NorthLink RFQ intake API.',
      },
    ],
    policies: buildStorefrontPolicies(
      'NorthLink Telematics',
      'Telematics kits and pre-terminated Y-splitters ship consolidated by terminal location.'
    ),
    specAssistPrompts: [
      'Which hardware supports 4G LTE GPS tracking and CAN telemetry?',
      'What cold-chain sensors and trailer beacons are in the catalog?',
      'Compare NLT-204 ELD tablet and NLT-606 Y-splitter specs and CAD pricing.',
      'Does NLT-101 fit a Toyota Hiace?',
    ],
    specAssistPlaceholder: 'Ask about NLT-101 GPS trackers, ELD tablets, MIMO antennas, or reefer probes...',
    contactInfo: {
      email: 'procurement@northlinktelematics.example',
      phone: '+1 (888) 555-0142',
      regionLabel: 'Ottawa & Toronto · Corporate Fleet Accounts',
    },
    theme: {
      isLight: true,
      bgCanvas: '#F4F7FA',
      bgSurface: '#FFFFFF',
      bgElevated: '#EEF2F7',
      bgInput: '#FFFFFF',
      border: '#DCE3EC',
      borderStrong: '#CBD5E1',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#526075',
      accentInfo: '#1E3A5F',
      accentPrimary: '#1E3A5F',
      ctaBg: '#F59E0B',
      ctaHoverBg: '#FBBF24',
      ctaText: '#090E16',
      badgeVerifiedBg: 'rgba(15, 23, 42, 0.08)',
      badgeVerifiedBorder: 'rgba(30, 58, 95, 0.28)',
      badgeVerifiedText: '#1E3A5F',
      badgeWarnBg: 'rgba(217, 119, 6, 0.10)',
      badgeWarnBorder: 'rgba(217, 119, 6, 0.38)',
      badgeWarnText: '#B45309',
      headerBg: 'rgba(255, 255, 255, 0.96)',
      heroScrimClass:
        'bg-gradient-to-r from-[#F4F7FA]/75 via-[#F4F7FA]/25 via-22% to-transparent',
    },
  },

  voltdepot: {
    id: 'voltdepot',
    badgeNumber: '03',
    shortLabel: 'VoltDepot Systems',
    roleTitle: 'EV Fleet Charging Specialist',
    brandName: 'VoltDepot Systems',
    brandTitleMain: 'VoltDepot',
    brandTitleSub: 'SYSTEMS',
    tagline: 'EV DEPOT CHARGING & ELECTRICAL INFRASTRUCTURE',
    heroHeadlinePrefix: "Power Your Fleet's",
    heroHeadlineHighlight: 'Electric Future.',
    heroSubtitle:
      'Commercial AC pedestals, 120kW DC fast dispensers, OCPP load controllers, and depot electrical infrastructure.',
    heroImageUrl: '/src/assets/images/hero_voltdepot_ev_1795291341447.jpg',
    heroImageAlt: 'Electric commercial delivery vans charging at dark industrial depot pedestals',
    primaryCtaLabel: 'Explore Charging Solutions',
    secondaryCtaLabel: 'Request a Fleet Quote',
    quoteButtonLabel: 'Quote List',
    headerActionLabel: 'Get a Quote',
    navLinks: [
      { label: 'Charging Solutions', category: 'AC Depot Chargers', href: '#hardware', hasDropdown: true },
      { label: 'Site Finder', href: '#charging-finder', hasDropdown: true },
      { label: 'Support', href: '#spec-assist', hasDropdown: true },
      { label: 'Contact', href: '#policies', hasDropdown: false },
    ],
    heroLayout: 'ev-split-finder',
    categorySectionTitle: 'Depot Charging & Electrical Categories',
    categorySectionSubtitle: 'Sample demonstration EVSE pedestals, DC fast dispensers, load controllers, and site protection.',
    categoryViewAllLabel: 'View All Solutions',
    categoryCardStyle: 'dark-overlay',
    categoryCards: [
      {
        title: 'AC Depot Chargers',
        subtitle: '19.2kW pedestals & 11.5kW wallboxes',
        category: 'AC Depot Chargers',
        imageUrl: '/src/assets/images/prod_vds_ac_pedestal_1795294370488.jpg',
      },
      {
        title: 'DC Fast Charging',
        subtitle: '120kW 480V 3-phase CCS1 cabinets',
        category: 'DC Fast Charging',
        imageUrl: '/src/assets/images/prod_vds_dc_fast_1795294371231.jpg',
      },
      {
        title: 'Load & OCPP Control',
        subtitle: 'Dynamic feeder load balancing panels',
        category: 'Load & OCPP Control',
        imageUrl: '/src/assets/images/prod_vds_load_panel_1795294371529.jpg',
      },
      {
        title: 'Site Infrastructure',
        subtitle: 'Crash bollards & 600V CT sub-metering',
        category: 'Site Infrastructure',
        imageUrl: '/src/assets/images/prod_vds_ct_metering_1795294374144.jpg',
      },
    ],
    catalogKicker: '02 · EV Infrastructure Catalogue',
    catalogTitle: 'EV Depot Chargers & Electrical Hardware',
    catalogSubtitle:
      'Demo catalogue — sample pricing in CAD for commercial charging bays and OCPP load infrastructure.',
    demoNote: 'Demo catalogue — sample pricing',
    categories: [
      'All Hardware',
      'AC Depot Chargers',
      'DC Fast Charging',
      'Load & OCPP Control',
      'Site Infrastructure',
    ],
    products: VOLTDEPOT_PRODUCTS,
    recommendedAddonSku: 'VDS-612',
    installationAddonLabel:
      'Depot electrical site survey & EVSE commissioning coordination — subject to formal fleet quote',
    installationAddonNote:
      'Coordinates transformer capacity review, conduit civil scope, and OCPP endpoint testing.',
    defaultCategory: 'All Hardware',
    trustPillars: [
      {
        title: 'AC & DC Depot Hardware',
        subtitle: '11.5kW wallboxes to 120kW DC',
        icon: 'zap',
      },
      {
        title: 'OCPP Load Management',
        subtitle: 'Feeder-aware amperage sharing',
        icon: 'layers',
      },
      {
        title: 'Site Electrical Scoping',
        subtitle: 'Panel service & bay engineering',
        icon: 'shield',
      },
    ],
    chargingOptions: {
      fleetSizes: ['1–5 EVs', '6–25 EVs', '26–100 EVs', '100+ EVs'],
      chargingTypes: [
        'Overnight AC Level 2 (11.5–19.2kW)',
        'High-Power DC Fast Charging (120kW)',
        'Mixed AC Overnight + DC Opportunity',
        'Dynamic Load-Managed AC Depot',
      ],
      chargingBays: ['1–4 Charging Bays', '5–12 Charging Bays', '13–30 Charging Bays', '30+ Multi-Row Depot'],
      siteConditions: [
        'Outdoor Surface Lot (Cold Climate)',
        'Indoor Heated Fleet Garage',
        'Covered Loading Dock / Canopy',
        'Greenfield Yard Civil Prep Needed',
      ],
      electricalServices: [
        '208V / 240V Single-Phase Available',
        '480V 3-Phase Commercial Service',
        '600V 3-Phase Canadian Industrial',
        'Requires Utility Capacity Assessment',
      ],
      regions: ['Ontario & Quebec', 'Western Canada', 'Atlantic Canada', 'Multi-Province'],
    },
    processSteps: [
      {
        step: '01',
        title: 'Capture site & bay scope',
        description:
          'Define charging bay count, AC/DC duty cycle, indoor or outdoor site conditions, and available 208V/480V/600V electrical service.',
      },
      {
        step: '02',
        title: 'Select EVSE & load gear',
        description:
          'Configure pedestals, DC fast cabinets, VDS-330 OCPP load controllers, bollards, and CT sub-metering bundles in CAD.',
      },
      {
        step: '03',
        title: 'Review electrical RFQ',
        description:
          'Submit depot infrastructure quantities and electrical constraints to the VoltDepot backend for formal site engineering quotation.',
      },
    ],
    policies: buildStorefrontPolicies(
      'VoltDepot Systems',
      'Pedestals, DC fast cabinets, and load panels ship via LTL liftgate freight coordinated with site readiness.'
    ),
    specAssistPrompts: [
      'Which chargers require 480V 3-phase service vs 240V AC?',
      'What OCPP 1.6 load management and CT metering kits are available?',
      'Show sample CAD pricing tiers for VDS-110 dual-port AC pedestals.',
      'Does VDS-220 fit a 2025 Rivian EDV 700 Commercial EV?',
    ],
    specAssistPlaceholder: 'Ask about VDS-110 AC pedestals, 120kW DC fast charging, 600V CT kits...',
    contactInfo: {
      email: 'ev-engineering@voltdepotsystems.example',
      phone: '+1 (604) 555-0174',
      regionLabel: 'Vancouver & Mississauga · EV Depot Systems',
    },
    theme: {
      isLight: false,
      bgCanvas: '#0B100E',
      bgSurface: '#121A17',
      bgElevated: '#18231F',
      bgInput: '#090E0C',
      border: '#21332C',
      borderStrong: '#2E463D',
      textPrimary: '#F1F5F2',
      textSecondary: '#A3B5AC',
      textMuted: '#72877D',
      accentInfo: '#38BDF8',
      accentPrimary: '#84CC16',
      ctaBg: '#84CC16',
      ctaHoverBg: '#A3E635',
      ctaText: '#0B120F',
      badgeVerifiedBg: 'rgba(132, 204, 22, 0.14)',
      badgeVerifiedBorder: 'rgba(132, 204, 22, 0.45)',
      badgeVerifiedText: '#A3E635',
      badgeWarnBg: 'rgba(245, 158, 11, 0.12)',
      badgeWarnBorder: 'rgba(245, 158, 11, 0.45)',
      badgeWarnText: '#FBBF24',
      headerBg: 'rgba(11, 17, 15, 0.96)',
      heroScrimClass:
        'bg-gradient-to-r from-[#080E0C]/78 via-[#080E0C]/35 via-28% to-transparent',
    },
  },

  truenorth: {
    id: 'truenorth',
    badgeNumber: '04',
    shortLabel: 'TrueNorth Upfitting',
    roleTitle: 'Multi-Location Upfitter Network',
    brandName: 'TrueNorth Upfitting',
    brandTitleMain: 'TrueNorth',
    brandTitleSub: 'UPFITTING',
    tagline: 'COMMERCIAL VEHICLE UPFITTING',
    heroHeadlinePrefix: 'Equip. Enhance.',
    heroHeadlineHighlight: 'Go Further.',
    heroSubtitle:
      'Modular van shelving, safety bulkheads, amber LED lightbars, drop-down ladder racks, and auxiliary power built for Canadian trades.',
    heroImageUrl: '/src/assets/images/hero_truenorth_upfit_clean_1795291357134.jpg',
    heroImageAlt: 'Commercial utility service pickup truck with ladder rack at industrial depot at sunset',
    primaryCtaLabel: 'Browse Upfit Solutions',
    secondaryCtaLabel: 'Request a Quote',
    quoteButtonLabel: 'Quote List',
    headerActionLabel: 'Find a Location',
    navLinks: [
      { label: 'Upfit Solutions', category: 'Storage & Shelving', href: '#hardware', hasDropdown: true },
      { label: 'Locations', href: '#locations', hasDropdown: true },
      { label: 'Support', href: '#spec-assist', hasDropdown: true },
      { label: 'About', href: '#policies', hasDropdown: true },
    ],
    heroLayout: 'upfitter-pillars',
    categorySectionTitle: 'Commercial Upfitting Categories',
    categorySectionSubtitle: 'Sample demonstration shelving, beacons, partitions, racks, and auxiliary power hardware.',
    categoryViewAllLabel: 'View All Equipment',
    categoryCardStyle: 'dark-overlay',
    categoryCards: [
      {
        title: 'Storage & Shelving',
        subtitle: 'Modular aluminum van shelving & drawers',
        category: 'Storage & Shelving',
        imageUrl: '/src/assets/images/prod_tnu_shelving_1795294388036.jpg',
      },
      {
        title: 'Lighting & Beacons',
        subtitle: 'Amber/white LED roof strobe lightbars',
        category: 'Lighting & Beacons',
        imageUrl: '/src/assets/images/prod_tnu_lightbar_1795294458924.jpg',
      },
      {
        title: 'Safety & Partitions',
        subtitle: 'Steel bulkheads & rear park-assist kits',
        category: 'Safety & Partitions',
        imageUrl: '/src/assets/images/prod_tnu_bulkhead_1795294459047.jpg',
      },
      {
        title: 'Racks & Power',
        subtitle: 'Drop-down ladder racks & 3000W inverters',
        category: 'Racks & Power',
        imageUrl: '/src/assets/images/prod_tnu_ladder_rack_1795294458506.jpg',
      },
    ],
    catalogKicker: '02 · Upfitting Equipment Catalogue',
    catalogTitle: 'Commercial Upfitting, Lighting & Storage Hardware',
    catalogSubtitle:
      'Demo catalogue — sample pricing in CAD for shelving packages, safety partitions, lighting, and auxiliary power.',
    demoNote: 'Demo catalogue — sample pricing',
    categories: [
      'All Hardware',
      'Storage & Shelving',
      'Lighting & Beacons',
      'Safety & Partitions',
      'Racks & Power',
    ],
    products: TRUENORTH_PRODUCTS,
    recommendedAddonSku: 'TNU-530',
    installationAddonLabel:
      'Multi-bay upfitting installation scheduling — subject to formal fleet quote',
    installationAddonNote:
      'Covers shop bay booking across Toronto, Calgary, Vancouver, or Montreal hubs.',
    defaultCategory: 'All Hardware',
    trustPillars: [
      {
        title: 'Multiple Locations',
        subtitle: 'Canadian regional bays',
        icon: 'mappin',
      },
      {
        title: 'Bay-Ready Upfit Kits',
        subtitle: 'Shelving, racks & safety gear',
        icon: 'wrench',
      },
      {
        title: 'Fleet Pricing',
        subtitle: 'Sample CAD volume tiers',
        icon: 'layers',
      },
    ],
    upfitLocations: [
      'Toronto / GTA Upfit Hub (ON)',
      'Calgary Commercial Bay (AB)',
      'Vancouver / Burnaby Depot (BC)',
      'Montreal / Laval Center (QC)',
      'Multi-Location National Rollout',
    ],
    upfitWorkflowOptions: {
      vehicleUses: [
        'Electrical / HVAC Trade Service Van',
        'Telecom & Utility Line Truck',
        'Municipal Public Works & Snow/Roadside',
        'Last-Mile Parcel & Cargo Delivery',
      ],
      requiredEquipment: [
        'Interior Shelving + Safety Bulkhead',
        'Roof Ladder Rack + LED Strobe Lightbar',
        'Full Trade Package (Storage + Lighting + Inverter)',
        'Rear Safety Sensors & Aux Power Retrofit',
      ],
      installationRequirements: [
        'Full Upfitter Bay Installation at Selected Hub',
        'Ship Knocked-Down Kits for Fleet Shop Install',
        'Drop-Ship to Dealer / Bailment Pool',
        'Multi-Hub Phased Rollout Schedule',
      ],
    },
    processSteps: [
      {
        step: '01',
        title: 'Select hub, chassis & trade',
        description:
          'Choose your Canadian installation hub, specify vehicle make/model/use, and identify the required equipment bundle.',
      },
      {
        step: '02',
        title: 'Configure upfitting SKUs',
        description:
          'Add modular aluminum shelving, contoured steel bulkheads, amber LED lightbars, drop-down racks, and 3000W inverters.',
      },
      {
        step: '03',
        title: 'Schedule bay RFQ',
        description:
          'Submit your vehicle groups and installation scope to reserve bay engineering review via the TrueNorth RFQ API.',
      },
    ],
    policies: buildStorefrontPolicies(
      'TrueNorth Upfitting',
      'Upfitting kits are staged at regional Canadian bays or palletized for fleet shop delivery.'
    ),
    specAssistPrompts: [
      'What storage shelving and safety partitions are in the catalog?',
      'Which 12V/24V lighting and rear safety kits support utility trucks?',
      'Show specs and CAD tiers for TNU-424 ladder rack and TNU-625 3000W inverter.',
      'Is TNU-105 verified for 2025 Ford Transit 350 Cargo Van?',
    ],
    specAssistPlaceholder: 'Ask about shelving kits, bulkheads, LED lightbars, ladder racks, or inverters...',
    contactInfo: {
      email: 'upfitting@truenorthupfitting.example',
      phone: '+1 (403) 555-0162',
      regionLabel: 'Toronto · Calgary · Vancouver · Montreal Upfit Hubs',
    },
    theme: {
      isLight: false,
      bgCanvas: '#131518',
      bgSurface: '#1B1E23',
      bgElevated: '#23272D',
      bgInput: '#101215',
      border: '#2D3138',
      borderStrong: '#3E434D',
      textPrimary: '#F5F3EF',
      textSecondary: '#B3B0A9',
      textMuted: '#95918A',
      accentInfo: '#22D3EE',
      accentPrimary: '#F97316',
      ctaBg: '#F97316',
      ctaHoverBg: '#FB923C',
      ctaText: '#111214',
      badgeVerifiedBg: 'rgba(34, 211, 238, 0.12)',
      badgeVerifiedBorder: 'rgba(34, 211, 238, 0.45)',
      badgeVerifiedText: '#22D3EE',
      badgeWarnBg: 'rgba(249, 115, 22, 0.14)',
      badgeWarnBorder: 'rgba(249, 115, 22, 0.45)',
      badgeWarnText: '#FB923C',
      headerBg: 'rgba(18, 20, 23, 0.96)',
      heroScrimClass:
        'bg-gradient-to-r from-[#111316]/82 via-[#111316]/42 via-28% to-transparent',
    },
  },
};

export const STOREFRONT_ORDER: StorefrontId[] = [
  'astrateq',
  'northlink',
  'voltdepot',
  'truenorth',
];

export function getStorefrontCatalog(storefrontId: StorefrontId): CatalogProduct[] {
  return STOREFRONTS[storefrontId]?.products ?? clientConfig.products;
}

export function getProductBySkuForStorefront(
  storefrontId: StorefrontId,
  sku: string
): CatalogProduct | undefined {
  return STOREFRONTS[storefrontId]?.products.find((p) => p.sku === sku);
}

export function getProductBySkuAcrossAll(
  sku: string,
  preferredStorefrontId?: StorefrontId
): CatalogProduct | undefined {
  if (preferredStorefrontId) {
    const inPreferred = STOREFRONTS[preferredStorefrontId]?.products.find((p) => p.sku === sku);
    if (inPreferred) return inPreferred;
  }
  for (const id of STOREFRONT_ORDER) {
    const found = STOREFRONTS[id].products.find((p) => p.sku === sku);
    if (found) return found;
  }
  return undefined;
}

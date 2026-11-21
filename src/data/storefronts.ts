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

export interface StorefrontConfig {
  id: StorefrontId;
  badgeNumber: string;
  shortLabel: string;
  roleTitle: string;
  brandName: string;
  brandSubline?: string;
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
  navLinks: Array<{ label: string; category?: string; href: string }>;
  heroLayout: 'docked-right-finder' | 'corporate-quick-quote' | 'ev-split-finder' | 'upfitter-pillars';
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  categoryCardStyle: 'dark-overlay' | 'light-framed';
  trustPillars: TrustPillar[];
  theme: StorefrontTheme;
}

export const STOREFRONTS: Record<StorefrontId, StorefrontConfig> = {
  astrateq: {
    id: 'astrateq',
    badgeNumber: '01',
    shortLabel: 'Astrateq Gadgets',
    roleTitle: 'Flagship Distributor',
    brandName: 'Astrateq Gadgets',
    logoUrl: 'https://i.ibb.co/gbf3KGBx/Chat-GPT-Image-Jun-9-2026-07-07-30-PM.png',
    tagline: 'Automotive Technology · Fleet Solutions',
    heroHeadlinePrefix: 'Smarter Technology for Every Fleet.',
    heroSubtitle:
      'Advanced dashcams, telematics gateways, ADAS retrofits, and EV depot controls—priced in CAD tiers with vehicle-specific engineering review.',
    heroImageUrl: '/src/assets/images/hero_flagship_highway_1795290916017.jpg',
    heroImageAlt: 'Commercial fleet truck and SUV driving on twilight city highway',
    primaryCtaLabel: 'Build fleet quote',
    secondaryCtaLabel: 'Browse hardware specs',
    quoteButtonLabel: 'Quote List',
    navLinks: [
      { label: 'Video Telematics', category: 'Video Telematics', href: '#hardware' },
      { label: 'Fleet ELD & GPS', category: 'Fleet ELD & GPS', href: '#hardware' },
      { label: 'ADAS Retrofits', category: 'ADAS Retrofits', href: '#hardware' },
      { label: 'EV Power', category: 'EV Power & Diagnostics', href: '#hardware' },
      { label: 'Fitment', href: '#fitment' },
    ],
    heroLayout: 'docked-right-finder',
    categorySectionTitle: 'Explore Our Product Categories',
    categorySectionSubtitle: 'Select a commercial hardware category to filter specifications and CAD tiers.',
    categoryCardStyle: 'dark-overlay',
    trustPillars: [
      {
        title: 'Vehicle-Specific Fitment',
        subtitle: 'Published matrix & engineering review',
        icon: 'shield',
      },
      {
        title: 'CAD Volume Pricing',
        subtitle: '1–9, 10–49 & 50+ formal quotes',
        icon: 'layers',
      },
      {
        title: 'Fleet Engineering Support',
        subtitle: 'Spec Assist & harness verification',
        icon: 'wrench',
      },
    ],
    theme: {
      isLight: false,
      bgCanvas: '#171A1D',
      bgSurface: '#1D2126',
      bgElevated: '#23282E',
      bgInput: '#14171A',
      border: '#2B3138',
      borderStrong: '#38414C',
      textPrimary: '#F2EFE9',
      textSecondary: '#A7B0BC',
      textMuted: '#76808D',
      accentInfo: '#22D3EE',
      accentPrimary: '#F59E0B',
      ctaBg: '#F59E0B',
      ctaHoverBg: '#FBBF24',
      ctaText: '#111417',
      badgeVerifiedBg: 'rgba(34, 211, 238, 0.12)',
      badgeVerifiedBorder: 'rgba(34, 211, 238, 0.45)',
      badgeVerifiedText: '#22D3EE',
      badgeWarnBg: 'rgba(245, 158, 11, 0.12)',
      badgeWarnBorder: 'rgba(245, 158, 11, 0.45)',
      badgeWarnText: '#F59E0B',
      headerBg: 'rgba(15, 19, 24, 0.95)',
      heroScrimClass:
        'bg-gradient-to-r from-[#11151B]/95 via-[#141920]/72 to-[#141920]/25',
    },
  },

  northlink: {
    id: 'northlink',
    badgeNumber: '02',
    shortLabel: 'NorthLink Telematics',
    roleTitle: 'Corporate Procurement',
    brandName: 'NorthLink Telematics',
    tagline: 'Fleet Technology Solutions',
    heroHeadlinePrefix: 'Smarter Fleet Management Starts Here.',
    heroSubtitle:
      'Reliable telematics gateways, AI dashcams, and structured CAD procurement for enterprise commercial vehicle operations.',
    heroImageUrl: '/src/assets/images/hero_northlink_fleet_1795291341250.jpg',
    heroImageAlt: 'White commercial transit cargo vans parked outside corporate logistics hub',
    primaryCtaLabel: 'Build fleet quote',
    secondaryCtaLabel: 'Browse hardware specs',
    quoteButtonLabel: 'Quote List',
    navLinks: [
      { label: 'All Hardware', category: 'All Hardware', href: '#hardware' },
      { label: 'Fleet ELD & GPS', category: 'Fleet ELD & GPS', href: '#hardware' },
      { label: 'Video Telematics', category: 'Video Telematics', href: '#hardware' },
      { label: 'Fitment', href: '#fitment' },
      { label: 'Spec Assist', href: '#spec-assist' },
    ],
    heroLayout: 'corporate-quick-quote',
    categorySectionTitle: 'Our Solutions',
    categorySectionSubtitle: 'Built for the procurement and compliance demands of modern commercial fleets.',
    categoryCardStyle: 'light-framed',
    trustPillars: [
      {
        title: 'Fleet-Focused Hardware',
        subtitle: 'Standardized multi-chassis SKUs',
        icon: 'layers',
      },
      {
        title: 'Transparent CAD Tiers',
        subtitle: '1–9, 10–49 & 50+ formal RFQ',
        icon: 'shield',
      },
      {
        title: 'Rollout Coordination',
        subtitle: 'Multi-group vehicle intake',
        icon: 'wrench',
      },
    ],
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
      textMuted: '#64748B',
      accentInfo: '#0284C7',
      accentPrimary: '#1D63DC',
      ctaBg: '#1D63DC',
      ctaHoverBg: '#1E40AF',
      ctaText: '#FFFFFF',
      badgeVerifiedBg: 'rgba(2, 132, 199, 0.10)',
      badgeVerifiedBorder: 'rgba(2, 132, 199, 0.35)',
      badgeVerifiedText: '#0369A1',
      badgeWarnBg: 'rgba(217, 119, 6, 0.10)',
      badgeWarnBorder: 'rgba(217, 119, 6, 0.38)',
      badgeWarnText: '#B45309',
      headerBg: 'rgba(255, 255, 255, 0.96)',
      heroScrimClass:
        'bg-gradient-to-r from-[#F4F7FA] via-[#F4F7FA]/88 to-transparent',
    },
  },

  voltdepot: {
    id: 'voltdepot',
    badgeNumber: '03',
    shortLabel: 'VoltDepot Systems',
    roleTitle: 'EV Fleet Charging Specialist',
    brandName: 'VoltDepot Systems',
    tagline: 'EV Fleet Charging Solutions',
    heroHeadlinePrefix: "Power Your Fleet's Electric Future.",
    heroSubtitle:
      'Depot charging controllers, wide-range DC telemetry, and scalable EV fleet hardware with transparent CAD tier quotes.',
    heroImageUrl: '/src/assets/images/hero_voltdepot_ev_1795291341447.jpg',
    heroImageAlt: 'Electric commercial delivery vans charging at dark industrial depot pedestals',
    primaryCtaLabel: 'Build fleet quote',
    secondaryCtaLabel: 'Browse hardware specs',
    quoteButtonLabel: 'Quote List',
    navLinks: [
      { label: 'EV Power', category: 'EV Power & Diagnostics', href: '#hardware' },
      { label: 'Fleet ELD & GPS', category: 'Fleet ELD & GPS', href: '#hardware' },
      { label: 'All Hardware', category: 'All Hardware', href: '#hardware' },
      { label: 'Fitment', href: '#fitment' },
      { label: 'Spec Assist', href: '#spec-assist' },
    ],
    heroLayout: 'ev-split-finder',
    categorySectionTitle: 'Our Charging & Fleet Solutions',
    categorySectionSubtitle: 'Hardware engineered for depot electrification and commercial EV visibility.',
    categoryCardStyle: 'dark-overlay',
    trustPillars: [
      {
        title: 'Depot-Ready Controllers',
        subtitle: 'OCPP 1.6 · Ethernet · IP65',
        icon: 'zap',
      },
      {
        title: 'CAD Volume Pricing',
        subtitle: '1–9, 10–49 & 50+ formal quotes',
        icon: 'layers',
      },
      {
        title: 'Dedicated Engineering Review',
        subtitle: 'EV Port & harness verification',
        icon: 'shield',
      },
    ],
    theme: {
      isLight: false,
      bgCanvas: '#0D1311',
      bgSurface: '#131C19',
      bgElevated: '#192521',
      bgInput: '#0A0F0D',
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
      badgeVerifiedBg: 'rgba(56, 189, 248, 0.12)',
      badgeVerifiedBorder: 'rgba(56, 189, 248, 0.45)',
      badgeVerifiedText: '#38BDF8',
      badgeWarnBg: 'rgba(245, 158, 11, 0.12)',
      badgeWarnBorder: 'rgba(245, 158, 11, 0.45)',
      badgeWarnText: '#FBBF24',
      headerBg: 'rgba(11, 17, 15, 0.95)',
      heroScrimClass:
        'bg-gradient-to-r from-[#0B110F]/96 via-[#0D1311]/78 to-[#0D1311]/25',
    },
  },

  truenorth: {
    id: 'truenorth',
    badgeNumber: '04',
    shortLabel: 'TrueNorth Upfitting',
    roleTitle: 'Multi-Location Upfitter Network',
    brandName: 'TrueNorth Upfitting',
    tagline: 'Commercial Vehicle Upfitting',
    heroHeadlinePrefix: 'Equip. Enhance.',
    heroHeadlineHighlight: 'Go Further.',
    heroSubtitle:
      'Professional ADAS retrofits, sealed wiring harnesses, and fleet telematics upfitting across commercial chassis.',
    heroImageUrl: '/src/assets/images/hero_truenorth_upfit_clean_1795291357134.jpg',
    heroImageAlt: 'Commercial utility service pickup truck with ladder rack at industrial depot at sunset',
    primaryCtaLabel: 'Build fleet quote',
    secondaryCtaLabel: 'Browse hardware specs',
    quoteButtonLabel: 'Quote List',
    navLinks: [
      { label: 'ADAS Retrofits', category: 'ADAS Retrofits', href: '#hardware' },
      { label: 'Video Telematics', category: 'Video Telematics', href: '#hardware' },
      { label: 'All Hardware', category: 'All Hardware', href: '#hardware' },
      { label: 'Fitment', href: '#fitment' },
      { label: 'Spec Assist', href: '#spec-assist' },
    ],
    heroLayout: 'upfitter-pillars',
    categorySectionTitle: 'Our Upfitting Categories',
    categorySectionSubtitle: 'Commercial retrofit hardware and sealed interconnect bundles for work fleets.',
    categoryCardStyle: 'dark-overlay',
    trustPillars: [
      {
        title: 'Multi-Depot Coordination',
        subtitle: 'Fleet-wide rollout planning',
        icon: 'mappin',
      },
      {
        title: 'Installer Coordination',
        subtitle: 'Self-install or upfitter scoped',
        icon: 'wrench',
      },
      {
        title: 'CAD Fleet Discounts',
        subtitle: 'Structured unit & bundle tiers',
        icon: 'layers',
      },
    ],
    theme: {
      isLight: false,
      bgCanvas: '#151618',
      bgSurface: '#1D1F22',
      bgElevated: '#25282C',
      bgInput: '#111214',
      border: '#2E3136',
      borderStrong: '#3E4249',
      textPrimary: '#F5F3EF',
      textSecondary: '#B3B0A9',
      textMuted: '#827F78',
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
      headerBg: 'rgba(19, 20, 22, 0.95)',
      heroScrimClass:
        'bg-gradient-to-r from-[#141517]/95 via-[#151618]/78 to-[#151618]/20',
    },
  },
};

export const STOREFRONT_ORDER: StorefrontId[] = [
  'astrateq',
  'northlink',
  'voltdepot',
  'truenorth',
];

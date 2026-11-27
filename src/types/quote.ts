export type FitmentStatus = 'verified' | 'requires-verification' | 'not-verified';

export type PowerSourceOption =
  | ''
  | 'OBD-II'
  | 'J1939'
  | '12V'
  | '24V'
  | 'USB-C'
  | 'EV Port'
  | "I don't know";

export interface VehicleSelection {
  year: string;
  make: string;
  model: string;
  vehicleClass: string;
}

export interface FitmentEvaluation {
  status: FitmentStatus;
  headlineBadge: string;
  summaryText: string;
  drawerBadgeText: string;
  reason?: string;
  recommendedHarnessSku?: string;
}

export interface QuoteLineItem {
  sku: string;
  quantity: number;
  lastTierChangedFrom?: string;
  lastTierChangedTo?: string;
}

export interface VehicleGroup {
  id: string;
  groupLabel?: string;
  year: string;
  make: string;
  model: string;
  vehicleClass: string;
  vehicleCount: number;
  powerSource: PowerSourceOption;
  addedFrom: 'finder' | 'manual';
}

export interface DeploymentAnswers {
  installationPreference: string;
  fleetSize: string;
  rolloutTimeline: string;
  additionalEquipmentNotes?: string;
  // NorthLink Telematics workflow fields
  vehicleTypes?: string;
  trackingRequirements?: string;
  connectivityPreference?: string;
  // VoltDepot Systems workflow fields
  chargingType?: string;
  chargingBays?: string;
  siteConditions?: string;
  electricalService?: string;
  siteLocation?: string;
  // TrueNorth Upfitting workflow fields
  vehicleUse?: string;
  requiredEquipment?: string;
  upfitLocation?: string;
}

export interface ContactDetails {
  fullName: string;
  companyName: string;
  workEmail: string;
  phone: string;
  provinceOrRegion?: string;
  projectNotes?: string;
}

export interface SubmittedRfqRecord {
  quoteId?: string;
  idempotencyKey: string;
  submittedAt: string;
  mode: 'backend-api' | 'webhook';
  deliveryStatus: string;
  externalDeliveryConfigured: boolean;
  payload: Record<string, unknown>;
}

export interface PersistedQuoteState {
  lineItems: QuoteLineItem[];
  vehicleGroups: VehicleGroup[];
  installationRequested: boolean;
  deployment: DeploymentAnswers;
  contact: ContactDetails;
  currentStep: 1 | 2 | 3;
  submittedRecord: SubmittedRfqRecord | null;
}

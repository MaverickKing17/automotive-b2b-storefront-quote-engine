export type FitmentStatus = 'verified' | 'requires-verification';

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
}

export interface ContactDetails {
  fullName: string;
  companyName: string;
  workEmail: string;
  phone: string;
}

export interface SubmittedRfqRecord {
  quoteId: string;
  idempotencyKey: string;
  submittedAt: string;
  mode: 'webhook' | 'local-demo';
  webhookStatus?: string;
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

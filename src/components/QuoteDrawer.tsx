import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Car,
  ShieldCheck,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';
import {
  clientConfig,
  evaluateVehicleFitment,
  formatCad,
  getProductBySku,
  getTier1Price,
  getTierForQuantity,
} from '../data/clientConfig';
import type { PolicyItem } from '../data/clientConfig';
import type {
  ContactDetails,
  DeploymentAnswers,
  PersistedQuoteState,
  PowerSourceOption,
  SubmittedRfqRecord,
  VehicleGroup,
  VehicleSelection,
} from '../types/quote';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quoteState: PersistedQuoteState;
  onUpdateQuantity: (sku: string, nextQty: number) => void;
  onRemoveLineItem: (sku: string) => void;
  onAddProduct: (sku: string) => void;
  onToggleInstallation: () => void;
  onAddVehicleGroup: (vehicle: VehicleSelection, addedFrom: 'finder' | 'manual') => void;
  onUpdateVehicleGroup: (id: string, patch: Partial<VehicleGroup>) => void;
  onRemoveVehicleGroup: (id: string) => void;
  onUpdateDeployment: (patch: Partial<DeploymentAnswers>) => void;
  onUpdateContact: (patch: Partial<ContactDetails>) => void;
  onSetStep: (step: 1 | 2 | 3) => void;
  onSetSubmittedRecord: (record: SubmittedRfqRecord | null) => void;
  onResetQuote: () => void;
  onOpenPolicy: (policy: PolicyItem) => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  quoteState,
  onUpdateQuantity,
  onRemoveLineItem,
  onAddProduct,
  onToggleInstallation,
  onAddVehicleGroup,
  onUpdateVehicleGroup,
  onRemoveVehicleGroup,
  onUpdateDeployment,
  onUpdateContact,
  onSetStep,
  onSetSubmittedRecord,
  onResetQuote,
  onOpenPolicy,
}) => {
  const [showManualVehicleForm, setShowManualVehicleForm] = useState(false);
  const [manualYear, setManualYear] = useState('');
  const [manualMake, setManualMake] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualClass, setManualClass] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const {
    lineItems,
    vehicleGroups,
    installationRequested,
    deployment,
    contact,
    currentStep,
    submittedRecord,
  } = quoteState;

  const harnessProduct = getProductBySku('AST-640');
  const harnessInQuote = lineItems.some((item) => item.sku === 'AST-640');

  const manualModels = manualMake
    ? clientConfig.fitmentOptions.modelsByMake[manualMake] ??
      clientConfig.fitmentOptions.allModelsFallback
    : clientConfig.fitmentOptions.allModelsFallback;

  const stepLabels = {
    1: 'STEP 01 OF 03',
    2: 'STEP 02 OF 03',
    3: 'STEP 03 OF 03',
  } as const;

  const stepTitles = {
    1: 'Deployment & Hardware',
    2: 'Contact Details',
    3: 'Review & Submit',
  } as const;

  const handleManualVehicleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualYear || !manualMake || !manualModel || !manualClass) return;
    onAddVehicleGroup(
      {
        year: manualYear,
        make: manualMake,
        model: manualModel,
        vehicleClass: manualClass,
      },
      'manual'
    );
    setManualYear('');
    setManualMake('');
    setManualModel('');
    setManualClass('');
    setShowManualVehicleForm(false);
    setStep1Error(null);
  };

  const handleStep1Continue = () => {
    setStep1Error(null);

    if (lineItems.length === 0 && vehicleGroups.length === 0 && !installationRequested) {
      setStep1Error('Add at least one hardware item or vehicle group before continuing.');
      return;
    }

    const missingPowerGroup = vehicleGroups.find((g) => !g.powerSource);
    if (missingPowerGroup) {
      setStep1Error(
        `Select the required Vehicle power source for ${missingPowerGroup.year} ${missingPowerGroup.make} ${missingPowerGroup.model}.`
      );
      return;
    }

    onSetStep(2);
  };

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error(null);

    const fullName = contact.fullName.trim();
    const companyName = contact.companyName.trim();
    const workEmail = contact.workEmail.trim();
    const phone = contact.phone.trim();

    if (!fullName || !companyName || !workEmail || !phone) {
      setStep2Error(
        'All contact fields (Full name, Company name, Work email, and Phone) are required.'
      );
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail);
    if (!emailValid) {
      setStep2Error('Enter a valid work email address.');
      return;
    }

    onSetStep(3);
  };

  const handleSubmitRfq = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    const quoteId = `RFQ-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now()
      .toString()
      .slice(-3)}`;

    const computedLines = lineItems.map((item) => {
      const product = getProductBySku(item.sku);
      if (!product) {
        return { sku: item.sku, quantity: item.quantity };
      }
      const tier = getTierForQuantity(product, item.quantity);
      const lineTotal = tier.unitPrice !== null ? tier.unitPrice * item.quantity : null;
      return {
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitLabel: product.unitLabel,
        activeTier: tier.label,
        unitPriceCad: tier.unitPrice,
        lineTotalCad: lineTotal,
        pricingNote: tier.unitPrice === null ? tier.formalQuoteText : undefined,
      };
    });

    const computedGroups = vehicleGroups.map((group) => {
      const fitment = evaluateVehicleFitment(group, group.powerSource);
      return {
        id: group.id,
        year: group.year,
        make: group.make,
        model: group.model,
        vehicleClass: group.vehicleClass,
        vehicleCount: group.vehicleCount,
        powerSource: group.powerSource,
        fitmentStatus: fitment.status,
        fitmentLabel: fitment.drawerBadgeText,
      };
    });

    const payload = {
      quoteId,
      idempotencyKey: quoteId,
      createdAt: new Date().toISOString(),
      currency: clientConfig.currency,
      brand: clientConfig.brand.name,
      hardwareLines: computedLines,
      installationCoordinationRequested: installationRequested,
      vehicleGroups: computedGroups,
      deployment,
      contact,
    };

    try {
      const webhookUrl = clientConfig.webhookUrl.trim();
      if (webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`Webhook responded with status ${res.status}`);
        }
        onSetSubmittedRecord({
          quoteId,
          idempotencyKey: quoteId,
          submittedAt: payload.createdAt,
          mode: 'webhook',
          webhookStatus: `Delivered (${res.status})`,
          payload,
        });
      } else {
        onSetSubmittedRecord({
          quoteId,
          idempotencyKey: quoteId,
          submittedAt: payload.createdAt,
          mode: 'local-demo',
          payload,
        });
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Webhook delivery failed: ${err.message}. Verify endpoint configuration.`
          : 'Webhook delivery failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricedSubtotal = lineItems.reduce((sum, item) => {
    const product = getProductBySku(item.sku);
    if (!product) return sum;
    const tier = getTierForQuantity(product, item.quantity);
    if (tier.unitPrice === null) return sum;
    return sum + tier.unitPrice * item.quantity;
  }, 0);

  const hasFormalQuoteLine =
    installationRequested ||
    lineItems.some((item) => {
      const product = getProductBySku(item.sku);
      return product ? getTierForQuantity(product, item.quantity).unitPrice === null : false;
    });

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Fleet Quote Drawer"
      data-testid="quote-drawer"
    >
      <div className="relative w-full max-w-2xl bg-[#171A1D] border-l border-[#343C46] text-[#F2EFE9] flex flex-col h-full shadow-2xl">
        {/* Drawer Header */}
        <div className="border-b border-[#2B3138] bg-[#1D2126] px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div
              data-testid="drawer-step-indicator"
              className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#22D3EE]"
            >
              {submittedRecord ? 'RFQ RECORDED' : stepLabels[currentStep]}
            </div>
            <h2 className="font-display text-lg font-bold text-[#F2EFE9] mt-0.5">
              {submittedRecord ? 'Fleet Quote Reference' : stepTitles[currentStep]}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote drawer"
            className="p-2 text-[#A7B0BC] hover:text-[#F2EFE9] border border-transparent hover:border-[#343C46] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consistent 3-Step Navigation Strip */}
        {!submittedRecord && (
          <div className="grid grid-cols-3 border-b border-[#2B3138] bg-[#14171A] text-[11px] font-mono-tech">
            {([1, 2, 3] as const).map((stepNum) => {
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) {
                      onSetStep(stepNum);
                    }
                  }}
                  disabled={stepNum > currentStep}
                  className={`px-3 py-2.5 text-left border-r last:border-r-0 border-[#2B3138] transition-colors ${
                    isActive
                      ? 'bg-[#1D2126] text-[#22D3EE] font-semibold'
                      : isPast
                      ? 'text-[#F2EFE9] hover:bg-[#1D2126]/60 cursor-pointer'
                      : 'text-[#76808D] cursor-not-allowed'
                  }`}
                >
                  <div>{stepLabels[stepNum]}</div>
                  <div className="truncate text-[10px] opacity-80">{stepTitles[stepNum]}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SUBMITTED CONFIRMATION STATE */}
          {submittedRecord ? (
            <div className="space-y-5" data-testid="rfq-confirmation">
              <div className="border border-[#22D3EE]/50 bg-[#1D2126] p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#22D3EE] text-xs font-mono-tech uppercase tracking-wider">
                  <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {submittedRecord.mode === 'webhook'
                      ? 'RFQ Submitted to Configured Webhook'
                      : 'Demo Mode — Recorded Locally'}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#F2EFE9]">
                  Quote ID: <span className="font-mono-tech">{submittedRecord.quoteId}</span>
                </h3>

                {submittedRecord.mode === 'local-demo' ? (
                  <p className="text-sm text-[#A7B0BC] leading-relaxed">
                    No external webhook URL is configured in <code className="font-mono-tech text-[#F2EFE9]">clientConfig</code>.
                    Your RFQ request was recorded locally in browser storage for demo purposes
                    only—it has not been transmitted to an external CRM or server.
                  </p>
                ) : (
                  <p className="text-sm text-[#A7B0BC] leading-relaxed">
                    JSON RFQ payload delivered to the configured webhook endpoint with
                    idempotencyKey <code className="font-mono-tech text-[#F2EFE9]">{submittedRecord.idempotencyKey}</code>.
                  </p>
                )}

                <div className="text-xs font-mono-tech text-[#76808D]">
                  Recorded at: {new Date(submittedRecord.submittedAt).toLocaleString('en-CA')}
                </div>
              </div>

              <div className="border border-[#2B3138] bg-[#14171A] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tech uppercase tracking-wider text-[#A7B0BC]">
                    RFQ JSON Payload (Idempotency Key: {submittedRecord.idempotencyKey})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify(submittedRecord.payload, null, 2)
                      );
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#22D3EE] hover:underline cursor-pointer"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono-tech text-[#A7B0BC] overflow-x-auto max-h-60 p-3 bg-[#171A1D] border border-[#262C34]">
                  {JSON.stringify(submittedRecord.payload, null, 2)}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onResetQuote}
                  className="rounded-xs border border-[#343C46] bg-[#1D2126] px-4 py-2.5 text-xs font-semibold text-[#F2EFE9] hover:border-[#22D3EE] cursor-pointer"
                >
                  Start new fleet quote
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xs bg-[#F59E0B] px-5 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] cursor-pointer"
                >
                  Return to showroom
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ==================== STEP 01 OF 03: DEPLOYMENT ==================== */}
              {currentStep === 1 && (
                <div className="space-y-8" data-testid="drawer-step-1">
                  {/* A. Hardware Line Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                        Hardware Line Items ({lineItems.length})
                      </h3>
                      <span className="text-[11px] font-mono-tech text-[#76808D]">
                        CAD tier pricing
                      </span>
                    </div>

                    {lineItems.length === 0 ? (
                      <div className="border border-dashed border-[#343C46] bg-[#1D2126]/40 p-5 text-sm text-[#A7B0BC]">
                        No hardware SKUs added yet. Select items from the Hardware Catalog or add
                        optional wiring below.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lineItems.map((item) => {
                          const product = getProductBySku(item.sku);
                          if (!product) return null;
                          const activeTier = getTierForQuantity(product, item.quantity);
                          const isFormalQuote = activeTier.unitPrice === null;
                          const lineTotal =
                            activeTier.unitPrice !== null
                              ? activeTier.unitPrice * item.quantity
                              : null;

                          return (
                            <div
                              key={item.sku}
                              data-testid={`drawer-line-${item.sku}`}
                              className="border border-[#2B3138] bg-[#1D2126] p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs font-mono-tech text-[#22D3EE]">
                                    {product.sku} · {activeTier.label}
                                  </div>
                                  <div className="font-display text-sm font-bold text-[#F2EFE9] mt-0.5">
                                    {product.name}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onRemoveLineItem(item.sku)}
                                  aria-label={`Remove ${product.sku}`}
                                  className="p-1.5 text-[#76808D] hover:text-[#F59E0B] cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Tier Changed Notice */}
                              {item.lastTierChangedTo && (
                                <div
                                  data-testid={`tier-changed-${item.sku}`}
                                  className="text-[11px] font-mono-tech text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/30 px-2.5 py-1 inline-block"
                                >
                                  Tier changed: {item.lastTierChangedTo}
                                </div>
                              )}

                              {/* Stepper + Unit Price + Line Total */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                <div className="inline-flex items-center border border-[#343C46] bg-[#14171A]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(item.sku, Math.max(1, item.quantity - 1))
                                    }
                                    aria-label={`Decrease quantity of ${product.sku}`}
                                    className="w-9 h-9 flex items-center justify-center text-[#A7B0BC] hover:text-[#F2EFE9] hover:bg-[#23282E] cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    aria-label={`Quantity for ${product.sku}`}
                                    data-testid={`qty-input-${item.sku}`}
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const parsed = parseInt(e.target.value, 10);
                                      if (!Number.isNaN(parsed) && parsed >= 1) {
                                        onUpdateQuantity(item.sku, parsed);
                                      }
                                    }}
                                    className="w-16 h-9 bg-transparent text-center text-sm font-mono-tech text-[#F2EFE9] focus:outline-none border-x border-[#343C46]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
                                    aria-label={`Increase quantity of ${product.sku}`}
                                    data-testid={`qty-inc-${item.sku}`}
                                    className="w-9 h-9 flex items-center justify-center text-[#A7B0BC] hover:text-[#F2EFE9] hover:bg-[#23282E] cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-right font-mono-tech">
                                  {isFormalQuote ? (
                                    <div className="text-xs text-[#F59E0B] font-semibold">
                                      {activeTier.formalQuoteText}
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-xs text-[#A7B0BC]">
                                        {formatCad(activeTier.unitPrice!)} / {product.unitLabel}
                                      </div>
                                      <div
                                        data-testid={`line-total-${item.sku}`}
                                        className="text-sm font-bold text-[#F2EFE9] mt-0.5"
                                      >
                                        {formatCad(lineTotal!)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Fitment Badge PER attached vehicle group */}
                              <div className="border-t border-[#262C34] pt-2.5 space-y-1.5">
                                {vehicleGroups.length === 0 ? (
                                  <div
                                    data-testid={`line-fitment-unchecked-${item.sku}`}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/40 px-2.5 py-1"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Fitment not checked — add your vehicle</span>
                                  </div>
                                ) : (
                                  vehicleGroups.map((group) => {
                                    const evalResult = evaluateVehicleFitment(
                                      group,
                                      group.powerSource
                                    );
                                    const isVerified = evalResult.status === 'verified';
                                    return (
                                      <div
                                        key={group.id}
                                        className={`flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech px-2.5 py-1 border ${
                                          isVerified
                                            ? 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE]'
                                            : 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
                                        }`}
                                      >
                                        <span className="text-[#F2EFE9]">
                                          {group.year} {group.make} {group.model}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-semibold">
                                          {isVerified ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                          ) : (
                                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                          )}
                                          <span>{evalResult.drawerBadgeText}</span>
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* B. Optional Add-ons Area (Buyer-clicked only) */}
                  <div className="border border-[#2B3138] bg-[#14171A] p-4 space-y-3">
                    <div className="text-xs font-mono-tech uppercase tracking-wider text-[#A7B0BC]">
                      Optional Add-ons (Buyer-Added Only)
                    </div>

                    {harnessProduct && (
                      <div className="flex items-center justify-between gap-3 border border-[#262C34] bg-[#1D2126] p-3">
                        <div>
                          <div className="text-xs font-semibold text-[#F2EFE9]">
                            {harnessProduct.name}
                          </div>
                          <div className="text-[11px] font-mono-tech text-[#A7B0BC] mt-0.5">
                            From {formatCad(getTier1Price(harnessProduct))} /{' '}
                            {harnessProduct.unitLabel} · {harnessProduct.specs.interface}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddProduct(harnessProduct.sku)}
                          className="inline-flex items-center gap-1 rounded-xs border border-[#F59E0B] px-3 py-1.5 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#111417] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{harnessInQuote ? 'Add another' : 'Add'}</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 border border-[#262C34] bg-[#1D2126] p-3">
                      <div>
                        <div className="text-xs font-semibold text-[#F2EFE9]">
                          {clientConfig.deploymentOptions.installationAddon.label}
                        </div>
                        <div className="text-[11px] text-[#A7B0BC] mt-0.5">
                          {clientConfig.deploymentOptions.installationAddon.note}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleInstallation}
                        className={`inline-flex items-center gap-1 rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          installationRequested
                            ? 'bg-[#22D3EE]/15 border border-[#22D3EE]/60 text-[#22D3EE]'
                            : 'border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#111417]'
                        }`}
                      >
                        {installationRequested ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Added (Remove)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* C. Vehicle Groups */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                        Vehicle Groups ({vehicleGroups.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowManualVehicleForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22D3EE] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{showManualVehicleForm ? 'Cancel' : 'Add vehicle group manually'}</span>
                      </button>
                    </div>

                    {showManualVehicleForm && (
                      <form
                        onSubmit={handleManualVehicleAdd}
                        className="mb-4 border border-[#343C46] bg-[#14171A] p-4 space-y-3"
                      >
                        <div className="text-xs font-mono-tech uppercase text-[#A7B0BC]">
                          Add Manual Vehicle Group
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={manualYear}
                            onChange={(e) => setManualYear(e.target.value)}
                            aria-label="Manual vehicle year"
                            className="h-10 rounded-xs border border-[#343C46] bg-[#171A1D] px-2.5 text-xs text-[#F2EFE9]"
                          >
                            <option value="">Year</option>
                            {clientConfig.fitmentOptions.years.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          <select
                            value={manualMake}
                            onChange={(e) => {
                              setManualMake(e.target.value);
                              setManualModel('');
                            }}
                            aria-label="Manual vehicle make"
                            className="h-10 rounded-xs border border-[#343C46] bg-[#171A1D] px-2.5 text-xs text-[#F2EFE9]"
                          >
                            <option value="">Make</option>
                            {clientConfig.fitmentOptions.makes.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <select
                            value={manualModel}
                            onChange={(e) => setManualModel(e.target.value)}
                            aria-label="Manual vehicle model"
                            className="h-10 rounded-xs border border-[#343C46] bg-[#171A1D] px-2.5 text-xs text-[#F2EFE9]"
                          >
                            <option value="">Model / chassis</option>
                            {manualModels.map((mod) => (
                              <option key={mod} value={mod}>
                                {mod}
                              </option>
                            ))}
                          </select>
                          <select
                            value={manualClass}
                            onChange={(e) => setManualClass(e.target.value)}
                            aria-label="Manual vehicle class"
                            className="h-10 rounded-xs border border-[#343C46] bg-[#171A1D] px-2.5 text-xs text-[#F2EFE9]"
                          >
                            <option value="">Vehicle class</option>
                            {clientConfig.fitmentOptions.vehicleClasses.map((vc) => (
                              <option key={vc} value={vc}>
                                {vc}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={!manualYear || !manualMake || !manualModel || !manualClass}
                          className="rounded-xs bg-[#F59E0B] px-4 py-2 text-xs font-semibold text-[#111417] disabled:bg-[#23282E] disabled:text-[#76808D] cursor-pointer"
                        >
                          Add vehicle group
                        </button>
                      </form>
                    )}

                    {vehicleGroups.length === 0 ? (
                      <div className="border border-dashed border-[#343C46] bg-[#1D2126]/40 p-4 text-xs text-[#A7B0BC]">
                        No vehicle groups attached yet. Use the Vehicle Fitment finder or click
                        &ldquo;Add vehicle group manually&rdquo; above.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vehicleGroups.map((group, idx) => {
                          const evalResult = evaluateVehicleFitment(group, group.powerSource);
                          const isVerified = evalResult.status === 'verified';
                          return (
                            <div
                              key={group.id}
                              data-testid={`vehicle-group-card-${idx}`}
                              className="border border-[#2B3138] bg-[#1D2126] p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                                  <div>
                                    <div className="text-sm font-semibold text-[#F2EFE9]">
                                      {group.year} {group.make} {group.model}
                                    </div>
                                    <div className="text-xs font-mono-tech text-[#76808D]">
                                      {group.vehicleClass} · Group {idx + 1}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onRemoveVehicleGroup(group.id)}
                                  aria-label={`Remove vehicle group ${group.year} ${group.make} ${group.model}`}
                                  className="p-1.5 text-[#76808D] hover:text-[#F59E0B] cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Group Fitment Status */}
                              <div
                                data-testid={`vehicle-group-status-${idx}`}
                                className={`inline-flex items-center gap-1.5 text-xs font-mono-tech px-2.5 py-1 border ${
                                  isVerified
                                    ? 'border-[#22D3EE]/50 bg-[#22D3EE]/10 text-[#22D3EE]'
                                    : 'border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]'
                                }`}
                              >
                                {isVerified ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                                <span>{evalResult.drawerBadgeText}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                  <label
                                    htmlFor={`group-count-${group.id}`}
                                    className="block text-[11px] font-mono-tech uppercase text-[#A7B0BC] mb-1"
                                  >
                                    Number of vehicles
                                  </label>
                                  <input
                                    id={`group-count-${group.id}`}
                                    type="number"
                                    min={1}
                                    value={group.vehicleCount}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (!Number.isNaN(val) && val >= 1) {
                                        onUpdateVehicleGroup(group.id, { vehicleCount: val });
                                      }
                                    }}
                                    className="w-full h-10 rounded-xs border border-[#343C46] bg-[#14171A] px-3 text-sm font-mono-tech text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`group-power-${group.id}`}
                                    className="block text-[11px] font-mono-tech uppercase text-[#A7B0BC] mb-1"
                                  >
                                    Vehicle power source *
                                  </label>
                                  <select
                                    id={`group-power-${group.id}`}
                                    data-testid={`power-source-select-${idx}`}
                                    value={group.powerSource}
                                    onChange={(e) =>
                                      onUpdateVehicleGroup(group.id, {
                                        powerSource: e.target.value as PowerSourceOption,
                                      })
                                    }
                                    className="w-full h-10 rounded-xs border border-[#343C46] bg-[#14171A] px-3 text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                                  >
                                    <option value="">Select power source...</option>
                                    {clientConfig.deploymentOptions.powerSources.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* D. Deployment Questions */}
                  <div className="border-t border-[#2B3138] pt-5 space-y-4">
                    <h3 className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                      Deployment Parameters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="deploy-install"
                          className="block text-[11px] font-mono-tech uppercase text-[#A7B0BC] mb-1"
                        >
                          Installation preference
                        </label>
                        <select
                          id="deploy-install"
                          value={deployment.installationPreference}
                          onChange={(e) =>
                            onUpdateDeployment({ installationPreference: e.target.value })
                          }
                          className="w-full h-10 rounded-xs border border-[#343C46] bg-[#14171A] px-2.5 text-xs text-[#F2EFE9]"
                        >
                          {clientConfig.deploymentOptions.installationPreferences.map((pref) => (
                            <option key={pref} value={pref}>
                              {pref}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="deploy-fleet-size"
                          className="block text-[11px] font-mono-tech uppercase text-[#A7B0BC] mb-1"
                        >
                          Fleet size
                        </label>
                        <select
                          id="deploy-fleet-size"
                          value={deployment.fleetSize}
                          onChange={(e) => onUpdateDeployment({ fleetSize: e.target.value })}
                          className="w-full h-10 rounded-xs border border-[#343C46] bg-[#14171A] px-2.5 text-xs text-[#F2EFE9]"
                        >
                          {clientConfig.deploymentOptions.fleetSizes.map((band) => (
                            <option key={band} value={band}>
                              {band}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="deploy-timeline"
                          className="block text-[11px] font-mono-tech uppercase text-[#A7B0BC] mb-1"
                        >
                          Rollout timeline
                        </label>
                        <select
                          id="deploy-timeline"
                          value={deployment.rolloutTimeline}
                          onChange={(e) => onUpdateDeployment({ rolloutTimeline: e.target.value })}
                          className="w-full h-10 rounded-xs border border-[#343C46] bg-[#14171A] px-2.5 text-xs text-[#F2EFE9]"
                        >
                          {clientConfig.deploymentOptions.rolloutTimelines.map((tl) => (
                            <option key={tl} value={tl}>
                              {tl}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {step1Error && (
                    <div
                      role="alert"
                      className="border border-[#F59E0B]/60 bg-[#F59E0B]/10 p-3 text-xs text-[#F59E0B]"
                    >
                      {step1Error}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== STEP 02 OF 03: CONTACT ==================== */}
              {currentStep === 2 && (
                <form
                  id="step-2-contact-form"
                  onSubmit={handleStep2Continue}
                  className="space-y-5"
                  data-testid="drawer-step-2"
                >
                  <p className="text-sm text-[#A7B0BC]">
                    Provide your fleet procurement contact details to assemble the formal RFQ
                    summary.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="contact-full-name"
                        className="block text-xs font-mono-tech uppercase text-[#A7B0BC] mb-1.5"
                      >
                        Full name *
                      </label>
                      <input
                        id="contact-full-name"
                        type="text"
                        required
                        value={contact.fullName}
                        onChange={(e) => onUpdateContact({ fullName: e.target.value })}
                        placeholder="Jordan Alvarez"
                        className="w-full h-11 rounded-xs border border-[#343C46] bg-[#14171A] px-3.5 text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-company"
                        className="block text-xs font-mono-tech uppercase text-[#A7B0BC] mb-1.5"
                      >
                        Company name *
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        required
                        value={contact.companyName}
                        onChange={(e) => onUpdateContact({ companyName: e.target.value })}
                        placeholder="Northern Corridor Logistics Ltd."
                        className="w-full h-11 rounded-xs border border-[#343C46] bg-[#14171A] px-3.5 text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-mono-tech uppercase text-[#A7B0BC] mb-1.5"
                      >
                        Work email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={contact.workEmail}
                        onChange={(e) => onUpdateContact({ workEmail: e.target.value })}
                        placeholder="j.alvarez@corridorlogistics.ca"
                        className="w-full h-11 rounded-xs border border-[#343C46] bg-[#14171A] px-3.5 text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-mono-tech uppercase text-[#A7B0BC] mb-1.5"
                      >
                        Phone *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        value={contact.phone}
                        onChange={(e) => onUpdateContact({ phone: e.target.value })}
                        placeholder="+1 (416) 555-0148"
                        className="w-full h-11 rounded-xs border border-[#343C46] bg-[#14171A] px-3.5 text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
                      />
                    </div>
                  </div>

                  {step2Error && (
                    <div
                      role="alert"
                      className="border border-[#F59E0B]/60 bg-[#F59E0B]/10 p-3 text-xs text-[#F59E0B]"
                    >
                      {step2Error}
                    </div>
                  )}
                </form>
              )}

              {/* ==================== STEP 03 OF 03: REVIEW & SUBMIT ==================== */}
              {currentStep === 3 && (
                <div className="space-y-6" data-testid="drawer-step-3">
                  {/* (01) Hardware Summary */}
                  <div className="border border-[#2B3138] bg-[#1D2126] p-4 space-y-3">
                    <div className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                      (01) Hardware
                    </div>

                    {lineItems.length === 0 ? (
                      <p className="text-xs text-[#A7B0BC]">No hardware line items selected.</p>
                    ) : (
                      <div className="divide-y divide-[#262C34]">
                        {lineItems.map((item) => {
                          const product = getProductBySku(item.sku);
                          if (!product) return null;
                          const tier = getTierForQuantity(product, item.quantity);
                          const total =
                            tier.unitPrice !== null ? tier.unitPrice * item.quantity : null;
                          return (
                            <div key={item.sku} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                              <div>
                                <div className="font-semibold text-[#F2EFE9]">
                                  {product.sku} · {product.name}
                                </div>
                                <div className="font-mono-tech text-[#A7B0BC] mt-0.5">
                                  Qty: {item.quantity} · Tier: {tier.label} ·{' '}
                                  {tier.unitPrice !== null
                                    ? `${formatCad(tier.unitPrice)} / ${product.unitLabel}`
                                    : tier.formalQuoteText}
                                </div>
                              </div>
                              <div className="font-mono-tech font-semibold text-[#F2EFE9] whitespace-nowrap">
                                {total !== null ? formatCad(total) : 'Formal quote'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {installationRequested && (
                      <div className="border-t border-[#262C34] pt-2.5 text-xs text-[#22D3EE]">
                        + {clientConfig.deploymentOptions.installationAddon.label}
                      </div>
                    )}

                    <div className="border-t border-[#262C34] pt-3 flex items-center justify-between text-sm font-mono-tech">
                      <span className="text-[#A7B0BC]">Estimated Tiered Hardware Subtotal</span>
                      <span className="font-bold text-[#F2EFE9]">
                        {formatCad(pricedSubtotal)}
                        {hasFormalQuoteLine ? ' + formal quote items' : ''}
                      </span>
                    </div>
                  </div>

                  {/* (02) Vehicle Groups & Deployment */}
                  <div className="border border-[#2B3138] bg-[#1D2126] p-4 space-y-3">
                    <div className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                      (02) Vehicle Groups &amp; Deployment
                    </div>

                    {vehicleGroups.length === 0 ? (
                      <p className="text-xs text-[#F59E0B]">
                        No vehicle groups attached — fitment will be reviewed during intake.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {vehicleGroups.map((group) => {
                          const evalResult = evaluateVehicleFitment(group, group.powerSource);
                          const isVerified = evalResult.status === 'verified';
                          return (
                            <div
                              key={group.id}
                              className="border border-[#262C34] bg-[#171A1D] p-3 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#F2EFE9]">
                                  {group.year} {group.make} {group.model} ({group.vehicleClass})
                                </span>
                                <span className="font-mono-tech text-[#A7B0BC]">
                                  {group.vehicleCount} vehicle{group.vehicleCount === 1 ? '' : 's'}
                                </span>
                              </div>
                              <div className="font-mono-tech text-[#A7B0BC]">
                                Power source: <span className="text-[#F2EFE9]">{group.powerSource}</span>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1.5 font-mono-tech text-[11px] ${
                                  isVerified ? 'text-[#22D3EE]' : 'text-[#F59E0B]'
                                }`}
                              >
                                {isVerified ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                                <span>{evalResult.drawerBadgeText}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#262C34] pt-3 text-xs">
                      <div>
                        <div className="text-[#76808D]">Installation preference</div>
                        <div className="text-[#F2EFE9] mt-0.5">{deployment.installationPreference}</div>
                      </div>
                      <div>
                        <div className="text-[#76808D]">Fleet size</div>
                        <div className="text-[#F2EFE9] mt-0.5">{deployment.fleetSize}</div>
                      </div>
                      <div>
                        <div className="text-[#76808D]">Rollout timeline</div>
                        <div className="text-[#F2EFE9] mt-0.5">{deployment.rolloutTimeline}</div>
                      </div>
                    </div>
                  </div>

                  {/* (03) Contact Details */}
                  <div className="border border-[#2B3138] bg-[#1D2126] p-4 space-y-2">
                    <div className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                      (03) Contact Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#76808D]">Full name: </span>
                        <span className="text-[#F2EFE9]">{contact.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[#76808D]">Company: </span>
                        <span className="text-[#F2EFE9]">{contact.companyName}</span>
                      </div>
                      <div>
                        <span className="text-[#76808D]">Work email: </span>
                        <span className="text-[#F2EFE9]">{contact.workEmail}</span>
                      </div>
                      <div>
                        <span className="text-[#76808D]">Phone: </span>
                        <span className="text-[#F2EFE9]">{contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Policy Links */}
                  <div className="border border-[#2B3138] bg-[#14171A] p-4 space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-[#A7B0BC]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" aria-hidden="true" />
                      <span>Buyer Policies (Sample Demo Terms)</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                      {clientConfig.policies.map((pol) => (
                        <button
                          key={pol.id}
                          type="button"
                          onClick={() => onOpenPolicy(pol)}
                          className="text-[#22D3EE] hover:underline underline-offset-4 cursor-pointer"
                        >
                          {pol.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      className="border border-[#F59E0B]/60 bg-[#F59E0B]/10 p-3 text-xs text-[#F59E0B]"
                    >
                      {submitError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Controls */}
        {!submittedRecord && (
          <div className="border-t border-[#2B3138] bg-[#1D2126] px-6 py-4 flex items-center justify-between gap-3">
            {currentStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-[#A7B0BC] hover:text-[#F2EFE9] cursor-pointer"
                >
                  Continue browsing
                </button>
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  data-testid="step1-continue-btn"
                  className="inline-flex items-center gap-2 rounded-xs bg-[#F59E0B] px-5 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer"
                >
                  <span>Continue to Contact</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => onSetStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A7B0BC] hover:text-[#F2EFE9] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Back to Deployment</span>
                </button>
                <button
                  type="submit"
                  form="step-2-contact-form"
                  data-testid="step2-continue-btn"
                  className="inline-flex items-center gap-2 rounded-xs bg-[#F59E0B] px-5 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer"
                >
                  <span>Review RFQ</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => onSetStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A7B0BC] hover:text-[#F2EFE9] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Edit Contact</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitRfq}
                  data-testid="submit-rfq-btn"
                  className="inline-flex items-center gap-2 rounded-xs bg-[#F59E0B] px-6 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit RFQ'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

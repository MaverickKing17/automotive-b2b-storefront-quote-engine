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
import type { StorefrontConfig } from '../data/storefronts';
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
  storefront: StorefrontConfig;
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
  storefront,
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

  const { theme } = storefront;
  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

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
      storefrontId: storefront.id,
      brand: storefront.brandName,
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

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme.bgInput,
    borderColor: theme.borderStrong,
    color: theme.textPrimary,
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Fleet Quote Drawer"
      data-testid="quote-drawer"
    >
      <div
        style={{
          backgroundColor: theme.bgCanvas,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
        className="relative w-full max-w-2xl border-l flex flex-col h-full shadow-2xl"
      >
        {/* Drawer Header */}
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.border,
          }}
          className="border-b px-6 py-4 flex items-center justify-between gap-4"
        >
          <div>
            <div
              data-testid="drawer-step-indicator"
              style={{ color: infoColor }}
              className="text-[11px] font-mono-tech uppercase tracking-[0.16em]"
            >
              {submittedRecord ? 'RFQ RECORDED' : stepLabels[currentStep]}
            </div>
            <h2 className="font-display text-lg font-bold mt-0.5">
              {submittedRecord ? 'Fleet Quote Reference' : stepTitles[currentStep]}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote drawer"
            style={{ color: theme.textSecondary }}
            className="p-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consistent 3-Step Navigation Strip */}
        {!submittedRecord && (
          <div
            style={{
              backgroundColor: theme.bgElevated,
              borderColor: theme.border,
            }}
            className="grid grid-cols-3 border-b text-[11px] font-mono-tech"
          >
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
                  style={{
                    backgroundColor: isActive ? theme.bgSurface : 'transparent',
                    color: isActive ? infoColor : isPast ? theme.textPrimary : theme.textMuted,
                    borderColor: theme.border,
                  }}
                  className={`px-3 py-2.5 text-left border-r last:border-r-0 transition-colors ${
                    isPast ? 'cursor-pointer' : isActive ? 'font-semibold' : 'cursor-not-allowed'
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
          {submittedRecord ? (
            <div className="space-y-5" data-testid="rfq-confirmation">
              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.badgeVerifiedBorder,
                }}
                className="border p-5 space-y-3"
              >
                <div
                  style={{ color: infoColor }}
                  className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider"
                >
                  <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {submittedRecord.mode === 'webhook'
                      ? 'RFQ Submitted to Configured Webhook'
                      : 'Demo Mode — Recorded Locally'}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold">
                  Quote ID: <span className="font-mono-tech">{submittedRecord.quoteId}</span>
                </h3>

                {submittedRecord.mode === 'local-demo' ? (
                  <p style={{ color: theme.textSecondary }} className="text-sm leading-relaxed">
                    No external webhook URL is configured in{' '}
                    <code className="font-mono-tech">clientConfig</code>. Your RFQ request was
                    recorded locally in browser storage for demo purposes only—it has not been
                    transmitted to an external CRM or server.
                  </p>
                ) : (
                  <p style={{ color: theme.textSecondary }} className="text-sm leading-relaxed">
                    JSON RFQ payload delivered to the configured webhook endpoint with
                    idempotencyKey{' '}
                    <code className="font-mono-tech">{submittedRecord.idempotencyKey}</code>.
                  </p>
                )}

                <div style={{ color: theme.textMuted }} className="text-xs font-mono-tech">
                  Recorded at: {new Date(submittedRecord.submittedAt).toLocaleString('en-CA')}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.border,
                }}
                className="border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: theme.textSecondary }}
                    className="text-xs font-mono-tech uppercase tracking-wider"
                  >
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
                    style={{ color: infoColor }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono-tech hover:underline cursor-pointer"
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
                <pre
                  style={{
                    backgroundColor: theme.bgInput,
                    borderColor: theme.border,
                    color: theme.textSecondary,
                  }}
                  className="text-[11px] font-mono-tech overflow-x-auto max-h-60 p-3 border"
                >
                  {JSON.stringify(submittedRecord.payload, null, 2)}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onResetQuote}
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.borderStrong,
                    color: theme.textPrimary,
                  }}
                  className="rounded-xs border px-4 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Start new fleet quote
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="rounded-xs px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Return to showroom
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 01 OF 03: DEPLOYMENT */}
              {currentStep === 1 && (
                <div className="space-y-8" data-testid="drawer-step-1">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        style={{ color: infoColor }}
                        className="text-xs font-mono-tech uppercase tracking-wider"
                      >
                        Hardware Line Items ({lineItems.length})
                      </h3>
                      <span style={{ color: theme.textMuted }} className="text-[11px] font-mono-tech">
                        CAD tier pricing
                      </span>
                    </div>

                    {lineItems.length === 0 ? (
                      <div
                        style={{
                          backgroundColor: theme.bgSurface,
                          borderColor: theme.borderStrong,
                          color: theme.textSecondary,
                        }}
                        className="border border-dashed p-5 text-sm"
                      >
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
                              style={{
                                backgroundColor: theme.bgSurface,
                                borderColor: theme.border,
                              }}
                              className="border p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div
                                    style={{ color: infoColor }}
                                    className="text-xs font-mono-tech"
                                  >
                                    {product.sku} · {activeTier.label}
                                  </div>
                                  <div className="font-display text-sm font-bold mt-0.5">
                                    {product.name}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onRemoveLineItem(item.sku)}
                                  aria-label={`Remove ${product.sku}`}
                                  style={{ color: theme.textMuted }}
                                  className="p-1.5 cursor-pointer hover:opacity-80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {item.lastTierChangedTo && (
                                <div
                                  data-testid={`tier-changed-${item.sku}`}
                                  style={{
                                    backgroundColor: theme.badgeVerifiedBg,
                                    borderColor: theme.badgeVerifiedBorder,
                                    color: theme.badgeVerifiedText,
                                  }}
                                  className="text-[11px] font-mono-tech border px-2.5 py-1 inline-block"
                                >
                                  Tier changed: {item.lastTierChangedTo}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                <div
                                  style={{
                                    backgroundColor: theme.bgInput,
                                    borderColor: theme.borderStrong,
                                  }}
                                  className="inline-flex items-center border"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(item.sku, Math.max(1, item.quantity - 1))
                                    }
                                    aria-label={`Decrease quantity of ${product.sku}`}
                                    style={{ color: theme.textSecondary }}
                                    className="w-9 h-9 flex items-center justify-center cursor-pointer"
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
                                    style={{
                                      borderColor: theme.borderStrong,
                                      color: theme.textPrimary,
                                    }}
                                    className="w-16 h-9 bg-transparent text-center text-sm font-mono-tech focus:outline-none border-x"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
                                    aria-label={`Increase quantity of ${product.sku}`}
                                    data-testid={`qty-inc-${item.sku}`}
                                    style={{ color: theme.textSecondary }}
                                    className="w-9 h-9 flex items-center justify-center cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-right font-mono-tech">
                                  {isFormalQuote ? (
                                    <div
                                      style={{ color: theme.badgeWarnText }}
                                      className="text-xs font-semibold"
                                    >
                                      {activeTier.formalQuoteText}
                                    </div>
                                  ) : (
                                    <>
                                      <div style={{ color: theme.textSecondary }} className="text-xs">
                                        {formatCad(activeTier.unitPrice!)} / {product.unitLabel}
                                      </div>
                                      <div
                                        data-testid={`line-total-${item.sku}`}
                                        className="text-sm font-bold mt-0.5"
                                      >
                                        {formatCad(lineTotal!)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Fitment Badge PER attached vehicle group */}
                              <div
                                style={{ borderColor: theme.border }}
                                className="border-t pt-2.5 space-y-1.5"
                              >
                                {vehicleGroups.length === 0 ? (
                                  <div
                                    data-testid={`line-fitment-unchecked-${item.sku}`}
                                    style={{
                                      backgroundColor: theme.badgeWarnBg,
                                      borderColor: theme.badgeWarnBorder,
                                      color: theme.badgeWarnText,
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech border px-2.5 py-1"
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
                                        style={{
                                          backgroundColor: isVerified
                                            ? theme.badgeVerifiedBg
                                            : theme.badgeWarnBg,
                                          borderColor: isVerified
                                            ? theme.badgeVerifiedBorder
                                            : theme.badgeWarnBorder,
                                          color: isVerified
                                            ? theme.badgeVerifiedText
                                            : theme.badgeWarnText,
                                        }}
                                        className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech px-2.5 py-1 border"
                                      >
                                        <span style={{ color: theme.textPrimary }}>
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

                  {/* Optional Add-ons Area */}
                  <div
                    style={{
                      backgroundColor: theme.bgElevated,
                      borderColor: theme.border,
                    }}
                    className="border p-4 space-y-3"
                  >
                    <div
                      style={{ color: theme.textSecondary }}
                      className="text-xs font-mono-tech uppercase tracking-wider"
                    >
                      Optional Add-ons (Buyer-Added Only)
                    </div>

                    {harnessProduct && (
                      <div
                        style={{
                          backgroundColor: theme.bgSurface,
                          borderColor: theme.border,
                        }}
                        className="flex items-center justify-between gap-3 border p-3"
                      >
                        <div>
                          <div className="text-xs font-semibold">{harnessProduct.name}</div>
                          <div
                            style={{ color: theme.textSecondary }}
                            className="text-[11px] font-mono-tech mt-0.5"
                          >
                            From {formatCad(getTier1Price(harnessProduct))} /{' '}
                            {harnessProduct.unitLabel} · {harnessProduct.specs.interface}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddProduct(harnessProduct.sku)}
                          style={{
                            borderColor: theme.ctaBg,
                            color: theme.isLight ? theme.ctaBg : theme.accentPrimary,
                          }}
                          className="inline-flex items-center gap-1 rounded-xs border px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{harnessInQuote ? 'Add another' : 'Add'}</span>
                        </button>
                      </div>
                    )}

                    <div
                      style={{
                        backgroundColor: theme.bgSurface,
                        borderColor: theme.border,
                      }}
                      className="flex items-center justify-between gap-3 border p-3"
                    >
                      <div>
                        <div className="text-xs font-semibold">
                          {clientConfig.deploymentOptions.installationAddon.label}
                        </div>
                        <div style={{ color: theme.textSecondary }} className="text-[11px] mt-0.5">
                          {clientConfig.deploymentOptions.installationAddon.note}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleInstallation}
                        style={
                          installationRequested
                            ? {
                                backgroundColor: theme.badgeVerifiedBg,
                                borderColor: theme.badgeVerifiedBorder,
                                color: theme.badgeVerifiedText,
                              }
                            : {
                                borderColor: theme.ctaBg,
                                color: theme.isLight ? theme.ctaBg : theme.accentPrimary,
                              }
                        }
                        className="inline-flex items-center gap-1 rounded-xs border px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
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

                  {/* Vehicle Groups */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3
                        style={{ color: infoColor }}
                        className="text-xs font-mono-tech uppercase tracking-wider"
                      >
                        Vehicle Groups ({vehicleGroups.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowManualVehicleForm((v) => !v)}
                        style={{ color: infoColor }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{showManualVehicleForm ? 'Cancel' : 'Add vehicle group manually'}</span>
                      </button>
                    </div>

                    {showManualVehicleForm && (
                      <form
                        onSubmit={handleManualVehicleAdd}
                        style={{
                          backgroundColor: theme.bgElevated,
                          borderColor: theme.borderStrong,
                        }}
                        className="mb-4 border p-4 space-y-3"
                      >
                        <div
                          style={{ color: theme.textSecondary }}
                          className="text-xs font-mono-tech uppercase"
                        >
                          Add Manual Vehicle Group
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={manualYear}
                            onChange={(e) => setManualYear(e.target.value)}
                            aria-label="Manual vehicle year"
                            style={inputStyle}
                            className="h-10 rounded-xs border px-2.5 text-xs"
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
                            style={inputStyle}
                            className="h-10 rounded-xs border px-2.5 text-xs"
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
                            style={inputStyle}
                            className="h-10 rounded-xs border px-2.5 text-xs"
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
                            style={inputStyle}
                            className="h-10 rounded-xs border px-2.5 text-xs"
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
                          style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                          className="rounded-xs px-4 py-2 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                        >
                          Add vehicle group
                        </button>
                      </form>
                    )}

                    {vehicleGroups.length === 0 ? (
                      <div
                        style={{
                          backgroundColor: theme.bgSurface,
                          borderColor: theme.borderStrong,
                          color: theme.textSecondary,
                        }}
                        className="border border-dashed p-4 text-xs"
                      >
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
                              style={{
                                backgroundColor: theme.bgSurface,
                                borderColor: theme.border,
                              }}
                              className="border p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Car style={{ color: infoColor }} className="w-4 h-4" aria-hidden="true" />
                                  <div>
                                    <div className="text-sm font-semibold">
                                      {group.year} {group.make} {group.model}
                                    </div>
                                    <div
                                      style={{ color: theme.textMuted }}
                                      className="text-xs font-mono-tech"
                                    >
                                      {group.vehicleClass} · Group {idx + 1}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onRemoveVehicleGroup(group.id)}
                                  aria-label={`Remove vehicle group ${group.year} ${group.make} ${group.model}`}
                                  style={{ color: theme.textMuted }}
                                  className="p-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div
                                data-testid={`vehicle-group-status-${idx}`}
                                style={{
                                  backgroundColor: isVerified
                                    ? theme.badgeVerifiedBg
                                    : theme.badgeWarnBg,
                                  borderColor: isVerified
                                    ? theme.badgeVerifiedBorder
                                    : theme.badgeWarnBorder,
                                  color: isVerified
                                    ? theme.badgeVerifiedText
                                    : theme.badgeWarnText,
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-mono-tech px-2.5 py-1 border"
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
                                    style={{ color: theme.textSecondary }}
                                    className="block text-[11px] font-mono-tech uppercase mb-1"
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
                                    style={inputStyle}
                                    className="w-full h-10 rounded-xs border px-3 text-sm font-mono-tech focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`group-power-${group.id}`}
                                    style={{ color: theme.textSecondary }}
                                    className="block text-[11px] font-mono-tech uppercase mb-1"
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
                                    style={inputStyle}
                                    className="w-full h-10 rounded-xs border px-3 text-sm focus:outline-none"
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

                  {/* Deployment Questions */}
                  <div style={{ borderColor: theme.border }} className="border-t pt-5 space-y-4">
                    <h3
                      style={{ color: infoColor }}
                      className="text-xs font-mono-tech uppercase tracking-wider"
                    >
                      Deployment Parameters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="deploy-install"
                          style={{ color: theme.textSecondary }}
                          className="block text-[11px] font-mono-tech uppercase mb-1"
                        >
                          Installation preference
                        </label>
                        <select
                          id="deploy-install"
                          value={deployment.installationPreference}
                          onChange={(e) =>
                            onUpdateDeployment({ installationPreference: e.target.value })
                          }
                          style={inputStyle}
                          className="w-full h-10 rounded-xs border px-2.5 text-xs"
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
                          style={{ color: theme.textSecondary }}
                          className="block text-[11px] font-mono-tech uppercase mb-1"
                        >
                          Fleet size
                        </label>
                        <select
                          id="deploy-fleet-size"
                          value={deployment.fleetSize}
                          onChange={(e) => onUpdateDeployment({ fleetSize: e.target.value })}
                          style={inputStyle}
                          className="w-full h-10 rounded-xs border px-2.5 text-xs"
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
                          style={{ color: theme.textSecondary }}
                          className="block text-[11px] font-mono-tech uppercase mb-1"
                        >
                          Rollout timeline
                        </label>
                        <select
                          id="deploy-timeline"
                          value={deployment.rolloutTimeline}
                          onChange={(e) => onUpdateDeployment({ rolloutTimeline: e.target.value })}
                          style={inputStyle}
                          className="w-full h-10 rounded-xs border px-2.5 text-xs"
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
                      style={{
                        backgroundColor: theme.badgeWarnBg,
                        borderColor: theme.badgeWarnBorder,
                        color: theme.badgeWarnText,
                      }}
                      className="border p-3 text-xs"
                    >
                      {step1Error}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 02 OF 03: CONTACT */}
              {currentStep === 2 && (
                <form
                  id="step-2-contact-form"
                  onSubmit={handleStep2Continue}
                  className="space-y-5"
                  data-testid="drawer-step-2"
                >
                  <p style={{ color: theme.textSecondary }} className="text-sm">
                    Provide your fleet procurement contact details to assemble the formal RFQ
                    summary.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="contact-full-name"
                        style={{ color: theme.textSecondary }}
                        className="block text-xs font-mono-tech uppercase mb-1.5"
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
                        style={inputStyle}
                        className="w-full h-11 rounded-xs border px-3.5 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-company"
                        style={{ color: theme.textSecondary }}
                        className="block text-xs font-mono-tech uppercase mb-1.5"
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
                        style={inputStyle}
                        className="w-full h-11 rounded-xs border px-3.5 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        style={{ color: theme.textSecondary }}
                        className="block text-xs font-mono-tech uppercase mb-1.5"
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
                        style={inputStyle}
                        className="w-full h-11 rounded-xs border px-3.5 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        style={{ color: theme.textSecondary }}
                        className="block text-xs font-mono-tech uppercase mb-1.5"
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
                        style={inputStyle}
                        className="w-full h-11 rounded-xs border px-3.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {step2Error && (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: theme.badgeWarnBg,
                        borderColor: theme.badgeWarnBorder,
                        color: theme.badgeWarnText,
                      }}
                      className="border p-3 text-xs"
                    >
                      {step2Error}
                    </div>
                  )}
                </form>
              )}

              {/* STEP 03 OF 03: REVIEW & SUBMIT */}
              {currentStep === 3 && (
                <div className="space-y-6" data-testid="drawer-step-3">
                  {/* (01) Hardware */}
                  <div
                    style={{
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.border,
                    }}
                    className="border p-4 space-y-3"
                  >
                    <div
                      style={{ color: infoColor }}
                      className="text-xs font-mono-tech uppercase tracking-wider"
                    >
                      (01) Hardware
                    </div>

                    {lineItems.length === 0 ? (
                      <p style={{ color: theme.textSecondary }} className="text-xs">
                        No hardware line items selected.
                      </p>
                    ) : (
                      <div className="divide-y" style={{ borderColor: theme.border }}>
                        {lineItems.map((item) => {
                          const product = getProductBySku(item.sku);
                          if (!product) return null;
                          const tier = getTierForQuantity(product, item.quantity);
                          const total =
                            tier.unitPrice !== null ? tier.unitPrice * item.quantity : null;
                          return (
                            <div
                              key={item.sku}
                              style={{ borderColor: theme.border }}
                              className="py-2.5 flex items-start justify-between gap-4 text-xs"
                            >
                              <div>
                                <div className="font-semibold">
                                  {product.sku} · {product.name}
                                </div>
                                <div
                                  style={{ color: theme.textSecondary }}
                                  className="font-mono-tech mt-0.5"
                                >
                                  Qty: {item.quantity} · Tier: {tier.label} ·{' '}
                                  {tier.unitPrice !== null
                                    ? `${formatCad(tier.unitPrice)} / ${product.unitLabel}`
                                    : tier.formalQuoteText}
                                </div>
                              </div>
                              <div className="font-mono-tech font-semibold whitespace-nowrap">
                                {total !== null ? formatCad(total) : 'Formal quote'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {installationRequested && (
                      <div
                        style={{ borderColor: theme.border, color: infoColor }}
                        className="border-t pt-2.5 text-xs"
                      >
                        + {clientConfig.deploymentOptions.installationAddon.label}
                      </div>
                    )}

                    <div
                      style={{ borderColor: theme.border }}
                      className="border-t pt-3 flex items-center justify-between text-sm font-mono-tech"
                    >
                      <span style={{ color: theme.textSecondary }}>
                        Estimated Tiered Hardware Subtotal
                      </span>
                      <span className="font-bold">
                        {formatCad(pricedSubtotal)}
                        {hasFormalQuoteLine ? ' + formal quote items' : ''}
                      </span>
                    </div>
                  </div>

                  {/* (02) Vehicle Groups & Deployment */}
                  <div
                    style={{
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.border,
                    }}
                    className="border p-4 space-y-3"
                  >
                    <div
                      style={{ color: infoColor }}
                      className="text-xs font-mono-tech uppercase tracking-wider"
                    >
                      (02) Vehicle Groups &amp; Deployment
                    </div>

                    {vehicleGroups.length === 0 ? (
                      <p style={{ color: theme.badgeWarnText }} className="text-xs">
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
                              style={{
                                backgroundColor: theme.bgCanvas,
                                borderColor: theme.border,
                              }}
                              className="border p-3 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">
                                  {group.year} {group.make} {group.model} ({group.vehicleClass})
                                </span>
                                <span
                                  style={{ color: theme.textSecondary }}
                                  className="font-mono-tech"
                                >
                                  {group.vehicleCount} vehicle{group.vehicleCount === 1 ? '' : 's'}
                                </span>
                              </div>
                              <div
                                style={{ color: theme.textSecondary }}
                                className="font-mono-tech"
                              >
                                Power source:{' '}
                                <span style={{ color: theme.textPrimary }}>{group.powerSource}</span>
                              </div>
                              <div
                                style={{
                                  color: isVerified
                                    ? theme.badgeVerifiedText
                                    : theme.badgeWarnText,
                                }}
                                className="inline-flex items-center gap-1.5 font-mono-tech text-[11px]"
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

                    <div
                      style={{ borderColor: theme.border }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-3 text-xs"
                    >
                      <div>
                        <div style={{ color: theme.textMuted }}>Installation preference</div>
                        <div className="mt-0.5">{deployment.installationPreference}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted }}>Fleet size</div>
                        <div className="mt-0.5">{deployment.fleetSize}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted }}>Rollout timeline</div>
                        <div className="mt-0.5">{deployment.rolloutTimeline}</div>
                      </div>
                    </div>
                  </div>

                  {/* (03) Contact Details */}
                  <div
                    style={{
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.border,
                    }}
                    className="border p-4 space-y-2"
                  >
                    <div
                      style={{ color: infoColor }}
                      className="text-xs font-mono-tech uppercase tracking-wider"
                    >
                      (03) Contact Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: theme.textMuted }}>Full name: </span>
                        <span>{contact.fullName}</span>
                      </div>
                      <div>
                        <span style={{ color: theme.textMuted }}>Company: </span>
                        <span>{contact.companyName}</span>
                      </div>
                      <div>
                        <span style={{ color: theme.textMuted }}>Work email: </span>
                        <span>{contact.workEmail}</span>
                      </div>
                      <div>
                        <span style={{ color: theme.textMuted }}>Phone: </span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Policy Links */}
                  <div
                    style={{
                      backgroundColor: theme.bgElevated,
                      borderColor: theme.border,
                    }}
                    className="border p-4 space-y-2"
                  >
                    <div
                      style={{ color: theme.textSecondary }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider"
                    >
                      <ShieldCheck style={{ color: infoColor }} className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Buyer Policies (Sample Demo Terms)</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                      {clientConfig.policies.map((pol) => (
                        <button
                          key={pol.id}
                          type="button"
                          onClick={() => onOpenPolicy(pol)}
                          style={{ color: infoColor }}
                          className="hover:underline underline-offset-4 cursor-pointer"
                        >
                          {pol.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: theme.badgeWarnBg,
                        borderColor: theme.badgeWarnBorder,
                        color: theme.badgeWarnText,
                      }}
                      className="border p-3 text-xs"
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
          <div
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            }}
            className="border-t px-6 py-4 flex items-center justify-between gap-3"
          >
            {currentStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ color: theme.textSecondary }}
                  className="text-xs font-medium cursor-pointer"
                >
                  Continue browsing
                </button>
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  data-testid="step1-continue-btn"
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="inline-flex items-center gap-2 rounded-xs px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
                  style={{ color: theme.textSecondary }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Back to Deployment</span>
                </button>
                <button
                  type="submit"
                  form="step-2-contact-form"
                  data-testid="step2-continue-btn"
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="inline-flex items-center gap-2 rounded-xs px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
                  style={{ color: theme.textSecondary }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Edit Contact</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitRfq}
                  data-testid="submit-rfq-btn"
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="inline-flex items-center gap-2 rounded-xs px-6 py-2.5 text-xs font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
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

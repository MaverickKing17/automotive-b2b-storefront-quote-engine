import React, { useEffect, useRef } from 'react';
import { X, Plus, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  evaluateVehicleFitment,
  formatCad,
  getNormalizedProductMetadata,
  type CatalogProduct,
} from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';
import type { VehicleGroup } from '../types/quote';

interface ProductSpecsModalProps {
  theme: StorefrontTheme;
  product: CatalogProduct | null;
  vehicleGroups?: VehicleGroup[];
  onClose: () => void;
  onAddToQuote: (sku: string) => void;
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  theme,
  product,
  vehicleGroups = [],
  onClose,
  onAddToQuote,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!product) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      prevFocused?.focus?.();
    };
  }, [product, onClose]);

  if (!product) return null;

  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;
  const meta = getNormalizedProductMetadata(product);

  const isDepotProduct = product.category === 'EV Power & Diagnostics';
  const groupEvaluations = vehicleGroups.map((g) => ({
    group: g,
    eval: evaluateVehicleFitment(g, g.powerSource, product.sku),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="specs-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: theme.bgCanvas,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
        className="w-full max-w-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.border,
          }}
          className="flex items-start justify-between gap-4 border-b px-4 sm:px-6 py-4"
        >
          <div>
            <p style={{ color: infoColor }} className="text-xs font-mono-tech uppercase tracking-wider">
              {product.sku} · {product.category}
            </p>
            <h3 id="specs-modal-title" className="font-display text-xl font-bold mt-1">
              {product.name}
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close specifications dialog"
            style={{ color: theme.textSecondary }}
            className="inline-flex items-center justify-center w-10 h-10 -mr-1.5 cursor-pointer hover:opacity-80 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div
              style={{ borderColor: theme.border }}
              className="sm:col-span-5 aspect-[4/3] border bg-[#121519] overflow-hidden"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7 space-y-2.5">
              <p style={{ color: theme.textSecondary }} className="text-sm leading-relaxed">
                {product.description}
              </p>
              <div
                style={{ borderColor: theme.border, backgroundColor: theme.bgSurface }}
                className="border p-3 text-xs space-y-1.5"
              >
                <div>
                  <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase">
                    Model ID:{' '}
                  </span>
                  <span style={{ color: theme.textPrimary }}>{meta.model}</span>
                </div>
                <div>
                  <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase">
                    Manufacturer / Supplier:{' '}
                  </span>
                  <span style={{ color: theme.textPrimary }}>{meta.manufacturer}</span>
                </div>
                <div>
                  <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase">
                    Installation:{' '}
                  </span>
                  <span style={{ color: theme.textPrimary }}>{meta.installationRequirements}</span>
                </div>
                <div>
                  <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase">
                    Accessories:{' '}
                  </span>
                  <span style={{ color: theme.textPrimary }}>{meta.accessoryRequirements.note}</span>
                </div>
                <div>
                  <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase">
                    Approval Status:{' '}
                  </span>
                  <span style={{ color: theme.badgeWarnText }}>
                    Demonstration sample data only — no supplier-approved certifications or binding OEM fitment attached.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Compatibility Status */}
          <div>
            <h4
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-wider mb-2.5"
            >
              Vehicle Compatibility Status (Sample Fitment Matrix)
            </h4>
            <div
              style={{ backgroundColor: theme.bgSurface, borderColor: theme.border }}
              className="border p-3.5 text-xs space-y-2"
            >
              {isDepotProduct && groupEvaluations.length === 0 ? (
                <div className="flex items-start gap-2" style={{ color: theme.badgeWarnText }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{meta.compatibilityProfile.scopeNote}</span>
                </div>
              ) : groupEvaluations.length === 0 ? (
                <div className="flex items-start gap-2" style={{ color: theme.badgeWarnText }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Requires confirmation — no vehicle group attached. {meta.compatibilityProfile.scopeNote}
                  </span>
                </div>
              ) : (
                groupEvaluations.map(({ group, eval: res }) => (
                  <div
                    key={group.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 pb-2 last:pb-0"
                    style={{ borderColor: theme.border }}
                  >
                    <span className="font-medium">
                      {group.year} {group.make} {group.model} ({group.vehicleClass})
                    </span>
                    <span
                      style={{
                        color:
                          res.status === 'verified'
                            ? theme.badgeVerifiedText
                            : res.status === 'not-compatible'
                              ? theme.isLight
                                ? '#B91C1C'
                                : '#F87171'
                              : theme.badgeWarnText,
                      }}
                      className="inline-flex items-center gap-1 font-mono-tech font-semibold"
                    >
                      {res.status === 'verified' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : res.status === 'not-compatible' ? (
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{res.headlineBadge}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-wider mb-3"
            >
              Published Technical Specifications (Sample Demo Data)
            </h4>
            <div style={{ borderColor: theme.border }} className="border divide-y">
              {product.fullSpecs.map((spec) => (
                <div
                  key={spec.label}
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2.5 text-sm"
                >
                  <span style={{ color: theme.textSecondary }}>{spec.label}</span>
                  <span style={{ color: theme.textPrimary }} className="font-mono-tech sm:text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-wider mb-3"
            >
              Volume Pricing Tiers (Sample CAD · Per {product.unitLabel})
            </h4>
            <div style={{ borderColor: theme.border }} className="border overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                    color: theme.textSecondary,
                  }}
                  className="border-b text-xs font-mono-tech uppercase"
                >
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Quantity Tier</th>
                    <th className="px-4 py-2.5 font-medium text-right">Rate (CAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.border }}>
                  {product.tiers.map((tier) => (
                    <tr
                      key={tier.id}
                      style={{ backgroundColor: theme.bgCanvas, borderColor: theme.border }}
                    >
                      <td className="px-4 py-3 font-mono-tech">{tier.label}</td>
                      <td className="px-4 py-3 font-mono-tech text-right">
                        {tier.unitPrice !== null
                          ? `${formatCad(tier.unitPrice)} / ${product.unitLabel}`
                          : tier.formalQuoteText}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{ borderColor: theme.border }}
            className="flex flex-wrap items-center justify-end gap-3 border-t pt-4"
          >
            <button
              type="button"
              onClick={onClose}
              style={{ color: theme.textSecondary }}
              className="px-4 py-2 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            {product.recommendedHarnessSku && (
              <button
                type="button"
                onClick={() => {
                  onAddToQuote(product.recommendedHarnessSku!);
                  onClose();
                }}
                style={{
                  borderColor: theme.borderStrong,
                  color: infoColor,
                }}
                className="inline-flex items-center gap-1.5 rounded-xs border px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add {product.recommendedHarnessSku} Harness</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onAddToQuote(product.sku);
                onClose();
              }}
              style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
              className="inline-flex items-center gap-1.5 rounded-xs px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Request a Quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

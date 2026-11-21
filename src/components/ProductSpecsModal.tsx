import React from 'react';
import { X, Plus } from 'lucide-react';
import { formatCad, type CatalogProduct } from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';

interface ProductSpecsModalProps {
  theme: StorefrontTheme;
  product: CatalogProduct | null;
  onClose: () => void;
  onAddToQuote: (sku: string) => void;
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  theme,
  product,
  onClose,
  onAddToQuote,
}) => {
  if (!product) return null;

  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="specs-modal-title"
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
          className="flex items-start justify-between gap-4 border-b px-6 py-4"
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
            type="button"
            onClick={onClose}
            aria-label="Close specifications dialog"
            style={{ color: theme.textSecondary }}
            className="p-2 cursor-pointer hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div
              style={{ borderColor: theme.border }}
              className="sm:col-span-5 aspect-[4/3] border bg-[#121519] overflow-hidden"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7">
              <p style={{ color: theme.textSecondary }} className="text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          <div>
            <h4
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-wider mb-3"
            >
              Published Technical Specifications
            </h4>
            <div
              style={{ borderColor: theme.border }}
              className="border divide-y"
            >
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
              Volume Pricing Tiers (CAD · Per {product.unitLabel})
            </h4>
            <div style={{ borderColor: theme.border }} className="border overflow-hidden">
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
            className="flex items-center justify-end gap-4 border-t pt-4"
          >
            <button
              type="button"
              onClick={onClose}
              style={{ color: theme.textSecondary }}
              className="px-4 py-2 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
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
              <span>Add to quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

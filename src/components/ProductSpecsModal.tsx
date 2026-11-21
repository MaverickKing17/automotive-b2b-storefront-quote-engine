import React from 'react';
import { X, Plus } from 'lucide-react';
import { formatCad, type CatalogProduct } from '../data/clientConfig';

interface ProductSpecsModalProps {
  product: CatalogProduct | null;
  onClose: () => void;
  onAddToQuote: (sku: string) => void;
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  product,
  onClose,
  onAddToQuote,
}) => {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="specs-modal-title"
    >
      <div className="w-full max-w-2xl border border-[#343C46] bg-[#171A1D] text-[#F2EFE9] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-[#2B3138] px-6 py-4 bg-[#1D2126]">
          <div>
            <p className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
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
            className="p-2 text-[#A7B0BC] hover:text-[#F2EFE9] border border-transparent hover:border-[#343C46] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 aspect-[4/3] border border-[#2B3138] bg-[#121519] overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7">
              <p className="text-sm text-[#A7B0BC] leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Published Specifications */}
          <div>
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE] mb-3">
              Published Technical Specifications
            </h4>
            <div className="border border-[#2B3138] divide-y divide-[#2B3138]">
              {product.fullSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2.5 text-sm bg-[#1D2126]/60"
                >
                  <span className="text-[#A7B0BC]">{spec.label}</span>
                  <span className="font-mono-tech text-[#F2EFE9] sm:text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Tier Pricing Table */}
          <div>
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE] mb-3">
              Volume Pricing Tiers (CAD · Per {product.unitLabel})
            </h4>
            <div className="border border-[#2B3138] overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1D2126] border-b border-[#2B3138] text-xs font-mono-tech uppercase text-[#A7B0BC]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Quantity Tier</th>
                    <th className="px-4 py-2.5 font-medium text-right">Rate (CAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3138]">
                  {product.tiers.map((tier) => (
                    <tr key={tier.id} className="bg-[#171A1D]">
                      <td className="px-4 py-3 font-mono-tech text-[#F2EFE9]">{tier.label}</td>
                      <td className="px-4 py-3 font-mono-tech text-right text-[#F2EFE9]">
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

          <div className="flex items-center justify-end gap-4 border-t border-[#2B3138] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A7B0BC] hover:text-[#F2EFE9] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToQuote(product.sku);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#F59E0B] px-5 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer"
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

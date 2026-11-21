import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import {
  clientConfig,
  formatCad,
  getTier1Price,
  type CatalogProduct,
} from '../data/clientConfig';
import type { QuoteLineItem } from '../types/quote';
import { ProductSchematic } from './BlueprintArtwork';

interface HardwareCatalogProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  lineItems: QuoteLineItem[];
  onAddToQuote: (sku: string) => void;
  onViewSpecs: (product: CatalogProduct) => void;
}

const ProductCardMedia: React.FC<{ product: CatalogProduct }> = ({ product }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed || !product.imageUrl) {
    return <ProductSchematic sku={product.sku} />;
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-[#121519] border-b border-[#262C34] overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1D2126]/65 via-transparent to-transparent pointer-events-none" />
      <span className="absolute top-3 left-3 text-[10px] font-mono-tech tracking-wider text-[#F2EFE9] bg-[#14171A]/85 border border-[#2B3138] px-2 py-0.5">
        {product.sku}
      </span>
    </div>
  );
};

export const HardwareCatalog: React.FC<HardwareCatalogProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  lineItems,
  onAddToQuote,
  onViewSpecs,
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = clientConfig.products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All Hardware' || p.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;
    const haystack = [
      p.sku,
      p.name,
      p.category,
      p.description,
      p.specs.power,
      p.specs.interface,
      p.specs.ipRating,
      ...p.keywords,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const getQtyInQuote = (sku: string) =>
    lineItems.find((item) => item.sku === sku)?.quantity ?? 0;

  return (
    <section id="hardware" className="border-b border-[#2B3138] bg-[#171A1D]">
      <div className="mx-auto max-w-[1360px] px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono-tech uppercase tracking-[0.16em] text-[#22D3EE]">
              02 · Hardware Catalog
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE9] mt-1">
              Commercial Fleet Hardware
            </h2>
            <p className="mt-2 text-sm text-[#A7B0BC]">
              {clientConfig.catalogHeaderLine}
            </p>
          </div>
          <span className="text-xs font-mono-tech text-[#76808D]">
            {clientConfig.brand.demoNote}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter hardware by category"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B3138] pb-4 mb-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            {clientConfig.categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectCategory(cat)}
                  className={`rounded-xs px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#23282E] text-[#22D3EE] border border-[#22D3EE]/50'
                      : 'bg-transparent text-[#A7B0BC] border border-[#2B3138] hover:border-[#343C46] hover:text-[#F2EFE9]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {normalizedQuery && (
            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#A7B0BC]">
              <span>
                Filter: <span className="text-[#22D3EE]">&ldquo;{searchQuery}&rdquo;</span>
              </span>
              <button
                type="button"
                onClick={onClearSearch}
                className="text-[#F2EFE9] underline underline-offset-4 hover:text-[#22D3EE] cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-[#2B3138] bg-[#1D2126] p-8 text-center space-y-3">
            <p className="text-sm text-[#A7B0BC]">
              No hardware SKUs matched &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
            </p>
            <button
              type="button"
              onClick={() => {
                onClearSearch();
                onSelectCategory('All Hardware');
              }}
              className="rounded-xs border border-[#343C46] px-4 py-2 text-xs font-semibold text-[#F2EFE9] hover:border-[#22D3EE] cursor-pointer"
            >
              Reset catalog filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const tier1Price = getTier1Price(product);
              const qtyInQuote = getQtyInQuote(product.sku);

              return (
                <article
                  key={product.sku}
                  data-testid={`product-card-${product.sku}`}
                  className="group flex flex-col border border-[#2B3138] bg-[#1D2126] hover:border-[#3A434E] transition-colors"
                >
                  <ProductCardMedia product={product} />

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
                      <span className="text-[#22D3EE] font-semibold">{product.sku}</span>
                      <span className="text-[#76808D]">{product.category}</span>
                    </div>

                    <h3 className="mt-2 font-display text-lg font-semibold text-[#F2EFE9] leading-snug">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-[#A7B0BC] leading-relaxed">
                      {product.description}
                    </p>

                    {/* Spec Cells (Power / Interface / IP rating) */}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#262C34] py-3 text-[11px] font-mono-tech">
                      <div>
                        <div className="text-[#76808D] uppercase">Power</div>
                        <div className="text-[#F2EFE9] mt-0.5 truncate" title={product.specs.power}>
                          {product.specs.power}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#76808D] uppercase">Interface</div>
                        <div className="text-[#F2EFE9] mt-0.5 truncate" title={product.specs.interface}>
                          {product.specs.interface}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#76808D] uppercase">Rating</div>
                        <div className="text-[#F2EFE9] mt-0.5 truncate" title={product.specs.ipRating}>
                          {product.specs.ipRating}
                        </div>
                      </div>
                    </div>

                    {/* Pricing from Tier 1 */}
                    <div className="mt-4 flex items-baseline justify-between gap-2">
                      <div>
                        <div className="font-mono-tech text-base font-semibold text-[#F2EFE9]">
                          From {formatCad(tier1Price)} / {product.unitLabel}
                        </div>
                        <div className="text-xs text-[#76808D] mt-0.5">
                          Volume tiers available
                        </div>
                      </div>
                      {qtyInQuote > 0 && (
                        <span className="text-xs font-mono-tech text-[#22D3EE]">
                          In quote: {qtyInQuote}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onAddToQuote(product.sku)}
                        data-testid={`add-to-quote-${product.sku}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xs bg-[#F59E0B] px-4 py-2.5 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Add to quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewSpecs(product)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A7B0BC] hover:text-[#22D3EE] underline underline-offset-4 decoration-[#343C46] hover:decoration-[#22D3EE] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View specs &amp; tiers</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

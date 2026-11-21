import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import {
  clientConfig,
  formatCad,
  getTier1Price,
  type CatalogProduct,
} from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';
import type { QuoteLineItem } from '../types/quote';
import { ProductSchematic } from './BlueprintArtwork';

interface HardwareCatalogProps {
  theme: StorefrontTheme;
  products: CatalogProduct[];
  categories: string[];
  demoNote?: string;
  catalogKicker?: string;
  catalogTitle?: string;
  catalogSubtitle?: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  lineItems: QuoteLineItem[];
  onAddToQuote: (sku: string) => void;
  onViewSpecs: (product: CatalogProduct) => void;
}

const ProductCardMedia: React.FC<{
  product: CatalogProduct;
  theme: StorefrontTheme;
}> = ({ product, theme }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed || !product.imageUrl) {
    return <ProductSchematic sku={product.sku} />;
  }

  return (
    <div
      style={{ borderColor: theme.border }}
      className="relative aspect-[4/3] w-full bg-[#121519] border-b overflow-hidden"
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
      />
      <span
        style={{
          backgroundColor: theme.isLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,23,26,0.88)',
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
        className="absolute top-3 left-3 text-[10px] font-mono-tech tracking-wider border px-2 py-0.5"
      >
        {product.sku}
      </span>
    </div>
  );
};

export const HardwareCatalog: React.FC<HardwareCatalogProps> = ({
  theme,
  products,
  categories,
  demoNote = clientConfig.brand.demoNote,
  catalogKicker = '02 · Hardware Catalog',
  catalogTitle = 'Commercial Fleet Hardware',
  catalogSubtitle,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  lineItems,
  onAddToQuote,
  onViewSpecs,
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((p) => {
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
    <section
      id="hardware"
      style={{
        backgroundColor: theme.bgCanvas,
        borderColor: theme.border,
      }}
      className="border-b scroll-mt-16"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p
              style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
              className="text-xs font-mono-tech uppercase tracking-[0.16em]"
            >
              {catalogKicker}
            </p>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-2xl sm:text-3xl font-bold mt-1"
            >
              {catalogTitle}
            </h2>
            <p style={{ color: theme.textSecondary }} className="mt-2 text-sm">
              {catalogSubtitle ?? clientConfig.catalogHeaderLine}
            </p>
          </div>
          <span style={{ color: theme.textMuted }} className="text-xs font-mono-tech">
            {demoNote}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter hardware by category"
          style={{ borderColor: theme.border }}
          className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              const activeAccent = theme.isLight ? theme.accentPrimary : theme.accentInfo;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectCategory(cat)}
                  style={
                    active
                      ? {
                          backgroundColor: theme.bgElevated,
                          color: activeAccent,
                          borderColor: `${activeAccent}88`,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: theme.textSecondary,
                          borderColor: theme.border,
                        }
                  }
                  className="rounded-xs border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {normalizedQuery && (
            <div className="flex items-center gap-2 text-xs font-mono-tech">
              <span style={{ color: theme.textSecondary }}>
                Filter:{' '}
                <span style={{ color: theme.accentInfo }}>&ldquo;{searchQuery}&rdquo;</span>
              </span>
              <button
                type="button"
                onClick={onClearSearch}
                style={{ color: theme.textPrimary }}
                className="underline underline-offset-4 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            }}
            className="border p-8 text-center space-y-3"
          >
            <p style={{ color: theme.textSecondary }} className="text-sm">
              No hardware SKUs matched &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
            </p>
            <button
              type="button"
              onClick={() => {
                onClearSearch();
                onSelectCategory('All Hardware');
              }}
              style={{
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
              className="rounded-xs border px-4 py-2 text-xs font-semibold cursor-pointer"
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
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                  }}
                  className="group flex flex-col rounded-xl overflow-hidden border transition-all hover:border-[#22D3EE]/40 hover:shadow-lg"
                >
                  <ProductCardMedia product={product} theme={theme} />

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
                      <span
                        style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                        className="font-semibold"
                      >
                        {product.sku}
                      </span>
                      <span style={{ color: theme.textMuted }}>{product.category}</span>
                    </div>

                    <h3
                      style={{ color: theme.textPrimary }}
                      className="mt-2 font-display text-lg font-semibold leading-snug"
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{ color: theme.textSecondary }}
                      className="mt-2 text-sm leading-relaxed"
                    >
                      {product.description}
                    </p>

                    {/* Spec Cells (Power / Interface / IP rating) */}
                    <div
                      style={{ borderColor: theme.border }}
                      className="mt-4 grid grid-cols-3 gap-2 border-y py-3 text-[11px] font-mono-tech"
                    >
                      <div>
                        <div style={{ color: theme.textMuted }} className="uppercase">
                          Power
                        </div>
                        <div
                          style={{ color: theme.textPrimary }}
                          className="mt-0.5 truncate"
                          title={product.specs.power}
                        >
                          {product.specs.power}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted }} className="uppercase">
                          Interface
                        </div>
                        <div
                          style={{ color: theme.textPrimary }}
                          className="mt-0.5 truncate"
                          title={product.specs.interface}
                        >
                          {product.specs.interface}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted }} className="uppercase">
                          Rating
                        </div>
                        <div
                          style={{ color: theme.textPrimary }}
                          className="mt-0.5 truncate"
                          title={product.specs.ipRating}
                        >
                          {product.specs.ipRating}
                        </div>
                      </div>
                    </div>

                    {/* Pricing from Tier 1 */}
                    <div className="mt-4 flex items-baseline justify-between gap-2">
                      <div>
                        <div
                          style={{ color: theme.textPrimary }}
                          className="font-mono-tech text-base font-semibold"
                        >
                          From {formatCad(tier1Price)} / {product.unitLabel}
                        </div>
                        <div style={{ color: theme.textMuted }} className="text-xs mt-0.5">
                          Volume tiers available (sample data)
                        </div>
                      </div>
                      {qtyInQuote > 0 && (
                        <span
                          style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                          className="text-xs font-mono-tech font-semibold"
                        >
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
                        style={{
                          backgroundColor: theme.ctaBg,
                          color: theme.ctaText,
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Add to quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewSpecs(product)}
                        style={{ color: theme.textSecondary }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
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

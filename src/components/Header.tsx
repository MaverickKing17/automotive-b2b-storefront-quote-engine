import React, { useState } from 'react';
import { ClipboardList, Search, X, Menu } from 'lucide-react';
import type { StorefrontConfig } from '../data/storefronts';
import { StorefrontLogo } from './BlueprintArtwork';

interface HeaderProps {
  storefront: StorefrontConfig;
  lineItemCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storefront,
  lineItemCount,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenDrawer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = storefront;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      style={{
        backgroundColor: theme.headerBg,
        borderColor: theme.border,
        color: theme.textPrimary,
      }}
      className="sticky top-0 z-30 border-b backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-4 sm:px-6 py-3">
        {/* Zone 1: Top-Left Logo + Brand Name */}
        <a
          href="#top"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none"
        >
          <StorefrontLogo storefront={storefront} />
          <span
            style={{ color: theme.textPrimary }}
            className="font-display text-sm sm:text-base font-bold tracking-wider uppercase"
          >
            {storefront.brandName}
          </span>
        </a>

        {/* Zone 2: Desktop Navigation */}
        <nav
          aria-label="Storefront navigation"
          style={{ color: theme.textSecondary }}
          className="hidden lg:flex items-center gap-5 text-[13px] font-medium"
        >
          {storefront.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                if (link.category) {
                  onSelectCategory(link.category);
                }
              }}
              className="whitespace-nowrap shrink-0 py-1 hover:opacity-100 opacity-85 transition-opacity"
              style={{ color: theme.textSecondary }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Search + Quote List Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <Search
              style={{ color: theme.textMuted }}
              className="w-3.5 h-3.5 absolute left-3 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search hardware catalog"
              style={{
                backgroundColor: theme.bgInput,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
              className="w-44 xl:w-56 h-9 rounded-xs border pl-8 pr-7 text-xs focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                style={{ color: theme.textMuted }}
                className="absolute right-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={onOpenDrawer}
            data-testid="header-quote-list-btn"
            style={{
              backgroundColor: theme.ctaBg,
              color: theme.ctaText,
            }}
            className="inline-flex items-center gap-2 rounded-xs px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>{storefront.quoteButtonLabel}</span>
            <span className="font-mono-tech font-bold" data-testid="quote-line-item-count">
              ({lineItemCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
            className="lg:hidden p-2 border rounded-xs cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.border,
          }}
          className="lg:hidden border-t px-4 py-3 space-y-3"
        >
          <form onSubmit={handleSearchSubmit} className="md:hidden relative">
            <Search
              style={{ color: theme.textMuted }}
              className="w-3.5 h-3.5 absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search hardware catalog mobile"
              style={{
                backgroundColor: theme.bgInput,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
              className="w-full h-9 rounded-xs border pl-8 pr-3 text-xs focus:outline-none"
            />
          </form>
          <div className="flex flex-wrap gap-3">
            {storefront.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  if (link.category) onSelectCategory(link.category);
                  setMobileMenuOpen(false);
                }}
                style={{ color: theme.textPrimary }}
                className="text-xs font-medium py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

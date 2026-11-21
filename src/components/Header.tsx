import React, { useState } from 'react';
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
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
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Zone 1: Top-Left Logo + Stacked Brand Wordmark */}
        <a
          href="#top"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none"
        >
          <StorefrontLogo storefront={storefront} />
          <span className="flex flex-col leading-none">
            <span
              style={{ color: theme.textPrimary }}
              className="font-display text-sm sm:text-[15px] font-bold tracking-[0.12em] uppercase"
            >
              ASTRATEQ
            </span>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] font-medium tracking-[0.28em] uppercase mt-0.5"
            >
              GADGETS
            </span>
          </span>
        </a>

        {/* Zone 2: Compact Horizontal Nav Links */}
        <nav
          aria-label="Storefront navigation"
          style={{ color: theme.textSecondary }}
          className="hidden lg:flex items-center gap-6 text-[13px] font-medium"
        >
          {storefront.navLinks.map((link) => {
            const hasChevron = link.label !== 'About';
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  if (link.category) {
                    onSelectCategory(link.category);
                  }
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 hover:text-white transition-colors"
                style={{ color: theme.textSecondary }}
              >
                <span>{link.label}</span>
                {hasChevron && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Search + Account Icon + Quote List */}
        <div className="flex items-center gap-2.5 shrink-0">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <Search
              style={{ color: theme.textMuted }}
              className="w-3.5 h-3.5 absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search hardware catalog"
              style={{
                backgroundColor: '#0D1522',
                borderColor: '#1E2C40',
                color: theme.textPrimary,
              }}
              className="w-48 xl:w-64 h-9 rounded-full border pl-9 pr-8 text-xs focus:outline-none focus:border-[#22D3EE]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                style={{ color: theme.textMuted }}
                className="absolute right-3 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open fleet quote account details"
            title="Fleet Quote Account"
            style={{
              backgroundColor: '#0D1522',
              borderColor: '#1E2C40',
              color: theme.textSecondary,
            }}
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border hover:text-white hover:border-[#2A3D58] transition-colors cursor-pointer shrink-0"
          >
            <User className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenDrawer}
            data-testid="header-quote-list-btn"
            style={{
              backgroundColor: theme.ctaBg,
              color: theme.ctaText,
            }}
            className="inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 h-9 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
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
            className="lg:hidden p-2 border rounded-full cursor-pointer"
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
              className="w-3.5 h-3.5 absolute left-3.5 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search hardware catalog mobile"
              style={{
                backgroundColor: '#0D1522',
                borderColor: '#1E2C40',
                color: theme.textPrimary,
              }}
              className="w-full h-9 rounded-full border pl-9 pr-3 text-xs focus:outline-none"
            />
          </form>
          <div className="flex flex-wrap gap-4">
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

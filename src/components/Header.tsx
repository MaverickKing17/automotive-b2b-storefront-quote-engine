import React, { useState } from 'react';
import { ChevronDown, MapPin, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
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
  const isAstrateq = storefront.id === 'astrateq';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeaderActionClick = () => {
    if (storefront.id === 'truenorth') {
      const el = document.getElementById('locations');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onOpenDrawer();
  };

  const searchPlaceholder =
    storefront.id === 'voltdepot' || storefront.id === 'truenorth'
      ? 'Search...'
      : 'Search products...';

  const iconButtonStyle: React.CSSProperties = theme.isLight
    ? {
        backgroundColor: '#F8FAFC',
        borderColor: '#DCE3EC',
        color: '#334155',
      }
    : {
        backgroundColor: '#0B121D',
        borderColor: '#1E2B3E',
        color: '#CBD5E1',
      };

  return (
    <header
      style={{
        backgroundColor: isAstrateq ? '#070C14' : theme.headerBg,
        borderColor: isAstrateq ? '#182334' : theme.border,
        color: theme.textPrimary,
      }}
      className="sticky top-0 z-30 border-b backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Left Cluster: Logo + Stacked Wordmark + Nav Links */}
        <div className="flex items-center gap-7 lg:gap-10">
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
                {storefront.brandTitleMain}
              </span>
              <span
                style={{ color: theme.textSecondary }}
                className="text-[9.5px] font-medium tracking-[0.28em] uppercase mt-0.5"
              >
                {storefront.brandTitleSub}
              </span>
            </span>
          </a>

          <nav
            aria-label="Storefront navigation"
            className="hidden lg:flex items-center gap-6 text-[13px] font-medium"
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
                style={{ color: theme.isLight ? theme.textSecondary : '#CBD5E1' }}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 hover:opacity-100 opacity-90 transition-opacity"
              >
                <span>{link.label}</span>
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Cluster: Search Field + Account Icon + Quote Cart Icon + Optional Storefront Pill */}
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
              placeholder={searchPlaceholder}
              aria-label="Search hardware catalog"
              style={{
                backgroundColor: theme.isLight ? '#F8FAFC' : '#0B121D',
                borderColor: theme.isLight ? '#DCE3EC' : '#1E2B3E',
                color: theme.textPrimary,
              }}
              className="w-48 xl:w-60 h-9 rounded-full border pl-9 pr-8 text-xs focus:outline-none"
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
            aria-label="Fleet account and quote contact details"
            title="Fleet Quote Account"
            style={iconButtonStyle}
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border hover:opacity-85 transition-opacity cursor-pointer shrink-0"
          >
            <User className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenDrawer}
            data-testid="header-quote-list-btn"
            aria-label={`Open Quote List (${lineItemCount} line items)`}
            title={`Quote List (${lineItemCount} items)`}
            style={iconButtonStyle}
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border hover:opacity-85 transition-opacity cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            <span
              data-testid="quote-line-item-count"
              style={{
                backgroundColor: theme.isLight ? theme.accentPrimary : isAstrateq ? theme.accentInfo : theme.ctaBg,
                color: theme.isLight ? '#FFFFFF' : isAstrateq ? '#06131D' : theme.ctaText,
              }}
              className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-mono-tech font-bold flex items-center justify-center leading-none"
            >
              {lineItemCount}
            </span>
          </button>

          {storefront.headerActionLabel && (
            <button
              type="button"
              onClick={handleHeaderActionClick}
              style={{
                backgroundColor: theme.ctaBg,
                color: theme.ctaText,
              }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
            >
              {storefront.id === 'truenorth' && (
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{storefront.headerActionLabel}</span>
            </button>
          )}

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
              placeholder={searchPlaceholder}
              aria-label="Search hardware catalog mobile"
              style={{
                backgroundColor: theme.bgInput,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
              className="w-full h-9 rounded-full border pl-9 pr-3 text-xs focus:outline-none"
            />
          </form>
          <div className="flex flex-wrap items-center gap-4">
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

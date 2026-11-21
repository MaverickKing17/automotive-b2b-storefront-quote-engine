import React, { useState } from 'react';
import { ClipboardList, Search, X } from 'lucide-react';
import { clientConfig } from '../data/clientConfig';
import { BrandMark } from './BlueprintArtwork';

interface HeaderProps {
  lineItemCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lineItemCount,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenDrawer,
}) => {
  const [logoError, setLogoError] = useState(false);
  const navCategories = clientConfig.categories.filter((c) => c !== 'All Hardware');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#262C34] bg-[#0F1318]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-6 py-3">
        {/* Zone 1: Top-Left Logo + Brand Wordmark */}
        <a
          href="#top"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
        >
          {!logoError && clientConfig.brand.logoUrl ? (
            <img
              src={clientConfig.brand.logoUrl}
              alt={`${clientConfig.brand.name} logo`}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-9 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <BrandMark className="w-8 h-8" />
          )}
          <span className="font-display text-sm sm:text-base font-bold tracking-wider uppercase text-[#F2EFE9]">
            {clientConfig.brand.name}
          </span>
        </a>

        {/* Zone 2: Category Nav */}
        <nav
          aria-label="Hardware categories"
          className="hidden xl:flex items-center gap-5 text-[13px] font-medium text-[#A7B0BC]"
        >
          {navCategories.map((category) => (
            <a
              key={category}
              href="#hardware"
              onClick={() => onSelectCategory(category)}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#F2EFE9] border-b border-transparent hover:border-[#22D3EE] transition-colors"
            >
              {category}
            </a>
          ))}
          <a
            href="#fitment"
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#F2EFE9] border-b border-transparent hover:border-[#22D3EE] transition-colors"
          >
            Fitment
          </a>
        </nav>

        {/* Zone 3: Search Input + Amber Quote List Button */}
        <div className="flex items-center gap-3 shrink-0">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <Search
              className="w-3.5 h-3.5 text-[#76808D] absolute left-3 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search hardware catalog"
              className="w-48 lg:w-60 h-9 rounded-xs border border-[#2B3138] bg-[#171A1D] pl-8 pr-7 text-xs text-[#F2EFE9] placeholder:text-[#76808D] focus:border-[#22D3EE] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 text-[#76808D] hover:text-[#F2EFE9] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={onOpenDrawer}
            data-testid="header-quote-list-btn"
            className="inline-flex items-center gap-2 rounded-xs bg-[#F59E0B] px-4 py-2 text-xs font-semibold tracking-wide text-[#111417] hover:bg-[#FBBF24] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A1D]"
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>Quote List</span>
            <span className="font-mono-tech font-bold" data-testid="quote-line-item-count">
              ({lineItemCount})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

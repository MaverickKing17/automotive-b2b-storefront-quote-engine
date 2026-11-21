import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { StorefrontConfig } from '../data/storefronts';
import type { VehicleSelection } from '../types/quote';
import { FitmentFinder } from './FitmentFinder';
import { TrustPillarsStrip } from './CategoryShowcase';

interface HeroSectionProps {
  storefront: StorefrontConfig;
  onOpenDrawer: () => void;
  onAttachVehicle: (vehicle: VehicleSelection) => void;
  onAddProduct: (sku: string) => void;
  attachedGroupCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  storefront,
  onOpenDrawer,
  onAttachVehicle,
  onAddProduct,
  attachedGroupCount,
}) => {
  const { theme } = storefront;

  return (
    <div id="top">
      {/* Main Hero Canvas — Matching Panel 1 Dusk Highway Sedan Composition */}
      <section
        style={{
          backgroundColor: theme.bgCanvas,
          borderColor: theme.border,
        }}
        className="relative overflow-hidden"
      >
        <div className="relative min-h-[500px] lg:min-h-[545px] flex items-center">
          {/* Full-Bleed Background Highway Sedan Image */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={storefront.heroImageUrl}
              alt={storefront.heroImageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className={`absolute inset-0 ${theme.heroScrimClass}`} />
            <div
              style={{
                background: `linear-gradient(to top, ${theme.bgCanvas} 0%, transparent 32%)`,
              }}
              className="absolute inset-0"
            />
          </div>

          <div className="relative w-full mx-auto max-w-[1360px] px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left Column: Kicker, Headline, Subtitle, Dual Pill CTAs */}
              <div className="lg:col-span-6 xl:col-span-6">
                <p
                  style={{ color: theme.accentInfo }}
                  className="text-[11px] font-mono-tech uppercase tracking-[0.2em] font-semibold mb-3"
                >
                  {storefront.tagline}
                </p>

                <h1
                  style={{ color: theme.textPrimary }}
                  className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.05]"
                >
                  {storefront.heroHeadlinePrefix}
                  {storefront.heroHeadlineHighlight && (
                    <>
                      <br />
                      <span>{storefront.heroHeadlineHighlight}</span>
                    </>
                  )}
                </h1>

                <p
                  style={{ color: theme.textSecondary }}
                  className="mt-4 text-sm sm:text-[15px] leading-relaxed max-w-md"
                >
                  {storefront.heroSubtitle}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#hardware"
                    style={{
                      backgroundColor: theme.accentInfo,
                      color: '#06131D',
                    }}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                  >
                    <span>{storefront.primaryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={onOpenDrawer}
                    style={{
                      borderColor: '#2D4059',
                      backgroundColor: 'rgba(10, 18, 30, 0.78)',
                      color: theme.textPrimary,
                    }}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-xs sm:text-sm font-medium hover:border-[#22D3EE]/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{storefront.secondaryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Right Column: Floating Translucent Vehicle Fitment Finder */}
              <div className="lg:col-span-6 xl:col-span-6 flex lg:justify-end">
                <div className="w-full max-w-[375px]">
                  <FitmentFinder
                    theme={theme}
                    layout="docked-vertical"
                    onAttachVehicle={onAttachVehicle}
                    onAddProduct={onAddProduct}
                    attachedGroupCount={attachedGroupCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip Immediately Below Hero */}
      <div style={{ backgroundColor: theme.bgCanvas }}>
        <TrustPillarsStrip storefront={storefront} />
      </div>
    </div>
  );
};

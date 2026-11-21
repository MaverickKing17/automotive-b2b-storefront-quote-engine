import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import type { StorefrontConfig } from '../data/storefronts';
import type { VehicleSelection } from '../types/quote';
import { FitmentFinder } from './FitmentFinder';
import { NeedAdviceCard, TrustPillarsStrip } from './CategoryShowcase';

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
  const kickerColor = theme.isLight
    ? theme.accentPrimary
    : storefront.id === 'astrateq'
    ? theme.accentInfo
    : theme.accentPrimary;

  return (
    <div id="top">
      {/* Main Hero Canvas */}
      <section
        style={{
          backgroundColor: theme.bgCanvas,
          borderColor: theme.border,
        }}
        className="relative border-b overflow-hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={storefront.heroImageUrl}
              alt={storefront.heroImageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className={`absolute inset-0 ${theme.heroScrimClass}`} />
            {!theme.isLight && (
              <div
                style={{
                  background: `linear-gradient(to top, ${theme.bgCanvas} 0%, transparent 45%)`,
                }}
                className="absolute inset-0"
              />
            )}
          </div>

          <div className="relative mx-auto max-w-[1360px] px-4 sm:px-6 py-12 lg:py-16">
            {/* LAYOUT 1: Astrateq Flagship — Headline Left + Docked Vehicle Fitment Finder Right */}
            {storefront.heroLayout === 'docked-right-finder' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                <div className="lg:col-span-6">
                  <p
                    style={{ color: kickerColor }}
                    className="text-[11px] font-mono-tech uppercase tracking-[0.18em] mb-3"
                  >
                    {storefront.tagline}
                  </p>
                  <h1
                    style={{ color: theme.textPrimary }}
                    className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.06] max-w-xl [text-wrap:balance]"
                  >
                    {storefront.heroHeadlinePrefix}
                  </h1>
                  <p
                    style={{ color: theme.textSecondary }}
                    className="mt-4 text-sm sm:text-base leading-relaxed max-w-md"
                  >
                    {storefront.heroSubtitle}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                      className="inline-flex items-center gap-2 rounded-xs px-6 py-3 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.primaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <a
                      href="#hardware"
                      style={{
                        borderColor: theme.borderStrong,
                        backgroundColor: 'rgba(16, 21, 28, 0.72)',
                        color: theme.textPrimary,
                      }}
                      className="inline-flex items-center rounded-xs border px-5 py-3 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                    >
                      {storefront.secondaryCtaLabel}
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <FitmentFinder
                    theme={theme}
                    layout="docked-vertical"
                    onAttachVehicle={onAttachVehicle}
                    onAddProduct={onAddProduct}
                    attachedGroupCount={attachedGroupCount}
                  />
                </div>
              </div>
            ) : (
              /* LAYOUTS 2, 3, 4: Left-Anchored Hero Copy over Full-Width Backdrop */
              <div className="max-w-xl py-4 lg:py-8">
                <p
                  style={{ color: kickerColor }}
                  className="text-[11px] font-mono-tech uppercase tracking-[0.18em] mb-3 font-semibold"
                >
                  {storefront.tagline}
                </p>
                <h1
                  style={{ color: theme.textPrimary }}
                  className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.06] [text-wrap:balance]"
                >
                  {storefront.heroHeadlinePrefix}
                  {storefront.heroHeadlineHighlight && (
                    <>
                      {' '}
                      <span style={{ color: theme.accentPrimary }}>
                        {storefront.heroHeadlineHighlight}
                      </span>
                    </>
                  )}
                </h1>
                <p
                  style={{ color: theme.textSecondary }}
                  className="mt-4 text-sm sm:text-base leading-relaxed max-w-md"
                >
                  {storefront.heroSubtitle}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onOpenDrawer}
                    style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                    className="inline-flex items-center gap-2 rounded-xs px-6 py-3 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{storefront.primaryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <a
                    href="#hardware"
                    style={{
                      borderColor: theme.borderStrong,
                      backgroundColor: theme.isLight ? 'rgba(255,255,255,0.85)' : 'rgba(20,23,27,0.75)',
                      color: theme.textPrimary,
                    }}
                    className="inline-flex items-center rounded-xs border px-5 py-3 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                  >
                    {storefront.secondaryCtaLabel}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Post-Hero Band Tailored per Storefront */}
      {storefront.heroLayout === 'docked-right-finder' && (
        <div style={{ backgroundColor: theme.bgCanvas, borderColor: theme.border }} className="border-b">
          <TrustPillarsStrip storefront={storefront} />
        </div>
      )}

      {storefront.heroLayout === 'corporate-quick-quote' && (
        <div style={{ backgroundColor: theme.bgCanvas, borderColor: theme.border }} className="border-b">
          {/* Quick Quote Engine 3-step horizontal bar matching NorthLink Panel 2 */}
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-6 pb-2">
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="border shadow-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-3.5">
                <div
                  style={{
                    backgroundColor: `${theme.accentPrimary}18`,
                    color: theme.accentPrimary,
                  }}
                  className="w-10 h-10 rounded-xs flex items-center justify-center shrink-0"
                >
                  <Zap className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 style={{ color: theme.textPrimary }} className="font-display text-base font-bold">
                    Quick Quote Engine
                  </h2>
                  <p style={{ color: theme.textSecondary }} className="text-xs">
                    Assemble a multi-vehicle CAD fleet RFQ in three structured steps.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl">
                {[
                  { num: '1', label: 'Deployment & Fitment' },
                  { num: '2', label: 'Contact Details' },
                  { num: '3', label: 'Review & Submit' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={onOpenDrawer}
                    className="flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <span
                      style={{ backgroundColor: theme.accentPrimary, color: '#FFFFFF' }}
                      className="w-6 h-6 rounded-full text-xs font-mono-tech font-bold flex items-center justify-center shrink-0"
                    >
                      {s.num}
                    </span>
                    <span
                      style={{ color: theme.textPrimary }}
                      className="text-xs font-semibold group-hover:underline"
                    >
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-6">
            <FitmentFinder
              theme={theme}
              layout="horizontal-bar"
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>
          <TrustPillarsStrip storefront={storefront} />
        </div>
      )}

      {storefront.heroLayout === 'ev-split-finder' && (
        <div style={{ backgroundColor: theme.bgCanvas, borderColor: theme.border }} className="border-b">
          <TrustPillarsStrip storefront={storefront} />
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8">
              <FitmentFinder
                theme={theme}
                layout="horizontal-bar"
                onAttachVehicle={onAttachVehicle}
                onAddProduct={onAddProduct}
                attachedGroupCount={attachedGroupCount}
              />
            </div>
            <div className="lg:col-span-4">
              <NeedAdviceCard storefront={storefront} />
            </div>
          </div>
        </div>
      )}

      {storefront.heroLayout === 'upfitter-pillars' && (
        <div style={{ backgroundColor: theme.bgCanvas, borderColor: theme.border }} className="border-b pb-8">
          <TrustPillarsStrip storefront={storefront} overlapping />
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-6">
            <FitmentFinder
              theme={theme}
              layout="horizontal-bar"
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

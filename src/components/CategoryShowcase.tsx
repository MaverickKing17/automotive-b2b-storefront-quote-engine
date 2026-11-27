import React from 'react';
import {
  ArrowRight,
  ChevronRight,
  Headphones,
  Layers,
  MapPin,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import type { StorefrontConfig, TrustPillar } from '../data/storefronts';

interface CategoryShowcaseProps {
  storefront: StorefrontConfig;
  onSelectCategory: (category: string) => void;
}

const PillarIcon: React.FC<{ icon: TrustPillar['icon']; color: string }> = ({
  icon,
  color,
}) => {
  const cls = 'w-5 h-5';
  if (icon === 'shield') return <ShieldCheck style={{ color }} className={cls} aria-hidden="true" />;
  if (icon === 'layers') return <Layers style={{ color }} className={cls} aria-hidden="true" />;
  if (icon === 'zap') return <Zap style={{ color }} className={cls} aria-hidden="true" />;
  if (icon === 'mappin') return <MapPin style={{ color }} className={cls} aria-hidden="true" />;
  return <Wrench style={{ color }} className={cls} aria-hidden="true" />;
};

export const TrustPillarsStrip: React.FC<{
  storefront: StorefrontConfig;
  overlapping?: boolean;
}> = ({ storefront, overlapping = false }) => {
  const { theme, trustPillars } = storefront;
  const iconColor =
    storefront.id === 'astrateq'
      ? theme.accentInfo
      : theme.accentPrimary;

  const stripBg =
    storefront.id === 'astrateq'
      ? '#0D1420'
      : theme.bgSurface;
  const stripBorder =
    storefront.id === 'astrateq'
      ? '#1C2A3E'
      : theme.border;

  return (
    <div
      className={
        overlapping
          ? 'relative z-10 -mt-8 mx-auto max-w-[1360px] px-4 sm:px-6'
          : 'mx-auto max-w-[1360px] px-4 sm:px-6 pt-5 pb-3'
      }
    >
      <div
        style={{
          backgroundColor: stripBg,
          borderColor: stripBorder,
        }}
        className="grid grid-cols-1 md:grid-cols-3 rounded-xl border divide-y md:divide-y-0 md:divide-x shadow-lg"
      >
        {trustPillars.map((pillar) => (
          <div
            key={pillar.title}
            style={{ borderColor: stripBorder }}
            className="flex items-center md:justify-center gap-3.5 px-6 py-4"
          >
            <div
              style={{
                borderColor: `${iconColor}44`,
                backgroundColor: `${iconColor}14`,
              }}
              className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
            >
              <PillarIcon icon={pillar.icon} color={iconColor} />
            </div>
            <div>
              <div style={{ color: theme.textPrimary }} className="text-sm font-semibold leading-snug">
                {pillar.title}
              </div>
              <div style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                {pillar.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NeedAdviceCard: React.FC<{
  storefront: StorefrontConfig;
  onOpenDrawer: () => void;
}> = ({ storefront, onOpenDrawer }) => {
  const { theme } = storefront;
  const accent = theme.accentPrimary;

  return (
    <div
      style={{
        backgroundColor: theme.bgSurface,
        borderColor: theme.borderStrong,
      }}
      className="rounded-xl border p-5 flex flex-col justify-between h-full"
    >
      <div className="flex items-start gap-3.5">
        <div
          style={{
            borderColor: `${accent}55`,
            backgroundColor: `${accent}18`,
          }}
          className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
        >
          <Headphones style={{ color: accent }} className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 style={{ color: theme.textPrimary }} className="font-display text-base font-bold">
            Need Expert Advice?
          </h3>
          <p style={{ color: theme.textSecondary }} className="text-xs mt-1 leading-relaxed">
            Our EV charging team is here to help with depot load sizing, OCPP telemetry, and RFQ
            planning.
          </p>
        </div>
      </div>

      <div
        className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2"
        style={{ borderColor: theme.border }}
      >
        <a
          href="#spec-assist"
          style={{ color: accent }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4"
        >
          <span>Ask Spec Assist</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onOpenDrawer}
          style={{ color: theme.textPrimary }}
          className="text-xs font-medium hover:underline underline-offset-4 cursor-pointer"
        >
          Contact Us →
        </button>
      </div>
    </div>
  );
};

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  storefront,
  onSelectCategory,
}) => {
  const { theme, categoryCards } = storefront;
  const isFiveCards = categoryCards.length >= 5;
  const linkAccent =
    theme.isLight || storefront.id === 'voltdepot' || storefront.id === 'truenorth'
      ? theme.accentPrimary
      : theme.accentInfo;

  const handlePick = (category: string) => {
    onSelectCategory(category);
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        backgroundColor: theme.bgCanvas,
        borderColor: theme.border,
      }}
      className="border-b"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-8 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-xl sm:text-2xl font-bold"
            >
              {storefront.categorySectionTitle}
            </h2>
            <p style={{ color: theme.textSecondary }} className="text-xs sm:text-sm mt-1">
              {storefront.categorySectionSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePick('All Hardware')}
            style={{ color: linkAccent }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            <span>{storefront.categoryViewAllLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            isFiveCards ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
          } gap-4`}
        >
          {categoryCards.map((item) => {
            if (storefront.categoryCardStyle === 'light-framed') {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handlePick(item.category)}
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                  }}
                  className="group overflow-hidden rounded-xl border text-left hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2 w-full">
                    <div>
                      <div
                        style={{ color: theme.textPrimary }}
                        className="font-display text-sm font-bold leading-tight"
                      >
                        {item.title}
                      </div>
                      <div
                        style={{ color: theme.textSecondary }}
                        className="text-xs mt-0.5 line-clamp-1"
                      >
                        {item.subtitle}
                      </div>
                    </div>
                    <ChevronRight
                      style={{ color: theme.accentPrimary }}
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handlePick(item.category)}
                style={{ borderColor: storefront.id === 'astrateq' ? '#1E2B3D' : theme.border }}
                className="group relative aspect-[16/11] w-full overflow-hidden rounded-xl border bg-[#0E1522] text-left transition-colors cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover contrast-[1.03] saturate-[1.04] group-hover:scale-[1.04] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B12]/88 via-[#070B12]/20 via-45% to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2">
                  <div>
                    <div className="font-display text-xs sm:text-[13px] font-bold text-[#F3F6FA] leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      {item.title}
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#9FB0C4] transition-colors shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

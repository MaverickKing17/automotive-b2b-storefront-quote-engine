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
import { clientConfig } from '../data/clientConfig';
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
}> = ({ storefront }) => {
  const { theme, trustPillars } = storefront;
  const iconColor = theme.accentInfo;

  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-5 pb-3">
      <div
        style={{
          backgroundColor: '#0D1420',
          borderColor: '#1C2A3E',
        }}
        className="grid grid-cols-1 md:grid-cols-3 rounded-xl border divide-y md:divide-y-0 md:divide-x shadow-lg"
      >
        {trustPillars.map((pillar) => (
          <div
            key={pillar.title}
            style={{ borderColor: '#1C2A3E' }}
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

export const NeedAdviceCard: React.FC<{ storefront: StorefrontConfig }> = ({ storefront }) => {
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
            Need Spec Guidance?
          </h3>
          <p style={{ color: theme.textSecondary }} className="text-xs mt-1 leading-relaxed">
            Query published hardware ratings, CAD pricing tiers, and matrix compatibility via
            inline Spec Assist.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: theme.border }}>
        <a
          href="#spec-assist"
          style={{ color: accent }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4"
        >
          <span>Open Spec Assist</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  storefront,
  onSelectCategory,
}) => {
  const { theme } = storefront;

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
            style={{ color: theme.accentInfo }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {clientConfig.categoryShowcase.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => handlePick(item.category)}
              style={{ borderColor: '#1E2B3D' }}
              className="group relative aspect-[16/11] w-full overflow-hidden rounded-xl border bg-[#0E1522] text-left transition-colors hover:border-[#22D3EE]/50 cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2">
                <div>
                  <div className="font-display text-xs sm:text-[13px] font-bold text-[#F3F6FA] leading-snug">
                    {item.title}
                  </div>
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#9FB0C4] group-hover:text-[#22D3EE] transition-colors shrink-0"
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

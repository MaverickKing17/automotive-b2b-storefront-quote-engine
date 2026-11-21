import React from 'react';
import { STOREFRONTS, STOREFRONT_ORDER, type StorefrontId } from '../data/storefronts';

interface StorefrontSwitcherProps {
  activeId: StorefrontId;
  onSelect: (id: StorefrontId) => void;
}

export const StorefrontSwitcher: React.FC<StorefrontSwitcherProps> = ({
  activeId,
  onSelect,
}) => {
  const activeStore = STOREFRONTS[activeId];

  return (
    <div
      aria-label="Independent B2B storefront demonstrations"
      style={{
        backgroundColor: activeStore.theme.isLight ? '#E2E8F0' : '#05080D',
        borderBottom: `1px solid ${activeStore.theme.border}`,
        color: activeStore.theme.textSecondary,
      }}
      className="text-[11px] font-mono-tech"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="uppercase tracking-wider opacity-85 whitespace-nowrap">
          Storefront Demos:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {STOREFRONT_ORDER.map((id) => {
            const cfg = STOREFRONTS[id];
            const isSelected = id === activeId;
            return (
              <a
                key={id}
                href={`?store=${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(id);
                }}
                data-testid={`switch-store-${id}`}
                style={
                  isSelected
                    ? {
                        backgroundColor:
                          cfg.id === 'northlink' ? cfg.theme.accentPrimary : cfg.theme.ctaBg,
                        color: cfg.id === 'northlink' ? '#FFFFFF' : cfg.theme.ctaText,
                        borderColor:
                          cfg.id === 'northlink' ? cfg.theme.accentPrimary : cfg.theme.ctaBg,
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: activeStore.theme.textSecondary,
                        borderColor: activeStore.theme.border,
                      }
                }
                className="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {cfg.badgeNumber}. {cfg.shortLabel}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

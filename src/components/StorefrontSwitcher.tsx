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
      aria-label="Storefront configuration switcher"
      style={{
        backgroundColor: activeStore.theme.isLight ? '#E2E8F0' : '#0B0E12',
        borderBottom: `1px solid ${activeStore.theme.border}`,
        color: activeStore.theme.textSecondary,
      }}
      className="text-[11px] font-mono-tech"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="uppercase tracking-wider opacity-80 whitespace-nowrap">
          Storefront Config:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {STOREFRONT_ORDER.map((id) => {
            const cfg = STOREFRONTS[id];
            const isSelected = id === activeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                data-testid={`switch-store-${id}`}
                style={
                  isSelected
                    ? {
                        backgroundColor: cfg.theme.ctaBg,
                        color: cfg.theme.ctaText,
                        borderColor: cfg.theme.ctaBg,
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: activeStore.theme.textSecondary,
                        borderColor: activeStore.theme.border,
                      }
                }
                className="px-2.5 py-0.5 rounded-xs border text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {cfg.badgeNumber}. {cfg.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

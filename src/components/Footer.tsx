import React from 'react';
import { STOREFRONTS, STOREFRONT_ORDER, type StorefrontConfig, type StorefrontId } from '../data/storefronts';
import { StorefrontLogo } from './BlueprintArtwork';

interface FooterProps {
  storefront: StorefrontConfig;
  onOpenDrawer: () => void;
  onSelectStorefront: (id: StorefrontId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  storefront,
  onOpenDrawer,
  onSelectStorefront,
}) => {
  const { theme, contactInfo } = storefront;

  return (
    <footer
      style={{
        backgroundColor: theme.bgCanvas,
        borderColor: theme.border,
      }}
      className="border-t"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <StorefrontLogo storefront={storefront} />
            <div>
              <div
                style={{ color: theme.textPrimary }}
                className="font-display text-sm font-bold uppercase tracking-wider"
              >
                {storefront.brandName}
              </div>
              <div style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                {contactInfo.regionLabel} · {contactInfo.email} · {contactInfo.phone}
              </div>
              <div style={{ color: theme.textMuted }} className="text-xs mt-0.5">
                © 2026 {storefront.brandName}. Demo storefront — sample catalog &amp; fitment data.
              </div>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            style={{ color: theme.textSecondary }}
            className="flex flex-wrap items-center gap-6 text-xs font-medium"
          >
            <a href="#hardware" className="hover:opacity-100 opacity-85 transition-opacity">
              Hardware
            </a>
            <a href="#fitment" className="hover:opacity-100 opacity-85 transition-opacity">
              Fitment
            </a>
            <a href="#spec-assist" className="hover:opacity-100 opacity-85 transition-opacity">
              Spec assist
            </a>
            <button
              type="button"
              onClick={onOpenDrawer}
              style={{ color: theme.accentPrimary }}
              className="font-semibold hover:underline underline-offset-4 cursor-pointer"
            >
              Contact fleet team
            </button>
          </nav>
        </div>

        <div
          style={{ borderColor: theme.border }}
          className="border-t pt-5 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <span style={{ color: theme.textMuted }} className="font-mono-tech uppercase tracking-wider">
            Platform Demonstrations:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {STOREFRONT_ORDER.map((id) => {
              const cfg = STOREFRONTS[id];
              const active = id === storefront.id;
              return (
                <a
                  key={id}
                  href={`?store=${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectStorefront(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    color: active ? theme.accentPrimary : theme.textSecondary,
                    fontWeight: active ? 700 : 500,
                  }}
                  className="hover:underline underline-offset-4"
                >
                  {cfg.badgeNumber}. {cfg.shortLabel}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

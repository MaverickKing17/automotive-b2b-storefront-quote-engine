import React from 'react';
import { ArrowUpRight, Mail, Phone, Headphones } from 'lucide-react';
import type { PolicyItem } from '../data/clientConfig';
import type { StorefrontId, StorefrontTheme } from '../data/storefronts';

interface PoliciesSectionProps {
  storefrontId?: StorefrontId;
  theme: StorefrontTheme;
  policies: PolicyItem[];
  contactInfo?: {
    email: string;
    phone: string;
    regionLabel: string;
  };
  onOpenPolicy: (policy: PolicyItem) => void;
  onOpenDrawer?: () => void;
}

export const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  storefrontId,
  theme,
  policies,
  contactInfo,
  onOpenPolicy,
  onOpenDrawer,
}) => {
  const isAstrateq = storefrontId === 'astrateq';
  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;
  const isSixPolicies = policies.length >= 6;

  return (
    <section
      id="policies"
      style={{
        backgroundColor: theme.isLight ? theme.bgElevated : theme.bgInput,
        borderColor: theme.border,
      }}
      className="border-b scroll-mt-16"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-14 space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-[0.16em]"
            >
              05 · Policies, Support &amp; Buyer Information
            </p>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-2xl sm:text-3xl font-bold mt-1"
            >
              Commercial Fleet Policies &amp; Support
            </h2>
          </div>
          <span style={{ color: theme.textMuted }} className="text-xs font-mono-tech">
            {isAstrateq
              ? 'Demo policy placeholders — supplier configuration required'
              : 'Sample demo policy summaries'}
          </span>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            isSixPolicies ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
          } gap-4`}
        >
          {policies.map((policy) => (
            <article
              key={policy.id}
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="border p-5 flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ color: theme.textMuted }}
                  className="text-[10px] font-mono-tech uppercase tracking-wider"
                >
                  {policy.demoTag}
                </div>
                <h3
                  style={{ color: theme.textPrimary }}
                  className="font-display text-base font-bold mt-1.5"
                >
                  {policy.title}
                </h3>
                <p
                  style={{ color: isAstrateq ? '#B4BEC9' : theme.textSecondary }}
                  className="mt-2.5 text-xs leading-relaxed"
                >
                  {policy.summary}
                </p>
              </div>

              <div style={{ borderColor: theme.border }} className="mt-5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => onOpenPolicy(policy)}
                  style={{ color: infoColor }}
                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline underline-offset-4 cursor-pointer"
                >
                  <span>Read policy</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {isAstrateq && contactInfo && (
          <div
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            }}
            className="border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-1.5">
              <div
                style={{ color: infoColor }}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider"
              >
                <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Supplier Contact &amp; Product Support (Demo Configuration)</span>
              </div>
              <p style={{ color: '#D6DDE5' }} className="text-sm font-medium">
                {contactInfo.regionLabel}
              </p>
              <div
                style={{ color: '#B4BEC9' }}
                className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs"
              >
                <span className="inline-flex items-center gap-1.5 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{contactInfo.email}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{contactInfo.phone}</span>
                </span>
              </div>
            </div>

            {onOpenDrawer && (
              <button
                type="button"
                onClick={onOpenDrawer}
                style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                className="rounded-full px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-center"
              >
                Open Fleet Quote Portal
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

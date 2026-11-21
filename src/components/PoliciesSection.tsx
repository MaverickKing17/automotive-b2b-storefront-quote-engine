import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { PolicyItem } from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';

interface PoliciesSectionProps {
  theme: StorefrontTheme;
  policies: PolicyItem[];
  onOpenPolicy: (policy: PolicyItem) => void;
}

export const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  theme,
  policies,
  onOpenPolicy,
}) => {
  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

  return (
    <section
      id="policies"
      style={{
        backgroundColor: theme.isLight ? theme.bgElevated : theme.bgInput,
        borderColor: theme.border,
      }}
      className="border-b"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <div>
            <p
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-[0.16em]"
            >
              05 · Policies &amp; Buyer Information
            </p>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-2xl sm:text-3xl font-bold mt-1"
            >
              Commercial Fleet Policies
            </h2>
          </div>
          <span style={{ color: theme.textMuted }} className="text-xs font-mono-tech">
            Sample demo policy summaries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  style={{ color: theme.textSecondary }}
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
      </div>
    </section>
  );
};

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { clientConfig, type PolicyItem } from '../data/clientConfig';

interface PoliciesSectionProps {
  onOpenPolicy: (policy: PolicyItem) => void;
}

export const PoliciesSection: React.FC<PoliciesSectionProps> = ({ onOpenPolicy }) => {
  return (
    <section id="policies" className="border-b border-[#2B3138] bg-[#14171A]">
      <div className="mx-auto max-w-[1320px] px-6 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono-tech uppercase tracking-[0.16em] text-[#22D3EE]">
              05 · Policies &amp; Buyer Information
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE9] mt-1">
              Commercial Fleet Policies
            </h2>
          </div>
          <span className="text-xs font-mono-tech text-[#76808D]">
            Sample demo policy summaries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {clientConfig.policies.map((policy) => (
            <article
              key={policy.id}
              className="border border-[#2B3138] bg-[#1D2126] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#76808D]">
                  {policy.demoTag}
                </div>
                <h3 className="font-display text-base font-bold text-[#F2EFE9] mt-1.5">
                  {policy.title}
                </h3>
                <p className="mt-2.5 text-xs text-[#A7B0BC] leading-relaxed">
                  {policy.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#262C34]">
                <button
                  type="button"
                  onClick={() => onOpenPolicy(policy)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#22D3EE] hover:underline underline-offset-4 cursor-pointer"
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

import React from 'react';
import { clientConfig } from '../data/clientConfig';

export const ProcessSection: React.FC = () => {
  return (
    <section id="process" className="border-b border-[#2B3138] bg-[#14171A]">
      <div className="mx-auto max-w-[1320px] px-6 py-14">
        <div className="mb-8">
          <p className="text-xs font-mono-tech uppercase tracking-[0.16em] text-[#22D3EE]">
            03 · Deployment Workflow
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE9] mt-1">
            From Spec to Deployment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clientConfig.processSteps.map((item) => (
            <div
              key={item.step}
              className="border border-[#2B3138] bg-[#1D2126] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="font-mono-tech text-xs font-semibold text-[#22D3EE] tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="font-display text-lg font-bold text-[#F2EFE9] mt-2">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[#A7B0BC] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

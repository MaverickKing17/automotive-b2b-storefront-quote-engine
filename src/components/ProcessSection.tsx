import React from 'react';
import type { ProcessStepItem, StorefrontTheme } from '../data/storefronts';

interface ProcessSectionProps {
  theme: StorefrontTheme;
  steps: ProcessStepItem[];
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ theme, steps }) => {
  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

  return (
    <section
      id="process"
      style={{
        backgroundColor: theme.isLight ? theme.bgElevated : theme.bgInput,
        borderColor: theme.border,
      }}
      className="border-b"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-14">
        <div className="mb-8">
          <p
            style={{ color: infoColor }}
            className="text-xs font-mono-tech uppercase tracking-[0.16em]"
          >
            03 · Deployment Workflow
          </p>
          <h2
            style={{ color: theme.textPrimary }}
            className="font-display text-2xl sm:text-3xl font-bold mt-1"
          >
            From Spec to Deployment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="border p-6 flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ color: infoColor }}
                  className="font-mono-tech text-xs font-semibold tracking-widest"
                >
                  STEP {item.step}
                </div>
                <h3
                  style={{ color: theme.textPrimary }}
                  className="font-display text-lg font-bold mt-2"
                >
                  {item.title}
                </h3>
                <p
                  style={{ color: theme.textSecondary }}
                  className="mt-3 text-sm leading-relaxed"
                >
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

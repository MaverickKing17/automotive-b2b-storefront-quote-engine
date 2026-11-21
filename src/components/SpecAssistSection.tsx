import React, { useState } from 'react';
import { Send, TerminalSquare } from 'lucide-react';
import type { StorefrontTheme } from '../data/storefronts';
import { answerSpecAssistQuestion, type SpecAssistAnswer } from '../utils/specAssistEngine';

interface Exchange {
  id: string;
  question: string;
  response: SpecAssistAnswer;
}

const SAMPLE_PROMPTS = [
  'Which dashcams support 24V Class 8 trucks?',
  'Is AST-104 verified for 2025 Rivian EDV 700 Commercial EV?',
  'Does AST-208 fit a Toyota Hiace?',
  'What EV charger controllers and harnesses are in the catalog?',
];

export const SpecAssistSection: React.FC<{ theme: StorefrontTheme }> = ({ theme }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Exchange[]>([
    {
      id: 'init-1',
      question: 'Which dashcams support 24V Class 8 trucks?',
      response: answerSpecAssistQuestion('Which dashcams support 24V Class 8 trucks?'),
    },
  ]);

  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

  const submitQuestion = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;
    const response = answerSpecAssistQuestion(trimmed);
    setHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: trimmed,
        response,
      },
    ]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(input);
  };

  return (
    <section
      id="spec-assist"
      style={{
        backgroundColor: theme.bgCanvas,
        borderColor: theme.border,
      }}
      className="border-b scroll-mt-16"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <p
              style={{ color: infoColor }}
              className="text-xs font-mono-tech uppercase tracking-[0.16em]"
            >
              04 · Inline Product Copilot
            </p>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-2xl sm:text-3xl font-bold mt-1"
            >
              Spec Assist
            </h2>
            <p
              style={{ color: theme.textSecondary }}
              className="mt-3 text-sm leading-relaxed"
            >
              Ask specification, CAD tier, or vehicle-fitment questions. Answers are generated
              strictly from published catalogue data and the vehicle compatibility matrix—unlisted
              vehicles are escalated for technical fitment review.
            </p>

            <div className="mt-6">
              <div
                style={{ color: theme.textMuted }}
                className="text-[11px] font-mono-tech uppercase tracking-wider mb-2.5"
              >
                Example queries
              </div>
              <div className="flex flex-col gap-2">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitQuestion(prompt)}
                    style={{
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    }}
                    className="text-left border px-3.5 py-2.5 text-xs hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            }}
            className="lg:col-span-7 border flex flex-col"
          >
            <div
              style={{
                backgroundColor: theme.bgElevated,
                borderColor: theme.border,
              }}
              className="flex items-center justify-between border-b px-5 py-3"
            >
              <span
                style={{ color: infoColor }}
                className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider font-semibold"
              >
                <TerminalSquare className="w-4 h-4" aria-hidden="true" />
                <span>Spec Assist · Published Catalog Engine</span>
              </span>
              <span style={{ color: theme.textMuted }} className="text-[11px] font-mono-tech">
                Rule-based · Cited SKUs
              </span>
            </div>

            <div
              data-testid="spec-assist-transcript"
              className="p-5 space-y-5 max-h-[380px] overflow-y-auto"
            >
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{ borderColor: theme.border }}
                  className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div style={{ color: theme.textSecondary }} className="text-xs font-mono-tech">
                    QUERY: <span style={{ color: theme.textPrimary }}>{item.question}</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: theme.bgCanvas,
                      borderColor:
                        item.response.isFitmentResponse && !item.response.isVerifiedFitment
                          ? theme.badgeWarnBorder
                          : theme.border,
                      color: theme.textPrimary,
                    }}
                    className="border p-3.5 text-sm leading-relaxed whitespace-pre-line"
                  >
                    {item.response.answer}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: theme.bgElevated,
                borderColor: theme.border,
              }}
              className="border-t p-4 flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="spec-assist-input" className="sr-only">
                Ask Spec Assist about hardware specs or vehicle fitment
              </label>
              <input
                id="spec-assist-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about 24V dashcams, J1939 gateways, or vehicle fitment..."
                style={{
                  backgroundColor: theme.bgInput,
                  borderColor: theme.borderStrong,
                  color: theme.textPrimary,
                }}
                className="flex-1 h-11 rounded-xs border px-3.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                style={{
                  backgroundColor: theme.isLight ? '#0F172A' : '#F2EFE9',
                  color: theme.isLight ? '#FFFFFF' : '#111417',
                  borderColor: theme.isLight ? '#0F172A' : '#F2EFE9',
                }}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xs border px-5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ask Spec Assist</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

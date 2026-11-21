import React, { useState } from 'react';
import { Send, TerminalSquare } from 'lucide-react';
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

export const SpecAssistSection: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Exchange[]>([
    {
      id: 'init-1',
      question: 'Which dashcams support 24V Class 8 trucks?',
      response: answerSpecAssistQuestion('Which dashcams support 24V Class 8 trucks?'),
    },
  ]);

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
    <section id="spec-assist" className="border-b border-[#2B3138] bg-[#171A1D]">
      <div className="mx-auto max-w-[1320px] px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono-tech uppercase tracking-[0.16em] text-[#22D3EE]">
              04 · Inline Product Copilot
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE9] mt-1">
              Spec Assist
            </h2>
            <p className="mt-3 text-sm text-[#A7B0BC] leading-relaxed">
              Ask specification, CAD tier, or vehicle-fitment questions. Answers are generated
              strictly from published catalogue data and the vehicle compatibility matrix—unlisted
              vehicles are escalated for technical fitment review.
            </p>

            <div className="mt-6">
              <div className="text-[11px] font-mono-tech uppercase tracking-wider text-[#76808D] mb-2.5">
                Example queries
              </div>
              <div className="flex flex-col gap-2">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitQuestion(prompt)}
                    className="text-left border border-[#2B3138] bg-[#1D2126] px-3.5 py-2.5 text-xs text-[#F2EFE9] hover:border-[#22D3EE]/60 hover:text-[#22D3EE] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-[#2B3138] bg-[#1D2126] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#2B3138] px-5 py-3 bg-[#14171A]">
              <span className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-[#22D3EE]">
                <TerminalSquare className="w-4 h-4" aria-hidden="true" />
                <span>Spec Assist · Published Catalog Engine</span>
              </span>
              <span className="text-[11px] font-mono-tech text-[#76808D]">
                Rule-based · Cited SKUs
              </span>
            </div>

            <div
              data-testid="spec-assist-transcript"
              className="p-5 space-y-5 max-h-[380px] overflow-y-auto"
            >
              {history.map((item) => (
                <div key={item.id} className="space-y-2 border-b border-[#262C34] pb-4 last:border-b-0 last:pb-0">
                  <div className="text-xs font-mono-tech text-[#A7B0BC]">
                    QUERY: <span className="text-[#F2EFE9]">{item.question}</span>
                  </div>
                  <div
                    className={`border p-3.5 text-sm leading-relaxed whitespace-pre-line ${
                      item.response.isFitmentResponse && !item.response.isVerifiedFitment
                        ? 'border-[#F59E0B]/40 bg-[#171A1D] text-[#F2EFE9]'
                        : 'border-[#262C34] bg-[#171A1D] text-[#F2EFE9]'
                    }`}
                  >
                    {item.response.answer}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-[#2B3138] p-4 bg-[#14171A] flex flex-col sm:flex-row gap-3"
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
                className="flex-1 h-11 rounded-xs border border-[#343C46] bg-[#171A1D] px-3.5 text-sm text-[#F2EFE9] placeholder:text-[#76808D] focus:border-[#22D3EE] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xs border border-[#F2EFE9] bg-[#F2EFE9] px-5 text-xs font-semibold uppercase tracking-wider text-[#171A1D] hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
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

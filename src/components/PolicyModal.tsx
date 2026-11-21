import React from 'react';
import { X } from 'lucide-react';
import type { PolicyItem } from '../data/clientConfig';

interface PolicyModalProps {
  policy: PolicyItem | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="w-full max-w-lg border border-[#343C46] bg-[#171A1D] text-[#F2EFE9] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#2B3138] px-6 py-4 bg-[#1D2126]">
          <div>
            <p className="text-[11px] font-mono-tech uppercase tracking-wider text-[#22D3EE]">
              {policy.demoTag}
            </p>
            <h3 id="policy-modal-title" className="font-display text-lg font-bold mt-0.5">
              {policy.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close policy dialog"
            className="p-2 text-[#A7B0BC] hover:text-[#F2EFE9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 text-sm text-[#A7B0BC] leading-relaxed">
          {policy.fullText.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="border-t border-[#2B3138] px-6 py-3.5 flex justify-end bg-[#1D2126]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs border border-[#343C46] px-4 py-2 text-xs font-medium text-[#F2EFE9] hover:border-[#22D3EE] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

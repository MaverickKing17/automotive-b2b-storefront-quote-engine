import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { PolicyItem } from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';

interface PolicyModalProps {
  theme: StorefrontTheme;
  policy: PolicyItem | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ theme, policy, onClose }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!policy) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      prevFocused?.focus?.();
    };
  }, [policy, onClose]);

  if (!policy) return null;
  const infoColor = theme.isLight ? theme.accentPrimary : theme.accentInfo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: theme.bgCanvas,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
        className="w-full max-w-lg border shadow-2xl"
      >
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.border,
          }}
          className="flex items-start justify-between gap-4 border-b px-4 sm:px-6 py-4"
        >
          <div>
            <p
              style={{ color: infoColor }}
              className="text-[11px] font-mono-tech uppercase tracking-wider"
            >
              {policy.demoTag}
            </p>
            <h3 id="policy-modal-title" className="font-display text-lg font-bold mt-0.5">
              {policy.title}
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close policy dialog"
            style={{ color: theme.textSecondary }}
            className="inline-flex items-center justify-center w-10 h-10 -mr-1.5 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          style={{ color: theme.textSecondary }}
          className="p-4 sm:p-6 space-y-3 text-sm leading-relaxed max-h-[70vh] overflow-y-auto"
        >
          {policy.fullText.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.border,
          }}
          className="border-t px-4 sm:px-6 py-3.5 flex justify-end"
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
            className="rounded-xs border px-4 py-2 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

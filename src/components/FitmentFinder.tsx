import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  clientConfig,
  evaluateVehicleFitment,
  formatCad,
  getProductBySku,
  getTier1Price,
} from '../data/clientConfig';
import type { StorefrontTheme } from '../data/storefronts';
import type { FitmentEvaluation, VehicleSelection } from '../types/quote';

interface FitmentFinderProps {
  theme: StorefrontTheme;
  layout?: 'docked-vertical' | 'horizontal-bar';
  onAttachVehicle: (vehicle: VehicleSelection) => void;
  onAddProduct: (sku: string) => void;
  attachedGroupCount: number;
}

export const FitmentFinder: React.FC<FitmentFinderProps> = ({
  theme,
  onAttachVehicle,
  onAddProduct,
  attachedGroupCount,
}) => {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');
  const [result, setResult] = useState<FitmentEvaluation | null>(null);
  const [attachedNotice, setAttachedNotice] = useState<string | null>(null);
  const [harnessAddedNotice, setHarnessAddedNotice] = useState(false);

  const availableModels = make
    ? clientConfig.fitmentOptions.modelsByMake[make] ?? clientConfig.fitmentOptions.allModelsFallback
    : clientConfig.fitmentOptions.allModelsFallback;

  const allFourChosen = Boolean(year && make && model && vehicleClass);

  const handleYearChange = (nextYear: string) => {
    setYear(nextYear);
    setResult(null);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
    setVehicleClass('');
  };

  const handleMakeChange = (nextMake: string) => {
    setMake(nextMake);
    setModel('');
    setVehicleClass('');
    setResult(null);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
  };

  const handleModelChange = (nextModel: string) => {
    setModel(nextModel);
    setVehicleClass('');
    setResult(null);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
  };

  const handleClassChange = (nextClass: string) => {
    setVehicleClass(nextClass);
    setResult(null);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
  };

  const handleCheckCompatibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFourChosen) return;
    const evaluation = evaluateVehicleFitment({ year, make, model, vehicleClass });
    setResult(evaluation);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
  };

  const handleAttach = () => {
    if (!allFourChosen) return;
    onAttachVehicle({ year, make, model, vehicleClass });
    setAttachedNotice(`${year} ${make} ${model} (${vehicleClass}) attached as a vehicle group.`);
  };

  const recommendedHarness = result?.recommendedHarnessSku
    ? getProductBySku(result.recommendedHarnessSku)
    : undefined;

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#0E1726',
    borderColor: '#233248',
    color: theme.textPrimary,
  };

  const checkBtnStyle: React.CSSProperties = allFourChosen
    ? {
        backgroundColor: '#FACC15',
        color: '#090E16',
        borderColor: '#FACC15',
      }
    : {
        backgroundColor: 'rgba(250, 204, 21, 0.25)',
        color: '#CBD5E1',
        borderColor: 'rgba(250, 204, 21, 0.35)',
      };

  return (
    <div id="fitment" className="scroll-mt-20">
      <div
        style={{
          backgroundColor: 'rgba(11, 18, 29, 0.90)',
          borderColor: '#1E2E44',
        }}
        className="rounded-xl border backdrop-blur-md shadow-2xl p-5"
      >
        {/* Header */}
        <div
          style={{ borderColor: '#1B283C' }}
          className="flex items-center justify-between gap-3 border-b pb-3.5 mb-4"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                borderColor: `${theme.accentInfo}55`,
                backgroundColor: `${theme.accentInfo}1A`,
              }}
              className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
            >
              <Car style={{ color: theme.accentInfo }} className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                style={{ color: theme.textPrimary }}
                className="font-display text-sm sm:text-[15px] font-bold leading-tight"
              >
                Vehicle Fitment Finder
              </h2>
            </div>
          </div>
          <span
            style={{ color: theme.accentInfo }}
            className="text-[10px] font-mono-tech uppercase tracking-wider"
          >
            01 · Fitment
          </span>
        </div>

        {/* Form: Compact Horizontal Label-Left / Select-Right Rows Matching Panel 1 */}
        <form onSubmit={handleCheckCompatibility} className="space-y-2.5">
          <div className="grid grid-cols-[54px_1fr] items-center gap-3">
            <label
              htmlFor="fitment-year"
              style={{ color: theme.textSecondary }}
              className="text-xs font-medium"
            >
              Year
            </label>
            <select
              id="fitment-year"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              style={selectStyle}
              className="w-full h-9 rounded-md border px-3 text-xs focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="">Select year</option>
              {clientConfig.fitmentOptions.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[54px_1fr] items-center gap-3">
            <label
              htmlFor="fitment-make"
              style={{ color: theme.textSecondary }}
              className="text-xs font-medium"
            >
              Make
            </label>
            <select
              id="fitment-make"
              value={make}
              onChange={(e) => handleMakeChange(e.target.value)}
              style={selectStyle}
              className="w-full h-9 rounded-md border px-3 text-xs focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="">Select Make</option>
              {clientConfig.fitmentOptions.makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[54px_1fr] items-center gap-3">
            <label
              htmlFor="fitment-model"
              style={{ color: theme.textSecondary }}
              className="text-xs font-medium"
            >
              Model
            </label>
            <select
              id="fitment-model"
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              style={selectStyle}
              className="w-full h-9 rounded-md border px-3 text-xs focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="">Select Model</option>
              {availableModels.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[54px_1fr] items-center gap-3">
            <label
              htmlFor="fitment-class"
              style={{ color: theme.textSecondary }}
              className="text-xs font-medium"
            >
              Class
            </label>
            <select
              id="fitment-class"
              value={vehicleClass}
              onChange={(e) => handleClassChange(e.target.value)}
              style={selectStyle}
              className="w-full h-9 rounded-md border px-3 text-xs focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="">Select Class</option>
              {clientConfig.fitmentOptions.vehicleClasses.map((vc) => (
                <option key={vc} value={vc}>
                  {vc}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1.5">
            <button
              type="submit"
              disabled={!allFourChosen}
              style={checkBtnStyle}
              className="w-full h-10 rounded-full border px-5 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <span>Check Compatibility</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Result Panel */}
        {result && (
          <div
            data-testid="fitment-result-panel"
            style={{ borderColor: '#1B283C' }}
            className="mt-4 border-t pt-3.5 space-y-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              {result.status === 'verified' ? (
                <span
                  style={{
                    backgroundColor: theme.badgeVerifiedBg,
                    borderColor: theme.badgeVerifiedBorder,
                    color: theme.badgeVerifiedText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: theme.badgeWarnBg,
                    borderColor: theme.badgeWarnBorder,
                    color: theme.badgeWarnText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold"
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              )}
              <span style={{ color: theme.textSecondary }} className="text-[11px] font-mono-tech">
                {year} {make} {model} · {vehicleClass}
              </span>
            </div>

            <p style={{ color: theme.textPrimary }} className="text-xs">
              {result.summaryText}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleAttach}
                style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Attach vehicle to quote</span>
              </button>
              {attachedGroupCount > 0 && (
                <span style={{ color: theme.accentInfo }} className="text-[11px] font-mono-tech">
                  Active groups: {attachedGroupCount}
                </span>
              )}
            </div>

            {attachedNotice && (
              <p style={{ color: theme.accentInfo }} className="text-[11px] font-mono-tech">
                {attachedNotice}
              </p>
            )}

            {recommendedHarness && (
              <div
                style={{
                  backgroundColor: '#09101B',
                  borderColor: '#1B283C',
                }}
                className="rounded-lg border p-2.5 space-y-1.5"
              >
                <div
                  style={{ color: theme.accentInfo }}
                  className="flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-wider"
                >
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="w-3 h-3" aria-hidden="true" />
                    <span>Recommended add-on</span>
                  </span>
                  <span style={{ color: theme.textMuted }}>Optional</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div style={{ color: theme.textPrimary }} className="text-xs font-semibold">
                      {recommendedHarness.name}
                    </div>
                    <div
                      style={{ color: theme.textSecondary }}
                      className="text-[11px] font-mono-tech mt-0.5"
                    >
                      From {formatCad(getTier1Price(recommendedHarness))} /{' '}
                      {recommendedHarness.unitLabel}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddProduct(recommendedHarness.sku);
                      setHarnessAddedNotice(true);
                    }}
                    style={{
                      borderColor: theme.ctaBg,
                      color: theme.accentPrimary,
                    }}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>
                {harnessAddedNotice && (
                  <p style={{ color: theme.accentInfo }} className="text-[11px] font-mono-tech">
                    Added {recommendedHarness.sku} to quote list.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verbatim static disclaimer note */}
        <p
          style={{ borderColor: '#1B283C', color: theme.textMuted }}
          className="mt-4 pt-3 border-t text-[9.5px] font-mono-tech leading-relaxed tracking-wide"
        >
          {clientConfig.fitmentDisclaimer}
        </p>
      </div>
    </div>
  );
};

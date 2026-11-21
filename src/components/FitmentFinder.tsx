import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Plus, Wrench, Car } from 'lucide-react';
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
  layout = 'docked-vertical',
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
    backgroundColor: theme.bgInput,
    borderColor: theme.borderStrong,
    color: theme.textPrimary,
  };

  const checkBtnStyle: React.CSSProperties = allFourChosen
    ? {
        backgroundColor: theme.isLight ? '#0F172A' : '#F2EFE9',
        color: theme.isLight ? '#FFFFFF' : '#111417',
        borderColor: theme.isLight ? '#0F172A' : '#F2EFE9',
      }
    : {
        backgroundColor: theme.bgElevated,
        color: theme.textMuted,
        borderColor: theme.border,
      };

  const isVertical = layout === 'docked-vertical';

  return (
    <div id="fitment" className="scroll-mt-20">
      <div
        style={{
          backgroundColor: theme.isLight ? 'rgba(255,255,255,0.96)' : 'rgba(16, 21, 28, 0.92)',
          borderColor: theme.borderStrong,
        }}
        className="border backdrop-blur-md shadow-2xl p-5"
      >
        {/* Header */}
        <div
          style={{ borderColor: theme.border }}
          className="flex items-center justify-between gap-3 border-b pb-3.5 mb-4"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                borderColor: `${theme.accentInfo}66`,
                backgroundColor: `${theme.accentInfo}1A`,
              }}
              className="w-9 h-9 rounded-xs border flex items-center justify-center shrink-0"
            >
              <Car style={{ color: theme.accentInfo }} className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div
                style={{ color: theme.accentInfo }}
                className="text-[10px] font-mono-tech uppercase tracking-[0.14em]"
              >
                01 · Vehicle Fitment
              </div>
              <h2
                style={{ color: theme.textPrimary }}
                className="font-display text-sm sm:text-base font-bold leading-tight"
              >
                Vehicle Fitment Finder
              </h2>
            </div>
          </div>
          <span
            style={{ color: theme.textMuted }}
            className="text-[10px] font-mono-tech text-right"
          >
            {clientConfig.brand.demoNote}
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleCheckCompatibility}
          className={
            isVertical
              ? 'space-y-3'
              : 'flex flex-col lg:flex-row lg:items-end gap-3'
          }
        >
          <div
            className={
              isVertical
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1'
            }
          >
            <div>
              <label
                htmlFor="fitment-year"
                style={{ color: theme.textSecondary }}
                className="block text-[11px] font-mono-tech uppercase tracking-wider mb-1"
              >
                Vehicle year
              </label>
              <select
                id="fitment-year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                style={selectStyle}
                className="w-full h-10 rounded-xs border px-3 text-sm focus:outline-none"
              >
                <option value="">Select year</option>
                {clientConfig.fitmentOptions.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fitment-make"
                style={{ color: theme.textSecondary }}
                className="block text-[11px] font-mono-tech uppercase tracking-wider mb-1"
              >
                Make
              </label>
              <select
                id="fitment-make"
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                style={selectStyle}
                className="w-full h-10 rounded-xs border px-3 text-sm focus:outline-none"
              >
                <option value="">Select make</option>
                {clientConfig.fitmentOptions.makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fitment-model"
                style={{ color: theme.textSecondary }}
                className="block text-[11px] font-mono-tech uppercase tracking-wider mb-1"
              >
                Model / chassis
              </label>
              <select
                id="fitment-model"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                style={selectStyle}
                className="w-full h-10 rounded-xs border px-3 text-sm focus:outline-none"
              >
                <option value="">Select model / chassis</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fitment-class"
                style={{ color: theme.textSecondary }}
                className="block text-[11px] font-mono-tech uppercase tracking-wider mb-1"
              >
                Vehicle class
              </label>
              <select
                id="fitment-class"
                value={vehicleClass}
                onChange={(e) => handleClassChange(e.target.value)}
                style={selectStyle}
                className="w-full h-10 rounded-xs border px-3 text-sm focus:outline-none"
              >
                <option value="">Select vehicle class</option>
                {clientConfig.fitmentOptions.vehicleClasses.map((vc) => (
                  <option key={vc} value={vc}>
                    {vc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!allFourChosen}
            style={checkBtnStyle}
            className={`${
              isVertical ? 'w-full' : 'w-full lg:w-auto'
            } h-10 rounded-xs border px-5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0`}
          >
            Check compatibility
          </button>
        </form>

        {/* Result Panel */}
        {result && (
          <div
            data-testid="fitment-result-panel"
            style={{ borderColor: theme.border }}
            className="mt-4 border-t pt-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {result.status === 'verified' ? (
                <span
                  style={{
                    backgroundColor: theme.badgeVerifiedBg,
                    borderColor: theme.badgeVerifiedBorder,
                    color: theme.badgeVerifiedText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-xs font-semibold"
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
                  className="inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-xs font-semibold"
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              )}
              <span style={{ color: theme.textSecondary }} className="text-xs font-mono-tech">
                {year} {make} {model} · {vehicleClass}
              </span>
            </div>

            <p style={{ color: theme.textPrimary }} className="text-xs sm:text-sm">
              {result.summaryText}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAttach}
                style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                className="inline-flex items-center gap-1.5 rounded-xs px-3.5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Attach vehicle to quote</span>
              </button>
              {attachedGroupCount > 0 && (
                <span style={{ color: theme.accentInfo }} className="text-xs font-mono-tech">
                  Active vehicle groups: {attachedGroupCount}
                </span>
              )}
            </div>

            {attachedNotice && (
              <p style={{ color: theme.accentInfo }} className="text-xs font-mono-tech">
                {attachedNotice}
              </p>
            )}

            {recommendedHarness && (
              <div
                style={{
                  backgroundColor: theme.bgCanvas,
                  borderColor: theme.border,
                }}
                className="border p-3 space-y-2"
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
                <div className="flex items-center justify-between gap-3">
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
                      color: theme.isLight ? theme.ctaBg : theme.accentPrimary,
                    }}
                    className="inline-flex items-center gap-1 rounded-xs border px-3 py-1.5 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
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
          style={{ borderColor: theme.border, color: theme.textMuted }}
          className="mt-4 pt-3 border-t text-[10px] font-mono-tech leading-relaxed tracking-wide"
        >
          {clientConfig.fitmentDisclaimer}
        </p>
      </div>
    </div>
  );
};

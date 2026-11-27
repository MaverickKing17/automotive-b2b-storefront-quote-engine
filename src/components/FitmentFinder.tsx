import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  HelpCircle,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  clientConfig,
  evaluateVehicleFitment,
  formatCad,
  getTier1Price,
} from '../data/clientConfig';
import {
  getProductBySkuForStorefront,
  type StorefrontId,
  type StorefrontTheme,
} from '../data/storefronts';
import type { FitmentEvaluation, VehicleSelection } from '../types/quote';

interface FitmentFinderProps {
  theme: StorefrontTheme;
  storefrontId?: StorefrontId;
  recommendedAddonSku?: string;
  layout?: 'docked-vertical' | 'horizontal-bar';
  onAttachVehicle: (vehicle: VehicleSelection, quantity?: number) => void;
  onAddProduct: (sku: string) => void;
  onOpenDrawer?: () => void;
  attachedGroupCount: number;
}

export const FitmentFinder: React.FC<FitmentFinderProps> = ({
  theme,
  storefrontId = 'astrateq',
  recommendedAddonSku,
  layout = 'docked-vertical',
  onAttachVehicle,
  onAddProduct,
  onOpenDrawer,
  attachedGroupCount,
}) => {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');
  const [vehicleQty, setVehicleQty] = useState(1);
  const [result, setResult] = useState<FitmentEvaluation | null>(null);
  const [attachedNotice, setAttachedNotice] = useState<string | null>(null);
  const [harnessAddedNotice, setHarnessAddedNotice] = useState(false);

  const availableModels = make
    ? clientConfig.fitmentOptions.modelsByMake[make] ?? clientConfig.fitmentOptions.allModelsFallback
    : clientConfig.fitmentOptions.allModelsFallback;

  const allFourChosen = Boolean(year && make && model && vehicleClass);
  const isHorizontal = layout === 'horizontal-bar';

  const handleYearChange = (nextYear: string) => {
    setYear(nextYear);
    setResult(null);
    setAttachedNotice(null);
    setHarnessAddedNotice(false);
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
    const safeQty = Math.max(1, Math.floor(vehicleQty) || 1);
    onAttachVehicle({ year, make, model, vehicleClass }, safeQty);
    setAttachedNotice(
      `${safeQty} × ${year} ${make} ${model} (${vehicleClass}) attached as a vehicle group.`
    );
  };

  const targetAddonSku = recommendedAddonSku ?? result?.recommendedHarnessSku;
  const recommendedHarness =
    result && targetAddonSku
      ? getProductBySkuForStorefront(storefrontId, targetAddonSku)
      : undefined;

  const selectStyle: React.CSSProperties = isHorizontal
    ? {
        backgroundColor: theme.bgInput,
        borderColor: theme.borderStrong,
        color: theme.textPrimary,
      }
    : {
        backgroundColor: '#0E1726',
        borderColor: '#25354B',
        color: theme.textPrimary,
      };

  const checkBtnStyle: React.CSSProperties = isHorizontal
    ? allFourChosen
      ? {
          backgroundColor: theme.ctaBg,
          color: theme.ctaText,
          borderColor: theme.ctaBg,
        }
      : {
          backgroundColor: theme.bgElevated,
          color: theme.textMuted,
          borderColor: theme.border,
        }
    : allFourChosen
      ? {
          backgroundColor: '#FACC15',
          color: '#090E16',
          borderColor: '#FACC15',
        }
      : {
          backgroundColor: 'rgba(250, 204, 21, 0.35)',
          color: '#E2E8F0',
          borderColor: 'rgba(250, 204, 21, 0.45)',
        };

  return (
    <div id="fitment" className="scroll-mt-20">
      <div
        style={
          isHorizontal
            ? {
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }
            : {
                backgroundColor: 'rgba(11, 18, 29, 0.90)',
                borderColor: '#1F3147',
              }
        }
        className={`rounded-xl border ${
          isHorizontal ? 'p-5 shadow-sm' : 'backdrop-blur-md shadow-2xl p-4'
        }`}
      >
        {/* Header */}
        <div
          style={{ borderColor: isHorizontal ? theme.border : '#1B283C' }}
          className="flex items-center justify-between gap-2.5 border-b pb-3 mb-3"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                borderColor: `${theme.isLight ? theme.accentPrimary : theme.accentInfo}55`,
                backgroundColor: `${theme.isLight ? theme.accentPrimary : theme.accentInfo}1A`,
              }}
              className="w-7 h-7 rounded-md border flex items-center justify-center shrink-0"
            >
              <Car
                style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                className="w-4 h-4"
                aria-hidden="true"
              />
            </div>
            <h2
              style={{ color: theme.textPrimary }}
              className="font-display text-sm font-bold leading-tight"
            >
              Vehicle Fitment Finder
            </h2>
          </div>
          {isHorizontal && (
            <span style={{ color: theme.textMuted }} className="text-[11px] font-mono-tech">
              {clientConfig.brand.demoNote}
            </span>
          )}
        </div>

        {/* Form */}
        {isHorizontal ? (
          <form
            onSubmit={handleCheckCompatibility}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div>
              <label
                htmlFor="fitment-year"
                style={{ color: theme.textSecondary }}
                className="block text-[11px] font-mono-tech uppercase mb-1"
              >
                Year
              </label>
              <select
                id="fitment-year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                style={selectStyle}
                className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
              >
                <option value="">Select Year</option>
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
                className="block text-[11px] font-mono-tech uppercase mb-1"
              >
                Make
              </label>
              <select
                id="fitment-make"
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                style={selectStyle}
                className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
              >
                <option value="">Select Make</option>
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
                className="block text-[11px] font-mono-tech uppercase mb-1"
              >
                Model
              </label>
              <select
                id="fitment-model"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                style={selectStyle}
                className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
              >
                <option value="">Select Model</option>
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
                className="block text-[11px] font-mono-tech uppercase mb-1"
              >
                Class
              </label>
              <select
                id="fitment-class"
                value={vehicleClass}
                onChange={(e) => handleClassChange(e.target.value)}
                style={selectStyle}
                className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
              >
                <option value="">Select Class</option>
                {clientConfig.fitmentOptions.vehicleClasses.map((vc) => (
                  <option key={vc} value={vc}>
                    {vc}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!allFourChosen}
              style={checkBtnStyle}
              className="w-full h-9 rounded-full border px-4 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <span>Check Compatibility</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCheckCompatibility} className="space-y-2">
            <div className="grid grid-cols-[50px_1fr] items-center gap-2.5">
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
                className="w-full h-8 rounded-md border px-2.5 text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="">Select Year</option>
                {clientConfig.fitmentOptions.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[50px_1fr] items-center gap-2.5">
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
                className="w-full h-8 rounded-md border px-2.5 text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="">Select Make</option>
                {clientConfig.fitmentOptions.makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[50px_1fr] items-center gap-2.5">
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
                className="w-full h-8 rounded-md border px-2.5 text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="">Select Model</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[50px_1fr] items-center gap-2.5">
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
                className="w-full h-8 rounded-md border px-2.5 text-xs focus:outline-none focus:border-[#22D3EE]"
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
                className="w-full h-9 rounded-full border px-4 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <span>Check Compatibility</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {/* Result Panel */}
        {result && (
          <div
            data-testid="fitment-result-panel"
            style={{ borderColor: isHorizontal ? theme.border : '#1B283C' }}
            className="mt-3.5 border-t pt-3 space-y-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              {result.status === 'verified' ? (
                <span
                  style={{
                    backgroundColor: theme.badgeVerifiedBg,
                    borderColor: theme.badgeVerifiedBorder,
                    color: theme.badgeVerifiedText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              ) : result.status === 'requires-verification' ? (
                <span
                  style={{
                    backgroundColor: theme.badgeWarnBg,
                    borderColor: theme.badgeWarnBorder,
                    color: theme.badgeWarnText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: isHorizontal ? theme.bgElevated : '#152236',
                    borderColor: theme.borderStrong,
                    color: theme.textSecondary,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{result.headlineBadge}</span>
                </span>
              )}
              <span style={{ color: theme.textSecondary }} className="text-[11px] font-mono-tech">
                {year} {make} {model} · {vehicleClass}
              </span>
            </div>

            <p style={{ color: theme.textPrimary }} className="text-xs leading-relaxed">
              {result.summaryText}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5">
                <label
                  htmlFor="fitment-qty"
                  style={{ color: theme.textSecondary }}
                  className="text-[11px] font-mono-tech uppercase"
                >
                  Qty
                </label>
                <input
                  id="fitment-qty"
                  type="number"
                  min={1}
                  max={999}
                  value={vehicleQty}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!Number.isNaN(parsed) && parsed >= 1) {
                      setVehicleQty(parsed);
                    }
                  }}
                  style={selectStyle}
                  className="w-14 h-8 rounded-md border px-2 text-xs font-mono-tech text-center"
                />
              </div>

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
                <span
                  style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                  className="text-[11px] font-mono-tech"
                >
                  Groups: {attachedGroupCount}
                </span>
              )}
            </div>

            {attachedNotice && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                  className="text-[11px] font-mono-tech"
                >
                  {attachedNotice}
                </p>
                {onOpenDrawer && (
                  <button
                    type="button"
                    onClick={onOpenDrawer}
                    style={{ color: theme.textPrimary }}
                    className="text-[11px] font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    Review in quote →
                  </button>
                )}
              </div>
            )}

            {recommendedHarness && (
              <div
                style={{
                  backgroundColor: isHorizontal ? theme.bgElevated : '#09101B',
                  borderColor: isHorizontal ? theme.border : '#1B283C',
                }}
                className="rounded-lg border p-2.5 space-y-1.5"
              >
                <div
                  style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
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
                    style={
                      theme.isLight
                        ? {
                            backgroundColor: theme.ctaBg,
                            borderColor: theme.ctaBg,
                            color: theme.ctaText,
                          }
                        : {
                            borderColor: theme.ctaBg,
                            color: theme.accentPrimary,
                          }
                    }
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>
                {harnessAddedNotice && (
                  <p
                    style={{ color: theme.isLight ? theme.accentPrimary : theme.accentInfo }}
                    className="text-[11px] font-mono-tech"
                  >
                    Added {recommendedHarness.sku} to quote list.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verbatim static disclaimer note */}
        <p
          style={{ borderColor: isHorizontal ? theme.border : '#1B283C', color: theme.textMuted }}
          className="mt-3 pt-2.5 border-t text-[9px] font-mono-tech leading-snug tracking-wide"
        >
          {clientConfig.fitmentDisclaimer}
        </p>
      </div>
    </div>
  );
};

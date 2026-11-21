import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Plus, Wrench, Car } from 'lucide-react';
import {
  clientConfig,
  evaluateVehicleFitment,
  formatCad,
  getProductBySku,
  getTier1Price,
} from '../data/clientConfig';
import type { FitmentEvaluation, VehicleSelection } from '../types/quote';

interface FitmentFinderProps {
  onAttachVehicle: (vehicle: VehicleSelection) => void;
  onAddProduct: (sku: string) => void;
  attachedGroupCount: number;
}

export const FitmentFinder: React.FC<FitmentFinderProps> = ({
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

  return (
    <div id="fitment" className="scroll-mt-20">
      {/* Horizontal Full-Width Glassmorphic Bar matching Mockup 1 */}
      <div className="border border-[#22D3EE]/30 bg-[#10151C]/92 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <form
          onSubmit={handleCheckCompatibility}
          className="flex flex-col xl:flex-row xl:items-center gap-4"
        >
          {/* Left Label Block */}
          <div className="flex items-center gap-3 xl:w-64 shrink-0">
            <div className="w-10 h-10 rounded-xs border border-[#22D3EE]/40 bg-[#22D3EE]/10 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#22D3EE]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] font-mono-tech uppercase tracking-[0.14em] text-[#22D3EE]">
                01 · Vehicle Fitment
              </div>
              <h2 className="font-display text-sm sm:text-base font-bold text-[#F2EFE9] leading-tight">
                Vehicle Fitment Finder
              </h2>
              <p className="text-[11px] text-[#76808D] leading-tight mt-0.5">
                {clientConfig.brand.demoNote}
              </p>
            </div>
          </div>

          {/* Middle 4 Horizontal Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
            <div>
              <label htmlFor="fitment-year" className="sr-only">
                Vehicle year
              </label>
              <select
                id="fitment-year"
                aria-label="Vehicle year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full h-10 rounded-xs border border-[#2E3742] bg-[#171C23] px-3 text-xs sm:text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
              >
                <option value="">Vehicle year</option>
                {clientConfig.fitmentOptions.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fitment-make" className="sr-only">
                Make
              </label>
              <select
                id="fitment-make"
                aria-label="Make"
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full h-10 rounded-xs border border-[#2E3742] bg-[#171C23] px-3 text-xs sm:text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
              >
                <option value="">Make</option>
                {clientConfig.fitmentOptions.makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fitment-model" className="sr-only">
                Model / chassis
              </label>
              <select
                id="fitment-model"
                aria-label="Model / chassis"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full h-10 rounded-xs border border-[#2E3742] bg-[#171C23] px-3 text-xs sm:text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
              >
                <option value="">Model / chassis</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fitment-class" className="sr-only">
                Vehicle class
              </label>
              <select
                id="fitment-class"
                aria-label="Vehicle class"
                value={vehicleClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full h-10 rounded-xs border border-[#2E3742] bg-[#171C23] px-3 text-xs sm:text-sm text-[#F2EFE9] focus:border-[#22D3EE] focus:outline-none"
              >
                <option value="">Vehicle class</option>
                {clientConfig.fitmentOptions.vehicleClasses.map((vc) => (
                  <option key={vc} value={vc}>
                    {vc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="xl:w-auto shrink-0">
            <button
              type="submit"
              disabled={!allFourChosen}
              className="w-full xl:w-auto h-10 rounded-xs border border-[#F2EFE9] bg-[#F2EFE9] px-5 text-xs font-semibold uppercase tracking-wider text-[#111417] hover:bg-white disabled:border-[#2B3138] disabled:bg-[#23282E] disabled:text-[#76808D] disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              Check compatibility
            </button>
          </div>
        </form>

        {/* Expandable Result Panel */}
        {result && (
          <div
            data-testid="fitment-result-panel"
            className="mt-4 border-t border-[#262C34] pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
          >
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                {result.status === 'verified' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xs border border-[#22D3EE]/50 bg-[#22D3EE]/10 px-3 py-1 text-xs font-semibold text-[#22D3EE]">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>{result.headlineBadge}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xs border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#F59E0B]">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <span>{result.headlineBadge}</span>
                  </span>
                )}
                <span className="text-xs font-mono-tech text-[#A7B0BC]">
                  {year} {make} {model} · {vehicleClass}
                </span>
              </div>

              <p className="text-sm text-[#F2EFE9]">{result.summaryText}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAttach}
                  className="inline-flex items-center gap-1.5 rounded-xs bg-[#F59E0B] px-4 py-2 text-xs font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Attach vehicle to quote</span>
                </button>

                {attachedGroupCount > 0 && (
                  <span className="text-xs font-mono-tech text-[#22D3EE]">
                    Active vehicle groups in quote: {attachedGroupCount}
                  </span>
                )}
              </div>

              {attachedNotice && (
                <p className="text-xs font-mono-tech text-[#22D3EE]">{attachedNotice}</p>
              )}
            </div>

            {recommendedHarness && (
              <div className="lg:col-span-5 border border-[#2B3138] bg-[#171A1D] p-3.5">
                <div className="flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-wider text-[#22D3EE] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Recommended add-on</span>
                  </span>
                  <span className="text-[#76808D]">Optional</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#F2EFE9]">
                      {recommendedHarness.name}
                    </div>
                    <div className="text-[11px] font-mono-tech text-[#A7B0BC] mt-0.5">
                      From {formatCad(getTier1Price(recommendedHarness))} /{' '}
                      {recommendedHarness.unitLabel} · {recommendedHarness.specs.interface}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddProduct(recommendedHarness.sku);
                      setHarnessAddedNotice(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-xs border border-[#F59E0B] px-3 py-1.5 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#111417] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>
                {harnessAddedNotice && (
                  <p className="mt-2 text-[11px] font-mono-tech text-[#22D3EE]">
                    Added {recommendedHarness.sku} to quote list.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verbatim static disclaimer note */}
      <p className="mt-2.5 text-[10px] font-mono-tech tracking-wide text-[#76808D]">
        {clientConfig.fitmentDisclaimer}
      </p>
    </div>
  );
};

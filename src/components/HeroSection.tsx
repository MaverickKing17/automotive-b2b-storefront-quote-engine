import React from 'react';
import { ArrowRight } from 'lucide-react';
import { clientConfig } from '../data/clientConfig';
import type { VehicleSelection } from '../types/quote';
import { FitmentFinder } from './FitmentFinder';
import { CategoryShowcase } from './CategoryShowcase';

interface HeroSectionProps {
  onOpenDrawer: () => void;
  onAttachVehicle: (vehicle: VehicleSelection) => void;
  onAddProduct: (sku: string) => void;
  onSelectCategory: (category: string) => void;
  attachedGroupCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDrawer,
  onAttachVehicle,
  onAddProduct,
  onSelectCategory,
  attachedGroupCount,
}) => {
  return (
    <section id="top" className="relative border-b border-[#2B3138] bg-[#171A1D] overflow-hidden">
      {/* Full-bleed twilight highway hero backdrop matching Mockup 1 */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={clientConfig.brand.heroImageUrl}
            alt="Commercial fleet truck and SUV driving on twilight city highway"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          {/* Left dark asphalt scrim for crisp text legibility while keeping the right truck & skyline vibrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#11151B]/95 via-[#141920]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171A1D] via-[#171A1D]/35 to-[#0F1318]/40" />
        </div>

        <div className="relative mx-auto max-w-[1360px] px-6 pt-12 pb-10 lg:pt-16 lg:pb-12">
          {/* Top Hero Copy (Left-anchored like Mockup 1) */}
          <div className="max-w-xl">
            <p className="text-[11px] font-mono-tech uppercase tracking-[0.18em] text-[#22D3EE] mb-3">
              {clientConfig.brand.tagline}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#F2EFE9] leading-[1.06] [text-wrap:balance]">
              Smarter Technology for Every Fleet.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#C8D0DA] leading-relaxed max-w-md">
              Advanced dashcams, telematics gateways, ADAS retrofits, and EV depot controls for
              modern commercial fleets—priced in CAD tiers.
            </p>

            {/* ONE amber primary CTA + secondary text link */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenDrawer}
                className="inline-flex items-center gap-2 rounded-xs bg-[#F59E0B] px-6 py-3 text-xs sm:text-sm font-semibold text-[#111417] hover:bg-[#FBBF24] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A1D]"
              >
                <span>Build fleet quote</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href="#hardware"
                className="inline-flex items-center rounded-xs border border-[#3E4856] bg-[#141920]/75 px-5 py-3 text-xs sm:text-sm font-medium text-[#F2EFE9] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0"
              >
                Browse hardware specs
              </a>
            </div>
          </div>

          {/* Horizontal 01 Vehicle Fitment Finder Bar anchored below Hero copy */}
          <div className="mt-10 lg:mt-12">
            <FitmentFinder
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>

          {/* 5-Card Category Strip sitting seamlessly below Fitment Finder (matching Mockup 1) */}
          <div className="mt-6">
            <CategoryShowcase onSelectCategory={onSelectCategory} />
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Plus, Zap } from 'lucide-react';
import { formatCad, getTier1Price } from '../data/clientConfig';
import { getProductBySkuForStorefront, type StorefrontConfig } from '../data/storefronts';
import type { DeploymentAnswers, VehicleSelection } from '../types/quote';
import { FitmentFinder } from './FitmentFinder';
import { NeedAdviceCard, TrustPillarsStrip } from './CategoryShowcase';

interface HeroSectionProps {
  storefront: StorefrontConfig;
  deployment: DeploymentAnswers;
  onUpdateDeployment: (patch: Partial<DeploymentAnswers>) => void;
  onOpenDrawer: () => void;
  onSetStep: (step: 1 | 2 | 3) => void;
  onAttachVehicle: (vehicle: VehicleSelection) => void;
  onAddProduct: (sku: string) => void;
  onSelectCategory: (category: string) => void;
  attachedGroupCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  storefront,
  deployment,
  onUpdateDeployment,
  onOpenDrawer,
  onSetStep,
  onAttachVehicle,
  onAddProduct,
  onSelectCategory,
  attachedGroupCount,
}) => {
  const { theme } = storefront;

  // VoltDepot EV Charging Site Finder local state
  const [evFleetSize, setEvFleetSize] = useState(
    deployment.fleetSize || storefront.chargingOptions?.fleetSizes[0] || '6–25 EVs'
  );
  const [evChargingType, setEvChargingType] = useState(
    deployment.chargingType ||
      storefront.chargingOptions?.chargingTypes[0] ||
      'Overnight AC Level 2 (11.5–19.2kW)'
  );
  const [evChargingBays, setEvChargingBays] = useState(
    deployment.chargingBays || storefront.chargingOptions?.chargingBays[0] || '1–4 Charging Bays'
  );
  const [evSiteConditions, setEvSiteConditions] = useState(
    deployment.siteConditions ||
      storefront.chargingOptions?.siteConditions[0] ||
      'Outdoor Surface Lot (Cold Climate)'
  );
  const [evElectricalService, setEvElectricalService] = useState(
    deployment.electricalService ||
      storefront.chargingOptions?.electricalServices[0] ||
      '480V 3-Phase Commercial Service'
  );
  const [evRegion, setEvRegion] = useState(
    deployment.siteLocation ||
      storefront.chargingOptions?.regions[0] ||
      'Ontario & Quebec'
  );
  const [evResultVisible, setEvResultVisible] = useState(false);

  const handleBrowsePrimary = () => {
    onSelectCategory(storefront.defaultCategory);
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoltFindSolutions = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDeployment({
      fleetSize: evFleetSize,
      chargingType: evChargingType,
      chargingBays: evChargingBays,
      siteConditions: evSiteConditions,
      electricalService: evElectricalService,
      siteLocation: evRegion,
    });
    setEvResultVisible(true);
  };

  const handleSelectUpfitLocation = (loc: string) => {
    onUpdateDeployment({ upfitLocation: loc });
  };

  // STOREFRONT 1 — ASTRATEQ GADGETS (Preserved Exact Visual Reproduction)
  if (storefront.heroLayout === 'docked-right-finder') {
    return (
      <div id="top">
        <section style={{ backgroundColor: theme.bgCanvas }} className="relative overflow-hidden">
          <div className="relative min-h-[430px] lg:min-h-[470px] flex items-center">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={storefront.heroImageUrl}
                alt={storefront.heroImageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_44%] lg:scale-[1.16] lg:-translate-x-[7%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060B13] via-[#070E1A]/85 via-35% to-transparent" />
              <div
                style={{
                  background: `linear-gradient(to top, ${theme.bgCanvas} 0%, transparent 22%)`,
                }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative w-full mx-auto max-w-[1360px] px-4 sm:px-6 py-9 lg:py-11">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-[500px]">
                  <p
                    style={{ color: theme.accentInfo }}
                    className="text-[11px] font-mono-tech uppercase tracking-[0.18em] font-semibold mb-2.5"
                  >
                    AUTOMOTIVE TECHNOLOGY · FLEET SOLUTIONS
                  </p>

                  <h1
                    style={{ color: theme.textPrimary }}
                    className="font-display text-[36px] sm:text-[44px] lg:text-[48px] font-bold tracking-tight leading-[1.06]"
                  >
                    Drive With
                    <br />
                    <span className="sm:whitespace-nowrap">Absolute Confidence.</span>
                  </h1>

                  <p
                    style={{ color: '#B6C3D4' }}
                    className="mt-3.5 text-sm sm:text-[15px] leading-relaxed max-w-[435px]"
                  >
                    Advanced automotive hardware, intelligent telematics and fleet technology
                    engineered for modern mobility.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.secondaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <a
                      href="#hardware"
                      onClick={() => onSelectCategory(storefront.defaultCategory)}
                      style={{
                        borderColor: '#334A66',
                        backgroundColor: 'rgba(10, 19, 32, 0.78)',
                        color: theme.textPrimary,
                      }}
                      className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs sm:text-[13px] font-medium hover:border-[#22D3EE]/60 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.primaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="w-full max-w-[320px] lg:shrink-0">
                  <FitmentFinder
                    theme={theme}
                    storefrontId={storefront.id}
                    recommendedAddonSku={storefront.recommendedAddonSku}
                    layout="docked-vertical"
                    onAttachVehicle={onAttachVehicle}
                    onAddProduct={onAddProduct}
                    attachedGroupCount={attachedGroupCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ backgroundColor: theme.bgCanvas }}>
          <TrustPillarsStrip storefront={storefront} />
        </div>
      </div>
    );
  }

  // Recommend VoltDepot-specific products based on charging selection
  const voltPrimarySku = evChargingType.toLowerCase().includes('dc') ? 'VDS-220' : 'VDS-110';
  const voltPrimary = getProductBySkuForStorefront('voltdepot', voltPrimarySku);
  const voltLoadController = getProductBySkuForStorefront('voltdepot', 'VDS-330');

  // STOREFRONTS 2, 3, 4 — Branded Hero + Differentiated Industry Workflows
  return (
    <div id="top">
      <section
        style={{ backgroundColor: theme.bgCanvas }}
        className="relative overflow-hidden"
      >
        <div className="relative min-h-[410px] lg:min-h-[455px] flex items-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={storefront.heroImageUrl}
              alt={storefront.heroImageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-right md:object-center"
            />
            <div className={`absolute inset-0 ${theme.heroScrimClass}`} />
            {!theme.isLight && (
              <div
                style={{
                  background: `linear-gradient(to top, ${theme.bgCanvas} 0%, transparent 25%)`,
                }}
                className="absolute inset-0"
              />
            )}
          </div>

          <div className="relative w-full mx-auto max-w-[1360px] px-4 sm:px-6 py-10 lg:py-12">
            <div className="max-w-xl">
              <p
                style={{ color: theme.accentPrimary }}
                className="text-[11px] font-mono-tech uppercase tracking-[0.18em] font-semibold mb-2.5"
              >
                {storefront.tagline}
              </p>

              <h1
                style={{ color: theme.textPrimary }}
                className="font-display text-[36px] sm:text-[44px] lg:text-[48px] font-bold tracking-tight leading-[1.06]"
              >
                {storefront.heroHeadlinePrefix}
                {storefront.heroHeadlineHighlight && (
                  <>
                    <br />
                    <span>{storefront.heroHeadlineHighlight}</span>
                  </>
                )}
              </h1>

              <p
                style={{ color: theme.textSecondary }}
                className="mt-3.5 text-sm sm:text-[15px] leading-relaxed max-w-[450px]"
              >
                {storefront.heroSubtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {storefront.id === 'truenorth' ? (
                  <>
                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={{
                        backgroundColor: '#F59E0B',
                        color: '#090E16',
                      }}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:bg-[#FBBF24] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.secondaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <a
                      href="#hardware"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBrowsePrimary();
                      }}
                      style={{ color: theme.textPrimary }}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium underline underline-offset-4 decoration-white/45 hover:decoration-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.primaryCtaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                    </a>
                  </>
                ) : storefront.id === 'voltdepot' ? (
                  <>
                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.secondaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={handleBrowsePrimary}
                      style={{
                        borderColor: theme.borderStrong,
                        backgroundColor: 'rgba(15, 19, 23, 0.78)',
                        color: theme.textPrimary,
                      }}
                      className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.primaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBrowsePrimary}
                      style={
                        storefront.id === 'northlink'
                          ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                          : { backgroundColor: theme.ctaBg, color: theme.ctaText }
                      }
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.primaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={
                        storefront.id === 'northlink'
                          ? {
                              borderColor: theme.ctaBg,
                              backgroundColor: theme.ctaBg,
                              color: theme.ctaText,
                            }
                          : {
                              borderColor: theme.isLight ? theme.accentPrimary : theme.borderStrong,
                              backgroundColor: theme.isLight
                                ? 'rgba(255,255,255,0.92)'
                                : 'rgba(15, 19, 23, 0.78)',
                              color: theme.isLight ? theme.accentPrimary : theme.textPrimary,
                            }
                      }
                      className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{storefront.secondaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STOREFRONT 2 — NORTHLINK TELEMATICS POST-HERO (Quick Quote Engine + Telematics Scoping + Fitment Bar) */}
      {storefront.heroLayout === 'corporate-quick-quote' && (
        <div style={{ backgroundColor: theme.bgCanvas }}>
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-6 space-y-5">
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="rounded-xl border shadow-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-3.5">
                <div
                  style={{
                    backgroundColor: `${theme.accentPrimary}18`,
                    color: theme.accentPrimary,
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <Zap className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    style={{ color: theme.textPrimary }}
                    className="font-display text-base font-bold"
                  >
                    Quick Quote Engine
                  </h2>
                  <p style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    Configure fleet telematics scope, select NLT hardware, and submit RFQ.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl">
                {[
                  { num: 1 as const, label: 'Configure Fleet & Tracking' },
                  { num: 2 as const, label: 'Select Telematics SKUs' },
                  { num: 3 as const, label: 'Review & Submit RFQ' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num === 2) {
                        handleBrowsePrimary();
                      } else {
                        if (s.num === 1) onSetStep(1);
                        onOpenDrawer();
                      }
                    }}
                    className="flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <span
                      style={{ backgroundColor: theme.accentPrimary, color: '#FFFFFF' }}
                      className="w-6 h-6 rounded-full text-xs font-mono-tech font-bold flex items-center justify-center shrink-0"
                    >
                      {s.num}
                    </span>
                    <span
                      style={{ color: theme.textPrimary }}
                      className="text-xs font-semibold group-hover:underline"
                    >
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {storefront.northlinkOptions && (
              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.border,
                }}
                className="rounded-xl border shadow-sm p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3
                      style={{ color: theme.textPrimary }}
                      className="font-display text-sm font-bold"
                    >
                      Telematics &amp; Connectivity Deployment Profile
                    </h3>
                    <p style={{ color: theme.textSecondary }} className="text-xs">
                      Selections carry directly into your NorthLink corporate RFQ payload.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSetStep(1);
                      onOpenDrawer();
                    }}
                    style={{ color: theme.accentPrimary }}
                    className="text-xs font-semibold hover:underline cursor-pointer"
                  >
                    Open Quote Drawer →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor="nl-fleet-size"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Fleet Size
                    </label>
                    <select
                      id="nl-fleet-size"
                      value={deployment.fleetSize}
                      onChange={(e) => onUpdateDeployment({ fleetSize: e.target.value })}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.northlinkOptions.fleetSizes.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="nl-vehicle-types"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Vehicle Types
                    </label>
                    <select
                      id="nl-vehicle-types"
                      value={
                        deployment.vehicleTypes || storefront.northlinkOptions.vehicleTypes[0]
                      }
                      onChange={(e) => onUpdateDeployment({ vehicleTypes: e.target.value })}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.northlinkOptions.vehicleTypes.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="nl-tracking-req"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Tracking Requirements
                    </label>
                    <select
                      id="nl-tracking-req"
                      value={
                        deployment.trackingRequirements ||
                        storefront.northlinkOptions.trackingRequirements[0]
                      }
                      onChange={(e) =>
                        onUpdateDeployment({ trackingRequirements: e.target.value })
                      }
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.northlinkOptions.trackingRequirements.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="nl-connectivity"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Connectivity
                    </label>
                    <select
                      id="nl-connectivity"
                      value={
                        deployment.connectivityPreference ||
                        storefront.northlinkOptions.connectivityPreferences[0]
                      }
                      onChange={(e) =>
                        onUpdateDeployment({ connectivityPreference: e.target.value })
                      }
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.northlinkOptions.connectivityPreferences.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <TrustPillarsStrip storefront={storefront} />

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pb-4">
            <FitmentFinder
              theme={theme}
              storefrontId={storefront.id}
              recommendedAddonSku={storefront.recommendedAddonSku}
              layout="horizontal-bar"
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>
        </div>
      )}

      {/* STOREFRONT 3 — VOLTDEPOT SYSTEMS POST-HERO (Site Charging Requirements + Electrical Scope) */}
      {storefront.heroLayout === 'ev-split-finder' && (
        <div style={{ backgroundColor: theme.bgCanvas }}>
          <TrustPillarsStrip storefront={storefront} />

          <div
            id="charging-finder"
            className="mx-auto max-w-[1360px] px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch scroll-mt-20"
          >
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="lg:col-span-8 rounded-xl border p-5 flex flex-col justify-between"
            >
              <div>
                <h2
                  style={{ color: theme.textPrimary }}
                  className="font-display text-base sm:text-lg font-bold"
                >
                  Find the Right Charging Solution
                </h2>
                <p style={{ color: theme.textSecondary }} className="text-xs mt-1">
                  Specify charging requirements, bay count, site conditions, and electrical service for your EV depot RFQ.
                </p>

                <form
                  onSubmit={handleVoltFindSolutions}
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
                >
                  <div>
                    <label
                      htmlFor="volt-charging-type"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Charging Requirements
                    </label>
                    <select
                      id="volt-charging-type"
                      value={evChargingType}
                      onChange={(e) => setEvChargingType(e.target.value)}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.chargingOptions?.chargingTypes.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="volt-charging-bays"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Number of Charging Bays
                    </label>
                    <select
                      id="volt-charging-bays"
                      value={evChargingBays}
                      onChange={(e) => setEvChargingBays(e.target.value)}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.chargingOptions?.chargingBays.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="volt-site-conditions"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Site Conditions
                    </label>
                    <select
                      id="volt-site-conditions"
                      value={evSiteConditions}
                      onChange={(e) => setEvSiteConditions(e.target.value)}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.chargingOptions?.siteConditions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="volt-electrical-service"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Electrical Requirements
                    </label>
                    <select
                      id="volt-electrical-service"
                      value={evElectricalService}
                      onChange={(e) => setEvElectricalService(e.target.value)}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.chargingOptions?.electricalServices.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="volt-fleet-size"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      EV Fleet Size &amp; Region
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        id="volt-fleet-size"
                        aria-label="EV Fleet Size"
                        value={evFleetSize}
                        onChange={(e) => setEvFleetSize(e.target.value)}
                        style={{
                          backgroundColor: theme.bgInput,
                          borderColor: theme.borderStrong,
                          color: theme.textPrimary,
                        }}
                        className="w-full h-9 rounded-lg border px-2 text-xs focus:outline-none"
                      >
                        {storefront.chargingOptions?.fleetSizes.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <select
                        id="volt-region"
                        aria-label="Depot Region"
                        value={evRegion}
                        onChange={(e) => setEvRegion(e.target.value)}
                        style={{
                          backgroundColor: theme.bgInput,
                          borderColor: theme.borderStrong,
                          color: theme.textPrimary,
                        }}
                        className="w-full h-9 rounded-lg border px-2 text-xs focus:outline-none"
                      >
                        {storefront.chargingOptions?.regions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                    className="w-full h-9 rounded-full px-4 text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                  >
                    <span>Find Solutions</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </form>
              </div>

              {evResultVisible && (
                <div
                  style={{ borderColor: theme.border }}
                  className="mt-4 pt-3.5 border-t space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      style={{ color: theme.badgeVerifiedText }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        Depot profile saved: {evChargingBays} · {evElectricalService} · {evRegion}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={onOpenDrawer}
                      style={{ color: theme.accentPrimary }}
                      className="text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Open EV Quote Drawer →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {voltPrimary && (
                      <div
                        style={{ backgroundColor: theme.bgInput, borderColor: theme.border }}
                        className="rounded-lg border p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div style={{ color: theme.textPrimary }} className="text-xs font-semibold">
                            {voltPrimary.name}
                          </div>
                          <div style={{ color: theme.textSecondary }} className="text-[11px] font-mono-tech">
                            {voltPrimary.specs.power} · From {formatCad(getTier1Price(voltPrimary))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddProduct(voltPrimary.sku)}
                          style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer shrink-0"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}

                    {voltLoadController && (
                      <div
                        style={{ backgroundColor: theme.bgInput, borderColor: theme.border }}
                        className="rounded-lg border p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div style={{ color: theme.textPrimary }} className="text-xs font-semibold">
                            {voltLoadController.name}
                          </div>
                          <div style={{ color: theme.textSecondary }} className="text-[11px] font-mono-tech">
                            {voltLoadController.specs.interface} · From{' '}
                            {formatCad(getTier1Price(voltLoadController))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddProduct(voltLoadController.sku)}
                          style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer shrink-0"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <NeedAdviceCard storefront={storefront} onOpenDrawer={onOpenDrawer} />
            </div>
          </div>

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-1 pb-4">
            <FitmentFinder
              theme={theme}
              storefrontId={storefront.id}
              recommendedAddonSku={storefront.recommendedAddonSku}
              layout="horizontal-bar"
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>
        </div>
      )}

      {/* STOREFRONT 4 — TRUENORTH UPFITTING POST-HERO (Overlapping Pillars + Location + Upfit Scope) */}
      {storefront.heroLayout === 'upfitter-pillars' && (
        <div style={{ backgroundColor: theme.bgCanvas }}>
          <TrustPillarsStrip storefront={storefront} overlapping />

          <div
            id="locations"
            className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-6 pb-2 scroll-mt-20"
          >
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.border,
              }}
              className="rounded-xl border p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    style={{ color: theme.textPrimary }}
                    className="font-display text-base font-bold flex items-center gap-2"
                  >
                    <MapPin style={{ color: theme.accentPrimary }} className="w-4 h-4" aria-hidden="true" />
                    <span>Upfitting Hub, Vehicle Use &amp; Required Equipment</span>
                  </h2>
                  <p style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    Select a Canadian upfitting bay, specify trade use, equipment scope, and installation requirement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSetStep(1);
                    onOpenDrawer();
                  }}
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold hover:opacity-90 cursor-pointer whitespace-nowrap"
                >
                  <span>Continue Upfit RFQ</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {storefront.upfitLocations?.map((loc) => {
                  const selected = deployment.upfitLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleSelectUpfitLocation(loc)}
                      style={
                        selected
                          ? {
                              backgroundColor: `${theme.accentPrimary}22`,
                              borderColor: theme.accentPrimary,
                              color: theme.accentPrimary,
                            }
                          : {
                              backgroundColor: theme.bgInput,
                              borderColor: theme.border,
                              color: theme.textSecondary,
                            }
                      }
                      className="rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>

              {storefront.upfitWorkflowOptions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label
                      htmlFor="tn-vehicle-use"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Vehicle Use / Trade
                    </label>
                    <select
                      id="tn-vehicle-use"
                      value={
                        deployment.vehicleUse || storefront.upfitWorkflowOptions.vehicleUses[0]
                      }
                      onChange={(e) => onUpdateDeployment({ vehicleUse: e.target.value })}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.upfitWorkflowOptions.vehicleUses.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tn-required-equip"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Required Equipment
                    </label>
                    <select
                      id="tn-required-equip"
                      value={
                        deployment.requiredEquipment ||
                        storefront.upfitWorkflowOptions.requiredEquipment[0]
                      }
                      onChange={(e) => onUpdateDeployment({ requiredEquipment: e.target.value })}
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.upfitWorkflowOptions.requiredEquipment.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tn-install-req"
                      style={{ color: theme.textSecondary }}
                      className="block text-[11px] font-mono-tech uppercase mb-1"
                    >
                      Installation Requirements
                    </label>
                    <select
                      id="tn-install-req"
                      value={deployment.installationPreference}
                      onChange={(e) =>
                        onUpdateDeployment({ installationPreference: e.target.value })
                      }
                      style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.borderStrong,
                        color: theme.textPrimary,
                      }}
                      className="w-full h-9 rounded-lg border px-2.5 text-xs focus:outline-none"
                    >
                      {storefront.upfitWorkflowOptions.installationRequirements.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {deployment.upfitLocation && (
                <div
                  style={{ color: theme.accentPrimary }}
                  className="text-xs font-mono-tech flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Selected Upfit Hub for RFQ: {deployment.upfitLocation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-3 pb-4">
            <FitmentFinder
              theme={theme}
              storefrontId={storefront.id}
              recommendedAddonSku={storefront.recommendedAddonSku}
              layout="horizontal-bar"
              onAttachVehicle={onAttachVehicle}
              onAddProduct={onAddProduct}
              attachedGroupCount={attachedGroupCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

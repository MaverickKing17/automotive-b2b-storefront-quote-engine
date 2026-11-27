import React, { useState } from 'react';
import type { StorefrontConfig } from '../data/storefronts';

export const BrandMark: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-7 h-7',
  color = '#22D3EE',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 3L29 27H22.5L16 14.8L9.5 27H3L16 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="miter"
    />
    <path d="M11.2 22.5H20.8" stroke="currentColor" strokeWidth="2" />
    <circle cx="16" cy="9.5" r="1.5" fill={color} />
  </svg>
);

export const StorefrontLogo: React.FC<{ storefront: StorefrontConfig }> = ({ storefront }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (storefront.logoUrl && !imgFailed) {
    return (
      <img
        src={storefront.logoUrl}
        alt={`${storefront.brandName} logo`}
        referrerPolicy="no-referrer"
        decoding="async"
        onError={() => setImgFailed(true)}
        className="h-9 w-auto max-w-[150px] object-contain"
      />
    );
  }

  if (storefront.id === 'northlink') {
    return (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="4" fill="#1D63DC" />
        <path
          d="M9 22V10L16 18L23 10V22"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    );
  }

  if (storefront.id === 'voltdepot') {
    return (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" aria-hidden="true">
        <path d="M4 6L16 26L28 6H22L16 16.5L10 6H4Z" fill="#84CC16" />
        <path d="M16 12L19 7H13L16 12Z" fill="#F1F5F2" />
      </svg>
    );
  }

  if (storefront.id === 'truenorth') {
    return (
      <svg viewBox="0 0 36 28" className="w-9 h-7" fill="none" aria-hidden="true">
        <path d="M2 24L13 5L20 17L25 10L34 24H2Z" stroke="#F5F3EF" strokeWidth="2" />
        <path d="M13 5L17 12L13 15L9 12L13 5Z" fill="#F97316" />
      </svg>
    );
  }

  return <BrandMark className="w-8 h-8" color={storefront.theme.accentInfo} />;
};

export const HeroBlueprintSchematic: React.FC = () => (
  <div className="relative h-full min-h-[340px] w-full border border-[#2B3138] bg-[#14171A] blueprint-grid-fine p-5 flex flex-col justify-between overflow-hidden">
    <div className="flex items-center justify-between text-[11px] font-mono-tech tracking-wider text-[#76808D] border-b border-[#262C34] pb-3">
      <span>CAD SCHEMATIC · COMMERCIAL CHASSIS TOPOLOGY</span>
      <span className="text-[#22D3EE]">SYS-BUS: J1939 / OBD-II / EV</span>
    </div>

    <div className="relative my-auto py-4">
      <svg
        viewBox="0 0 560 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Commercial fleet chassis hardware wiring topology diagram"
      >
        {/* Reference Baseline & Grid Ticks */}
        <line x1="20" y1="196" x2="540" y2="196" stroke="#2B3138" strokeWidth="1" />
        <line x1="20" y1="192" x2="20" y2="200" stroke="#76808D" strokeWidth="1" />
        <line x1="540" y1="192" x2="540" y2="200" stroke="#76808D" strokeWidth="1" />
        <text x="245" y="214" fill="#76808D" fontSize="9" fontFamily="JetBrains Mono, monospace">
          WHEELBASE &amp; HARNESS SPAN
        </text>

        {/* Commercial Delivery / Fleet Van Orthographic Wireframe */}
        <path
          d="M52 162V72C52 65 57 60 64 60H365C375 60 384 64 391 71L442 104C450 109 456 117 458 126L464 162H52Z"
          stroke="#4B5563"
          strokeWidth="1.5"
          fill="#1A1E23"
          fillOpacity="0.65"
        />
        {/* Cargo Box Structural Ribs */}
        <line x1="150" y1="60" x2="150" y2="162" stroke="#2B3138" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="250" y1="60" x2="250" y2="162" stroke="#2B3138" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="350" y1="60" x2="350" y2="162" stroke="#2B3138" strokeWidth="1" />

        {/* Windshield */}
        <path
          d="M366 72H390L432 104H366V72Z"
          stroke="#64748B"
          strokeWidth="1.2"
          fill="#111417"
        />

        {/* Wheels */}
        <circle cx="132" cy="166" r="24" fill="#14171A" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="132" cy="166" r="10" stroke="#343C46" strokeWidth="1" />
        <circle cx="394" cy="166" r="24" fill="#14171A" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="394" cy="166" r="10" stroke="#343C46" strokeWidth="1" />

        {/* Internal CAN / Power Backbone Bus (Cyan Informational) */}
        <path
          d="M92 126H338L374 114H416"
          stroke="#22D3EE"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <line x1="338" y1="126" x2="338" y2="92" stroke="#22D3EE" strokeWidth="1.2" />
        <line x1="205" y1="126" x2="205" y2="148" stroke="#22D3EE" strokeWidth="1.2" />

        {/* Hardware Nodes */}
        {/* AST-104 Dashcam */}
        <rect x="376" y="76" width="14" height="10" fill="#171A1D" stroke="#22D3EE" strokeWidth="1.5" />
        <line x1="383" y1="76" x2="383" y2="40" stroke="#22D3EE" strokeWidth="1" />
        <text x="392" y="42" fill="#22D3EE" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
          AST-104 DASHCAM
        </text>

        {/* AST-537 Cabin Sensor */}
        <rect x="331" y="84" width="14" height="10" fill="#171A1D" stroke="#F2EFE9" strokeWidth="1.3" />
        <line x1="338" y1="84" x2="274" y2="40" stroke="#64748B" strokeWidth="1" />
        <text x="190" y="38" fill="#F2EFE9" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
          AST-537 CABIN SENSOR
        </text>

        {/* AST-208 Telematics Gateway */}
        <rect x="196" y="142" width="18" height="12" fill="#171A1D" stroke="#22D3EE" strokeWidth="1.5" />
        <text x="166" y="136" fill="#A7B0BC" fontSize="9" fontFamily="JetBrains Mono, monospace">
          AST-208 GATEWAY
        </text>

        {/* AST-316 Blind-Spot Radar */}
        <rect x="78" y="119" width="16" height="14" fill="#171A1D" stroke="#22D3EE" strokeWidth="1.5" />
        <path d="M72 117C64 123 64 129 72 135" stroke="#22D3EE" strokeWidth="1.2" />
        <path d="M64 112C54 121 54 131 64 140" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.6" />
        <text x="24" y="96" fill="#22D3EE" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
          AST-316 RADAR
        </text>

        {/* AST-422 Depot Charger Node */}
        <rect x="478" y="88" width="46" height="74" fill="#171A1D" stroke="#4B5563" strokeWidth="1.4" />
        <rect x="488" y="100" width="26" height="16" fill="#14171A" stroke="#22D3EE" strokeWidth="1" />
        <path d="M478 134H458" stroke="#22D3EE" strokeWidth="1.4" strokeDasharray="3 2" />
        <text x="466" y="78" fill="#A7B0BC" fontSize="9" fontFamily="JetBrains Mono, monospace">
          AST-422 EVSE
        </text>
      </svg>
    </div>

    <div className="grid grid-cols-3 gap-3 border-t border-[#262C34] pt-3 text-[11px] font-mono-tech">
      <div>
        <div className="text-[#76808D]">CATALOGUE</div>
        <div className="text-[#F2EFE9] mt-0.5">6 FLEET SKUS</div>
      </div>
      <div>
        <div className="text-[#76808D]">PRICING CURRENCY</div>
        <div className="text-[#F2EFE9] mt-0.5">CAD · 3 TIERS</div>
      </div>
      <div>
        <div className="text-[#76808D]">FITMENT RULE</div>
        <div className="text-[#22D3EE] mt-0.5">VEHICLE-SPECIFIC</div>
      </div>
    </div>
  </div>
);

export const ProductSchematic: React.FC<{ sku: string }> = ({ sku }) => {
  return (
    <div className="w-full h-36 bg-[#14171A] border-b border-[#262C34] blueprint-grid-fine flex items-center justify-center relative overflow-hidden">
      <span className="absolute top-2.5 left-3 text-[10px] font-mono-tech tracking-wider text-[#76808D]">
        SPEC // {sku}
      </span>
      <span className="absolute bottom-2 right-3 text-[10px] font-mono-tech tracking-wider text-[#4B5563]">
        CAD VIEW
      </span>

      {sku === 'AST-104' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <rect x="45" y="24" width="90" height="42" rx="2" stroke="#A7B0BC" strokeWidth="1.5" fill="#1A1E23" />
          <circle cx="72" cy="45" r="12" stroke="#22D3EE" strokeWidth="1.5" />
          <circle cx="72" cy="45" r="5" fill="#22D3EE" fillOpacity="0.35" stroke="#22D3EE" strokeWidth="1" />
          <circle cx="114" cy="45" r="9" stroke="#F2EFE9" strokeWidth="1.2" />
          <line x1="90" y1="14" x2="90" y2="24" stroke="#76808D" strokeWidth="1.5" />
          <rect x="78" y="10" width="24" height="5" stroke="#76808D" strokeWidth="1.2" />
        </svg>
      )}

      {sku === 'AST-208' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <rect x="42" y="26" width="96" height="38" rx="2" stroke="#A7B0BC" strokeWidth="1.5" fill="#1A1E23" />
          <rect x="52" y="34" width="30" height="22" stroke="#22D3EE" strokeWidth="1.2" />
          <line x1="94" y1="36" x2="126" y2="36" stroke="#64748B" strokeWidth="1.5" />
          <line x1="94" y1="45" x2="126" y2="45" stroke="#64748B" strokeWidth="1.5" />
          <line x1="94" y1="54" x2="114" y2="54" stroke="#22D3EE" strokeWidth="1.5" />
          <rect x="28" y="37" width="14" height="16" stroke="#76808D" strokeWidth="1.2" />
        </svg>
      )}

      {sku === 'AST-316' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <rect x="44" y="25" width="38" height="40" stroke="#A7B0BC" strokeWidth="1.5" fill="#1A1E23" />
          <path d="M94 31C106 38 106 52 94 59" stroke="#22D3EE" strokeWidth="1.5" />
          <path d="M107 24C123 36 123 54 107 66" stroke="#22D3EE" strokeWidth="1.3" strokeOpacity="0.7" />
          <path d="M120 18C140 34 140 56 120 72" stroke="#22D3EE" strokeWidth="1.1" strokeOpacity="0.4" />
          <circle cx="63" cy="45" r="6" stroke="#F2EFE9" strokeWidth="1.2" />
        </svg>
      )}

      {sku === 'AST-422' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <rect x="58" y="14" width="64" height="62" stroke="#A7B0BC" strokeWidth="1.5" fill="#1A1E23" />
          <rect x="68" y="24" width="44" height="20" stroke="#22D3EE" strokeWidth="1.3" />
          <path d="M93 29L87 35H92L88 40" stroke="#22D3EE" strokeWidth="1.3" />
          <rect x="74" y="54" width="14" height="12" stroke="#64748B" strokeWidth="1.2" />
          <rect x="94" y="54" width="12" height="12" stroke="#64748B" strokeWidth="1.2" />
        </svg>
      )}

      {sku === 'AST-537' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <rect x="48" y="30" width="84" height="30" rx="2" stroke="#A7B0BC" strokeWidth="1.5" fill="#1A1E23" />
          <circle cx="72" cy="45" r="7" stroke="#22D3EE" strokeWidth="1.4" />
          <circle cx="108" cy="45" r="7" stroke="#22D3EE" strokeWidth="1.4" />
          <circle cx="90" cy="45" r="3" fill="#F2EFE9" />
          <line x1="48" y1="45" x2="30" y2="45" stroke="#76808D" strokeWidth="1.4" />
        </svg>
      )}

      {sku === 'AST-640' && (
        <svg viewBox="0 0 180 90" className="w-40 h-24" fill="none" aria-hidden="true">
          <path d="M36 45H82L108 26H136" stroke="#22D3EE" strokeWidth="1.6" />
          <path d="M82 45L108 64H136" stroke="#A7B0BC" strokeWidth="1.6" />
          <rect x="24" y="38" width="14" height="14" stroke="#F2EFE9" strokeWidth="1.3" fill="#1A1E23" />
          <rect x="136" y="19" width="16" height="14" stroke="#22D3EE" strokeWidth="1.3" fill="#1A1E23" />
          <rect x="136" y="57" width="16" height="14" stroke="#A7B0BC" strokeWidth="1.3" fill="#1A1E23" />
        </svg>
      )}
    </div>
  );
};

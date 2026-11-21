import React from 'react';
import { clientConfig } from '../data/clientConfig';
import { BrandMark } from './BlueprintArtwork';

interface FooterProps {
  onOpenDrawer: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDrawer }) => {
  return (
    <footer className="bg-[#171A1D] border-t border-[#2B3138]">
      <div className="mx-auto max-w-[1320px] px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <BrandMark className="w-6 h-6" />
          <div>
            <div className="font-display text-sm font-bold uppercase tracking-wider text-[#F2EFE9]">
              {clientConfig.brand.name}
            </div>
            <div className="text-xs text-[#76808D] mt-0.5">
              {clientConfig.brand.copyright}
            </div>
          </div>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#A7B0BC]"
        >
          <a href="#hardware" className="hover:text-[#F2EFE9] transition-colors">
            Hardware
          </a>
          <a href="#fitment" className="hover:text-[#F2EFE9] transition-colors">
            Fitment
          </a>
          <a href="#spec-assist" className="hover:text-[#F2EFE9] transition-colors">
            Spec assist
          </a>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            Contact fleet team
          </button>
        </nav>
      </div>
    </footer>
  );
};

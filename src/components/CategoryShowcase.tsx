import React from 'react';
import { ChevronRight } from 'lucide-react';
import { clientConfig } from '../data/clientConfig';

interface CategoryShowcaseProps {
  onSelectCategory: (category: string) => void;
}

const ALL_HARDWARE_CARD = {
  category: 'All Hardware',
  subtitle: 'Complete CAD hardware roster',
  imageUrl: '/src/assets/images/hero_fleet_twilight_clean_1795290674040.jpg',
};

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const cards = [...clientConfig.categoryShowcase, ALL_HARDWARE_CARD];

  const handlePick = (category: string) => {
    onSelectCategory(category);
    const el = document.getElementById('hardware');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((item) => (
        <button
          key={item.category}
          type="button"
          onClick={() => handlePick(item.category)}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-xs border border-[#2C3440] bg-[#12161C] text-left hover:border-[#22D3EE]/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
        >
          <img
            src={item.imageUrl}
            alt={item.category}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E12] via-[#0B0E12]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-xs sm:text-sm font-bold text-[#F2EFE9] group-hover:text-[#22D3EE] transition-colors leading-tight">
                {item.category}
              </div>
              <div className="text-[11px] text-[#A7B0BC] mt-0.5 line-clamp-1">
                {item.subtitle}
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 text-[#A7B0BC] group-hover:text-[#22D3EE] shrink-0 transition-colors"
              aria-hidden="true"
            />
          </div>
        </button>
      ))}
    </div>
  );
};

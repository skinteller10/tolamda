import React from 'react';
import { Clock, X } from 'lucide-react';
import { CITIES, City } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterSectionProps {
  selectedCities: Set<City>;
  onCityToggle: (city: City) => void;
  openNowMode: boolean;
  onOpenNowToggle: () => void;
  onClearAll: () => void;
  currentTime: string;
  hasSearchQuery: boolean;
}

export default function FilterSection({
  selectedCities,
  onCityToggle,
  openNowMode,
  onOpenNowToggle,
  onClearAll,
  currentTime,
  hasSearchQuery
}: FilterSectionProps) {
  const isFiltered = selectedCities.size > 0 || hasSearchQuery;

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4 p-5 pb-0">
      <div className="rounded-2xl border border-rose/15 bg-white p-4.5 shadow-card">
        <span className="mb-3 block text-[13px] font-extrabold uppercase tracking-widest text-text-mid">
          Thành phố
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CITIES) as City[]).map((city) => (
            <button
              key={city}
              onClick={() => onCityToggle(city)}
              className={cn("chip", selectedCities.has(city) && "chip-active")}
            >
              {CITIES[city]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onOpenNowToggle}
        className={cn(
          "flex w-full items-center justify-center gap-2.5 rounded-xl p-4 text-[15px] font-extrabold shadow-lg transition-all active:scale-[0.98]",
          openNowMode
            ? "bg-gradient-to-br from-red to-red-dark text-white shadow-red/20"
            : "bg-gradient-to-br from-green to-green-dark text-white shadow-green/20"
        )}
      >
        <Clock size={20} strokeWidth={2.5} />
        <span>{openNowMode ? "Hủy tìm quán đang mở" : "Xem quán đang mở"}</span>
      </button>

      {openNowMode && (
        <div className="flex items-center gap-2.5 rounded-xl border border-green/20 bg-green/10 px-4.5 py-3 text-sm font-bold text-green-dark">
          <Clock size={18} strokeWidth={2.5} />
          <span>
            Đang mở lúc <strong className="ml-1">{currentTime}</strong>
          </span>
        </div>
      )}

      <button
        onClick={onClearAll}
        disabled={!isFiltered}
        className={cn(
          "w-full rounded-xl p-4 text-[14px] font-extrabold transition-all active:scale-[0.98]",
          isFiltered
            ? "bg-red text-white shadow-lg shadow-red/20"
            : "bg-red-pale text-red-dark/40 cursor-not-allowed"
        )}
      >
        Hủy bộ lọc + tìm kiếm
      </button>
    </div>
  );
}

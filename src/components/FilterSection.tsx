import React, { useState } from 'react';
import { Clock, Filter, Minus, Plus } from 'lucide-react';
import { Rating } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterSectionProps {
  selectedCities: Set<string>;
  onCityToggle: (city: string) => void;
  selectedRatings: Set<number>;
  onRatingToggle: (ratingIndex: number) => void;
  selectedTypes: Set<string>;
  onTypeToggle: (type: string) => void;
  selectedForms: Set<string>;
  onFormToggle: (form: string) => void;
  openNowMode: boolean;
  onOpenNowToggle: () => void;
  onClearAll: () => void;
  currentTime: string;
  hasSearchQuery: boolean;
  citiesList: { id: string; label: string }[];
  typesList: { id: string; label: string }[];
  formsList: { id: string; label: string }[];
  ratingsList: Rating[];
  mode?: 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da';
}

export default function FilterSection({
  selectedCities, onCityToggle,
  selectedRatings, onRatingToggle,
  selectedTypes, onTypeToggle,
  selectedForms, onFormToggle,
  openNowMode, onOpenNowToggle,
  onClearAll, currentTime, hasSearchQuery,
  citiesList, typesList, formsList, ratingsList,
  mode = 'to-an'
}: FilterSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isFilteredActual = selectedCities.size > 0 || selectedRatings.size > 0 || selectedTypes.size > 0 || selectedForms.size > 0;
  const isClearButtonVisible = isFilteredActual || hasSearchQuery;

  const isAn = mode === 'to-an';
  const isChup = mode === 'to-chup';
  const isDuLich = mode === 'to-du-lich';
  const isSkinCare = mode === 'to-lam-da';
  const hasSchedule = isAn || isSkinCare; 

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4 p-5 pb-0">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className={cn(
          "flex w-full items-center justify-center gap-2.5 rounded-2xl p-4 shadow-md transition-all active:scale-[0.98] text-[15px] font-black uppercase tracking-wider",
          "bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E4] text-rose-dark border border-rose/10 shadow-rose/5 hover:from-[#FFE4E4] hover:to-[#FED7D7]"
        )}
      >
        <Filter size={18} strokeWidth={2.5} className="text-rose" />
        <span className="font-sans">
          {isAn ? 'Lọc quán' : 'Bộ lọc'} {isFilteredActual && <span className="ml-1 text-rose font-sans text-xs">({selectedCities.size + selectedRatings.size + selectedTypes.size + selectedForms.size})</span>}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {(isAn || isDuLich || isSkinCare) && (
            <div className="rounded-2xl border border-rose/10 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-3">
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                Thành phố
              </span>
              <div className="flex flex-wrap gap-2">
                {citiesList.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => onCityToggle(city.id)}
                    className={cn("chip-feminine", selectedCities.has(city.id) && "chip-feminine-active")}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isAn || isSkinCare) && (
            <div className="rounded-2xl border border-rose/10 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-3">
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                Đánh giá
              </span>
              <div className="flex flex-wrap gap-2">
                {ratingsList.map((rating, index) => (
                  <button
                    key={index}
                    onClick={() => onRatingToggle(index)}
                    className={cn("chip-feminine", selectedRatings.has(index) && "chip-feminine-active")}
                  >
                    {rating.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", (isChup || isDuLich) && "hidden md:hidden")}>
            {(isAn || isSkinCare) && (
              <>
                <div className="rounded-2xl border border-rose/10 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-3">
                  <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                    {isSkinCare ? 'Phương pháp' : 'Loại hình'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {typesList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onTypeToggle(t.id)}
                        className={cn("chip-feminine", selectedTypes.has(t.id) && "chip-feminine-active")}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose/10 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-3">
                  <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                    {isSkinCare ? 'Vấn đề da' : 'Hình thức'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formsList.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onFormToggle(f.id)}
                        className={cn("chip-feminine", selectedForms.has(f.id) && "chip-feminine-active")}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {isChup && (
            <div className="rounded-2xl border border-rose/10 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-3">
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                Loại máy
              </span>
              <div className="flex flex-wrap gap-2">
                {typesList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTypeToggle(t.id)}
                    className={cn("chip-feminine", selectedTypes.has(t.id) && "chip-feminine-active")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasSchedule && (
        <button
          onClick={onOpenNowToggle}
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-2xl p-4 text-[14px] font-extrabold shadow-lg transition-all active:scale-[0.98]",
            openNowMode
              ? "bg-gradient-to-br from-rose to-rose-dark text-white shadow-rose/20"
              : "bg-gradient-to-br from-green to-green-dark text-white shadow-green/20"
          )}
        >
          <Clock size={18} strokeWidth={2.5} />
          <span>{openNowMode ? (isAn ? "Hủy tìm quán đang mở" : "Hủy tìm địa điểm mở cửa") : (isAn ? "Xem quán đang mở" : "Xem địa điểm đang mở")}</span>
        </button>
      )}

      {hasSchedule && openNowMode && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose/10 bg-rose/5 px-4 py-3 text-sm font-bold text-rose-dark animate-in fade-in zoom-in-95 duration-300">
          <Clock size={16} strokeWidth={2.5} className="text-rose" />
          <span>
            Đang mở lúc <strong className="ml-1 font-serif italic text-base">{currentTime}</strong>
          </span>
        </div>
      )}

      {(isClearButtonVisible) && (
        <button
          onClick={onClearAll}
          className="w-full rounded-2xl p-4 text-[14px] font-black uppercase tracking-widest bg-rose/10 text-rose hover:bg-rose hover:text-white transition-all active:scale-[0.98] mt-1 shadow-sm"
        >
          Hủy bộ lọc + tìm kiếm
        </button>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, ImageIcon, Home, Minus, Plus } from 'lucide-react';
import { Restaurant, Rating } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ImageViewer from './ImageViewer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  ratingObj: Rating;
  index: number;
  isOpen: boolean;
  currentTime?: string;
  actions?: React.ReactNode;
  isSkinCare?: boolean;
  typesList?: { id: string, label: string }[];
  formsList?: { id: string, label: string }[];
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  ratingObj, 
  index, 
  isOpen, 
  currentTime, 
  actions, 
  isSkinCare,
  typesList = [],
  formsList = []
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);

  const allImages = Array.from(new Set([restaurant.img, ...(restaurant.images || [])].filter(Boolean))) as string[];

  React.useEffect(() => {
    setImageError(false);
  }, [restaurant.img]);

  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const checkStatus = (time: string | undefined, op?: string, cl?: string, op2?: string, cl2?: string) => {
    if (!time) return true;
    const now = parseTime(time);
    
    const checkOne = (oStr?: string, cStr?: string) => {
      if (!oStr || !cStr) return false;
      const o = parseTime(oStr);
      const c = parseTime(cStr);
      return o < c ? now >= o && now <= c : now >= o || now <= c;
    };

    return checkOne(op, cl) || checkOne(op2, cl2);
  };

  const branches = [{
    address: restaurant.address,
    open: restaurant.open,
    close: restaurant.close,
    open2: restaurant.open2,
    close2: restaurant.close2,
    isOpen: checkStatus(currentTime, restaurant.open, restaurant.close, restaurant.open2, restaurant.close2)
  }];

  if (restaurant.branch2Address) {
    branches.push({
      address: restaurant.branch2Address,
      open: restaurant.branch2Open || '08:00',
      close: restaurant.branch2Close || '22:00',
      open2: restaurant.branch2Open2,
      close2: restaurant.branch2Close2,
      isOpen: checkStatus(
        currentTime,
        restaurant.branch2Open || '08:00', 
        restaurant.branch2Close || '22:00',
        restaurant.branch2Open2,
        restaurant.branch2Close2
      )
    });
  }

  const formatHours = (b: any) => {
    let h = `(${b.open} - ${b.close}`;
    if (b.open2 && b.close2) h += `, ${b.open2} - ${b.close2}`;
    return h + ')';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="flex w-full gap-4 rounded-[28px] border border-rose/10 bg-white p-4 shadow-card hover:shadow-float transition-all"
    >
      <div className="flex w-12 flex-shrink-0 items-center justify-center text-center text-3xl font-black text-rose/15 font-sans border-r border-rose/5 my-1 italic select-none">
        {index + 1}
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
          <div className={cn("flex gap-4", isSkinCare ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
          
          {/* Images Section Parent - Wrap Image + Tags for Skincare */}
          {/* isSkinCare (Tớ làm da) or Tớ chụp (to-chup) use 5 images layout */}
          {(() => {
            const isGallery = isSkinCare || restaurant.category === 'to-chup';
            // Skin Care specifically wants side-by-side squares (max 2 images)
            const isSkinCareLayout = isSkinCare;
            const imagesCount = allImages.length;
            
            return (
              <div className={cn("flex flex-shrink-0 flex-col gap-2 transition-all duration-500", isSkinCareLayout ? "w-full sm:w-[32%]" : isGallery ? "w-full sm:w-[32%]" : "w-full sm:w-40")}>
                {/* Images Container */}
                <div className={cn(
                  "flex overflow-hidden bg-rose/5 w-full", 
                  isSkinCareLayout ? (imagesCount > 1 ? "aspect-[2/1] rounded-[24px] gap-1" : "aspect-square rounded-[24px]") :
                  isGallery ? "aspect-[2/1] rounded-[24px] gap-1" : 
                  "h-36 sm:h-28 rounded-[20px] gap-1"
                )}>
                  {/* Main Image */}
                  <div 
                    className={cn("h-full relative overflow-hidden cursor-pointer", isSkinCareLayout ? (imagesCount > 1 ? "w-1/2" : "w-full") : allImages.length > 1 ? "w-[60%]" : "w-full")}
                    onClick={(e) => { e.stopPropagation(); if (allImages.length > 0) setSelectedImageIndex(0); }}
                  >
                    {allImages.length > 0 && !imageError ? (
                      <img 
                        src={allImages[0]} 
                        alt={restaurant.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-rose-mid">
                        <ImageIcon size={28} className="opacity-30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Small images (Grid for Gallery, Column for others, 1/2 for Skincare) */}
                  {imagesCount > 1 && (
                    <div className={cn(
                      "h-full gap-1", 
                      isSkinCareLayout ? "w-1/2" : "w-[40%]",
                      isGallery && !isSkinCareLayout ? "grid grid-cols-2 grid-rows-2" : "flex flex-col"
                    )}>
                      {(isSkinCareLayout ? [allImages[1]] : isGallery ? allImages.slice(1, 5) : allImages.slice(1, 4)).map((img, idx) => {
                        const maxSideImages = isSkinCareLayout ? 1 : isGallery ? 4 : 3;
                        const isLast = idx === maxSideImages - 1;
                        const totalLeft = allImages.length - (maxSideImages + 1);
                        
                        return (
                          <div 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx + 1); }}
                            className="flex-1 relative overflow-hidden cursor-pointer bg-white/10"
                          >
                            <img 
                              src={img} 
                              alt={`${restaurant.name} ${idx + 2}`}
                              className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            {isLast && totalLeft > 0 && !isSkinCareLayout && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs backdrop-blur-[1px]">
                                +{totalLeft}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Empty slots for grid if needed */}
                      {isGallery && !isSkinCareLayout && allImages.length > 1 && allImages.length < 5 && Array.from({ length: 5 - allImages.length }).map((_, i) => (
                        <div key={i} className="flex-1 bg-white/5" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags Section for Skincare (Under Image) */}
                {isSkinCare && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {restaurant.type && (
                      <span className="rounded-lg bg-rose/5 px-2.5 py-1 text-[11px] font-bold text-rose-dark border border-rose/10 whitespace-nowrap">
                        {typesList.find(t => t.id.toLowerCase().trim() === restaurant.type?.toLowerCase().trim())?.label || restaurant.type}
                      </span>
                    )}
                    {restaurant.form && (
                      <span className="rounded-lg bg-indigo/5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 border border-indigo/10 whitespace-nowrap">
                        {formsList.find(f => f.id.toLowerCase().trim() === restaurant.form?.toLowerCase().trim())?.label || restaurant.form}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Info Section */}
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">

            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 break-words text-[17px] font-bold leading-tight text-text tracking-tight font-sans">
                {restaurant.name}
              </h3>
              {!isSkinCare && (
                <span className={cn("badge shrink-0 shadow-sm border-rose/10 py-0.5 text-[10px]", ratingObj.bc)}>
                  {ratingObj.label}
                </span>
              )}
            </div>


            {!isSkinCare && (
              <div className="flex flex-col gap-1.5 mt-0.5">
                {branches.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[12px] font-bold">
                    <MapPin size={13} className={cn("mt-[3px] shrink-0", b.isOpen ? "text-rose" : "text-text-light opacity-50")} />
                    <span className="leading-snug break-words">
                      <span className={cn(b.isOpen ? "text-rose-dark" : "text-text-light")}>{b.address || 'Chưa có địa chỉ...'}</span> 
                      <span className={cn("ml-1.5", b.isOpen ? "text-green-dark" : "text-red")}>{b.isOpen ? 'Đang mở' : 'Đã đóng'}</span>
                      <span className="text-text-light font-medium text-[11px] ml-1.5 block sm:inline mt-0.5 sm:mt-0 opacity-80">{formatHours(b)}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isSkinCare && restaurant.info && (
              <div className="mt-2 relative group">
                <div className="pr-10 min-w-0">
                  <p className={cn(
                    "text-[13px] text-text-mid leading-relaxed font-medium transition-all duration-300 whitespace-pre-wrap",
                    !isArticleExpanded && "line-clamp-3"
                  )}>
                    {restaurant.info}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsArticleExpanded(!isArticleExpanded); }}
                  className="absolute top-0 right-0 w-8 h-8 rounded-full bg-rose/5 text-rose flex items-center justify-center hover:bg-rose hover:text-white transition-all shadow-sm"
                >
                  {isArticleExpanded ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                </button>
              </div>
            )}

            {!isSkinCare && restaurant.info && (
              <p className="line-clamp-2 break-words text-[13px] text-text-mid/80 leading-relaxed font-medium mt-1">
                {restaurant.info}
              </p>
            )}
          </div>

        </div>
      </div>

      {actions && (
        <div className="flex flex-shrink-0 flex-col gap-3 border-l border-rose/5 pl-4 justify-center">
          {actions}
        </div>
      )}
      
      {/* Full screen image viewer overlay */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <ImageViewer 
            images={allImages} 
            initialIndex={selectedImageIndex} 
            onClose={() => setSelectedImageIndex(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>

  );
};

export default RestaurantCard;

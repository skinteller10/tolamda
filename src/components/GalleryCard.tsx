import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ImageIcon } from 'lucide-react';
import { Restaurant, Rating } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ImageViewer from './ImageViewer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GalleryCardProps {
  restaurant: Restaurant;
  index: number;
  mode?: 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da';
}

const IMAGES_PER_PAGE = 5;

const GalleryCard: React.FC<GalleryCardProps> = ({ restaurant, index, mode }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imagePage, setImagePage] = useState(1);
  
  const allImages = [restaurant.img, ...(restaurant.images || [])].filter(Boolean) as string[];
  const imageTypes = restaurant.imageTypes || [];

  const totalImagePages = Math.ceil(allImages.length / IMAGES_PER_PAGE);
  const currentImages = allImages.slice((imagePage - 1) * IMAGES_PER_PAGE, imagePage * IMAGES_PER_PAGE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-4 overflow-hidden py-1 px-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[20px] font-black uppercase tracking-tight text-text leading-none">
            <span className="text-rose mr-2">{index + 1}.</span>
            {restaurant.name}
            {mode === 'to-du-lich' && restaurant.city && (
              <span className="ml-2 text-rose/30 text-[14px] font-bold lowercase italic">
                {restaurant.city}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Grid Images */}
      <div className="grid grid-cols-5 gap-2">
        {allImages.length === 0 && (
          <div className="col-span-5 flex h-40 w-full items-center justify-center rounded-[24px] bg-rose/5 text-rose-mid/30">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
        )}
        {currentImages.map((img, idx) => {
          const globalIdx = (imagePage - 1) * IMAGES_PER_PAGE + idx;
          const type = imageTypes[globalIdx] || 'máy film';
          const isFilm = type === 'máy film';

          return (
            <div 
              key={idx}
              onClick={() => setSelectedImageIndex(globalIdx)}
              className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl bg-rose/5 border border-rose/5"
            >
              <img 
                src={img} 
                alt={`${restaurant.name} ${globalIdx + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {isFilm && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                    Máy film
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Pagination */}
      {totalImagePages > 1 && (
        <div className="flex justify-center gap-1.5 mt-1">
          {Array.from({ length: totalImagePages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setImagePage(i + 1)}
              className={cn(
                "w-6 h-6 rounded-full text-[10px] font-black transition-all",
                imagePage === i + 1 
                  ? "bg-rose text-white shadow-sm" 
                  : "bg-rose/10 text-rose hover:bg-rose/20"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Spacer for rhythm */}
      <div className="h-2" />

      {/* Image Viewer */}
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

export default GalleryCard;

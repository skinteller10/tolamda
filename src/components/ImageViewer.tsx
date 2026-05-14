import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync state if prop changes (although usually unmounted)
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, nextImage, prevImage]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain sm:rounded-2xl shadow-2xl"
            alt={`Image ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()} // Click on image does nothing
          />
        </AnimatePresence>
      </div>

      <button 
        className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[10000] flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-rose hover:text-white transition-colors focus:outline-none"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X size={24} strokeWidth={3} />
      </button>

      {images.length > 1 && (
        <>
          <button 
            className="absolute left-2 sm:left-8 z-[10000] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-rose hover:text-white transition-colors focus:outline-none"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft size={32} strokeWidth={3} className="-ml-1" />
          </button>
          
          <button 
            className="absolute right-2 sm:right-8 z-[10000] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-rose hover:text-white transition-colors focus:outline-none"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight size={32} strokeWidth={3} className="-mr-1" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-none">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </motion.div>,
    document.body
  );
};

export default ImageViewer;

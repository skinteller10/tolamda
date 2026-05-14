import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  initialQuery: string;
}

export default function SearchOverlay({ isOpen, onClose, onSearch, initialQuery }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(inputRef.current?.value || '');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex justify-center bg-rose-dark/10 pt-16 backdrop-blur-xl px-4"
        >
          <motion.div
            initial={{ y: -20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -20, scale: 0.95 }}
            className="flex h-fit w-full max-w-[420px] items-center gap-3 rounded-[32px] bg-white p-4 shadow-float border border-rose/10"
          >
            <input
              ref={inputRef}
              defaultValue={initialQuery}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-[22px] border-none bg-rose/5 px-6 py-4 text-base font-bold text-text-dark outline-none focus:ring-4 focus:ring-rose/5 transition-all placeholder:text-text-light/50"
              placeholder="Tìm kiếm quán ăn..."
              autoComplete="off"
            />
            <button 
              onClick={onClose} 
              className="h-12 w-12 flex items-center justify-center rounded-full bg-text-light/10 text-text-mid hover:bg-rose/10 hover:text-rose transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

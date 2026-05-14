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
          className="fixed inset-0 z-[1100] flex justify-center bg-text/50 pt-10 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: -50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -50, scale: 0.9 }}
            className="flex h-fit w-[92%] max-w-[420px] items-center gap-3 rounded-[24px] bg-white p-5 shadow-2xl"
          >
            <input
              ref={inputRef}
              defaultValue={initialQuery}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-2xl border-[1.5px] border-rose/20 bg-bg px-4.5 py-3 text-base text-text outline-none focus:border-rose"
              placeholder="Tìm kiếm quán ăn..."
              autoComplete="off"
            />
            <button onClick={onClose} className="p-1 text-2xl text-text-mid">
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

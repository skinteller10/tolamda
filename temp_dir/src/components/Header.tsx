import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onSearchClick: () => void;
  onAdminClick: () => void;
  showAdminButton: boolean;
  title: string;
}

export default function Header({ onSearchClick, onAdminClick, showAdminButton, title }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-rose/15 bg-bg/92 backdrop-blur-xl">
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between p-4">
        <div className="flex flex-1"></div>
        <h1 className="text-center font-serif text-2xl font-bold italic tracking-tight text-rose-dark">
          {title}
        </h1>
        <div className="flex flex-1 items-center justify-end gap-2.5">
          {showAdminButton && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAdminClick}
              className="flex h-9 items-center justify-center rounded-xl bg-rose-dark px-4 text-[13px] font-extrabold tracking-wide text-white"
            >
              Quản lý
            </motion.button>
          )}
          <button onClick={onSearchClick} className="btn-icon">
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>
      </header>
    </div>
  );
}

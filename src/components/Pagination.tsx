import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-10">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => {
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-current={currentPage === page ? 'page' : undefined}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-[18px] border transition-all active:scale-90 shadow-sm",
            currentPage === page
              ? "border-rose bg-gradient-to-br from-rose to-rose-dark text-white font-black shadow-lg shadow-rose/25 scale-110"
              : "border-rose/10 bg-white text-text-light font-bold hover:border-rose/30 hover:text-rose-mid"
          )}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

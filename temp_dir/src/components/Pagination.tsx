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
    <div className="flex items-center justify-center gap-2.5 py-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => {
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-current={currentPage === page ? 'page' : undefined}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border border-rose/15 bg-white text-[15px] font-extrabold transition-all active:scale-95",
            currentPage === page
              ? "border-rose bg-rose text-white shadow-lg shadow-rose/20"
              : "text-text-light"
          )}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

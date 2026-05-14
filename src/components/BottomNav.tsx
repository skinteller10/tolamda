import React from 'react';
import { Home, User, UserPlus, LogOut, Coffee, Camera, Map, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  view: 'home' | 'login' | 'admin' | 'ratings' | 'filters' | 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da';
  onNavClick: (view: any) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function BottomNav({ view, onNavClick, isLoggedIn, onLogout }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] border-t border-rose/15 bg-bg/94 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[720px] items-center justify-around px-0 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
        <button
          onClick={() => onNavClick('to-lam-da')}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-3 py-3 transition-all active:scale-95",
            view === 'to-lam-da' ? "text-rose" : "text-text-light"
          )}
        >
          <Sparkles size={24} strokeWidth={2.2} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Tớ làm da</span>
        </button>

        <button
          onClick={() => onNavClick('to-chup')}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-3 py-3 transition-all active:scale-95",
            view === 'to-chup' ? "text-rose" : "text-text-light"
          )}
        >
          <Camera size={24} strokeWidth={2.2} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Tớ chụp</span>
        </button>

        <button
          onClick={() => onNavClick('to-an')}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-3 py-3 transition-all active:scale-95",
            view === 'to-an' ? "text-rose" : "text-text-light"
          )}
        >
          <Coffee size={24} strokeWidth={2.2} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Tớ ăn</span>
        </button>

        <button
          onClick={() => onNavClick('to-du-lich')}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-3 py-3 transition-all active:scale-95",
            view === 'to-du-lich' ? "text-rose" : "text-text-light"
          )}
        >
          <Map size={24} strokeWidth={2.2} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Tớ du lịch</span>
        </button>

        <div className="flex flex-col items-center justify-center px-4 py-2 opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2D3748] text-center leading-[1.6] drop-shadow-sm">
            Web này<br/>
            <span className="text-rose-mid inline-block mt-1">TỚ TỰ CODE</span>
          </span>
        </div>
      </nav>
    </div>

  );
}

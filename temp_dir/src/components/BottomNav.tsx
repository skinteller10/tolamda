import React from 'react';
import { Home, User, UserPlus, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeView: 'home' | 'login' | 'admin' | 'ratings';
  onNavClick: (view: 'home' | 'login' | 'admin' | 'ratings') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function BottomNav({ activeView, onNavClick, isLoggedIn, onLogout }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] border-t border-rose/15 bg-bg/94 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[720px] items-center justify-around px-0 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
        <button
          onClick={() => onNavClick('home')}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-6 py-3 transition-all active:scale-95",
            activeView === 'home' ? "text-rose" : "text-text-light"
          )}
        >
          <Home size={26} strokeWidth={2.2} />
          <span className="text-[11px] font-extrabold uppercase tracking-tight">Trang chủ</span>
        </button>

        <button
          onClick={() => {
            if (isLoggedIn) {
              onLogout();
            } else {
              onNavClick('login');
            }
          }}
          className={cn(
            "flex flex-col items-center gap-1 bg-transparent px-6 py-3 transition-all active:scale-95",
            (activeView === 'login' || activeView === 'admin' || activeView === 'ratings') ? "text-rose" : "text-text-light"
          )}
        >
          {isLoggedIn ? (
            <>
              <LogOut size={26} strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold uppercase tracking-tight">Đăng xuất</span>
            </>
          ) : (
            <>
              <UserPlus size={26} strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold uppercase tracking-tight">Đăng nhập</span>
            </>
          )}
        </button>
      </nav>
    </div>
  );
}

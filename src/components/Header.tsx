import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onSearchClick: () => void;
  onAdminClick: () => void;
  showAdminButton: boolean;
  title: string;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function Header({ onSearchClick, onAdminClick, showAdminButton, title, isLoggedIn, onLoginClick, onLogoutClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-rose/15 bg-bg/92 backdrop-blur-xl">
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between p-4">
        <h1 className="text-left font-serif text-2xl font-bold italic tracking-tight text-rose-dark w-1/3">
          {title}
        </h1>
        <div className="flex w-1/3 justify-center items-center gap-5">
          <a href="https://www.instagram.com/tolamdavn" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform p-1.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-lg shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" className="hover:scale-110 transition-transform p-1.5 bg-[#1877F2] text-white rounded-lg shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="hover:scale-110 transition-transform p-1.5 bg-[#FF0000] text-white rounded-lg shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </a>
          <a href="#" className="hover:scale-110 transition-transform p-1.5 bg-black text-white rounded-lg shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>
        <div className="flex w-1/3 items-center justify-end gap-2">
          {showAdminButton && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAdminClick}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-3 text-[12px] font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/20 border border-orange-400/20"
            >
              Quản lý
            </motion.button>
          )}

          <button onClick={onSearchClick} className="btn-icon p-1.5 bg-white border border-rose/10 shadow-sm rounded-xl">
            <Search size={20} strokeWidth={2.5} className="text-rose" />
          </button>

          {isLoggedIn ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLogoutClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-rose/10 text-rose-dark shadow-sm"
              title="Đăng xuất"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-rose/10 text-rose-dark shadow-sm"
              title="Đăng nhập"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            </motion.button>
          )}
        </div>
      </header>
    </div>
  );
}

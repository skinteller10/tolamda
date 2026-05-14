import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock } from 'lucide-react';
import { Restaurant, Rating } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  ratingObj: Rating;
  index: number;
  isOpen: boolean;
  actions?: React.ReactNode;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, ratingObj, index, isOpen, actions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-rose/15 bg-white p-3.5 shadow-card"
    >
      <div className="w-8 flex-shrink-0 text-center text-lg font-extrabold text-text-light/40">
        {index + 1}
      </div>
      
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-bg">
        <img 
          src={restaurant.img} 
          alt={restaurant.name}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300';
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 break-words text-[17px] font-extrabold leading-tight text-text">
            {restaurant.name}
          </h3>
          <span className={cn("badge", ratingObj.bc)}>
            {ratingObj.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] font-bold">
          <div className={cn("h-2 w-2 shrink-0 rounded-full", isOpen ? "bg-green" : "bg-text-light opacity-50")} />
          <span className={cn("truncate", isOpen ? "text-green-dark" : "text-text-light")}>
            {isOpen ? 'Đang mở' : 'Đã đóng'} · {restaurant.open} - {restaurant.close}
          </span>
        </div>

        <div className="flex items-start gap-1 text-[13px] font-bold text-rose-dark">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-1 break-words">{restaurant.address || 'Chưa có địa chỉ...'}</span>
        </div>

        {restaurant.info && (
          <p className="line-clamp-1 break-words text-[13px] text-text-mid">
            {restaurant.info}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-shrink-0 flex-col gap-2 border-l border-rose/10 pl-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default RestaurantCard;

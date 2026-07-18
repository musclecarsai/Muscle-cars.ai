import React from 'react';
import { Calendar, Gauge, ShieldCheck, ShoppingCart } from 'lucide-react';

interface CarCardProps {
  id: string;
  title: string;
  price: string;
  mileage: string;
  year: string;
  image: string;
  status?: 'available' | 'sold';
  ownerId?: string;
  onAnalyze?: () => void;
  onBuy?: () => void;
  feeDisplay?: string;
  buyerFeePercent?: number;
}

export const CarCard = ({ id, title, price, mileage, year, image, status = 'available', ownerId, onAnalyze, onBuy, feeDisplay, buyerFeePercent }: CarCardProps) => {
  const isSold = status === 'sold';
  return (
    <div className="bg-dark-steel rounded-xl overflow-hidden border-t-2 border-racing-red card-hover group cursor-pointer relative">
      {/* Status Badge */}
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg ${
        status === 'available' 
          ? 'bg-emerald text-white' 
          : 'bg-gradient-to-r from-racing-red to-charcoal text-white'
      }`}>
        {status}
      </div>

      <div className="relative h-56 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent opacity-60" />
      </div>

      <div className="p-5 text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold leading-tight line-clamp-1">{title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-titanium text-xs font-mono">
            <Calendar size={14} className="text-racing-red" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-2 text-titanium text-xs font-mono">
            <Gauge size={14} className="text-racing-red" />
            <span>{mileage}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 text-emerald font-bold text-[10px] uppercase tracking-tighter bg-emerald/10 px-2 py-1 rounded border border-emerald/20">
            <ShieldCheck size={12} />
            <span>Verified</span>
          </div>
          <div className="text-gold font-mono font-black text-xl tracking-tighter">
            {price}
          </div>
        </div>

        {/* Fee display — incentivizes subscriptions */}
        {feeDisplay && !isSold && (
          <div className="mb-4 p-2.5 rounded-lg bg-charcoal/60 border border-white/5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-titanium">Buyer Fee</span>
              <span className={buyerFeePercent && buyerFeePercent > 0 ? 'text-racing-red' : 'text-emerald'}>
                {buyerFeePercent && buyerFeePercent > 0 ? `${(buyerFeePercent * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            {buyerFeePercent && buyerFeePercent > 0 && (
              <p className="text-[9px] text-titanium/60 mt-1 italic">
                Upgrade to Enthusiast ($29/mo) to reduce fee to 1%
              </p>
            )}
            {buyerFeePercent === 0 && (
              <p className="text-[9px] text-emerald/60 mt-1 italic">
                Elite tier — no transaction fee
              </p>
            )}
          </div>
        )}

        {!isSold && onBuy ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
            className="w-full bg-emerald hover:bg-emerald/80 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} />
            Buy Now
          </button>
        ) : <div className="h-12" />}
      </div>
    </div>
  );
};

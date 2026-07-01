import React from 'react';
import { Car, Menu, User } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-charcoal text-white py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-charcoal/90">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter group cursor-pointer">
          <Car className="text-racing-red group-hover:scale-110 transition-transform" size={28} />
          <span>MUSCLECARS<span className="text-racing-red">.AI</span></span>
        </div>
        
        <div className="hidden md:flex gap-10 font-bold uppercase text-[10px] tracking-[0.2em] text-titanium">
          <a href="/#marketplace" className="hover:text-white transition-colors relative group">
            Marketplace
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
          </a>
          <a href="/premium-library" className="hover:text-white transition-colors relative group">
            Library
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold transition-all group-hover:w-full" />
          </a>
          <a href="#" className="hover:text-white transition-colors relative group">
            Valuation
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
          </a>
          <a href="#" className="hover:text-white transition-colors relative group">
            Portfolio
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
          </a>
          <a href="/#pricing" className="hover:text-white transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:block bg-racing-red px-6 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-racing-red-light transition-all shadow-lg shadow-racing-red/20">
            Sell Vehicle
          </button>
          <div className="w-10 h-10 rounded-full bg-dark-steel border border-white/10 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors group">
            <User size={18} className="text-titanium group-hover:text-gold transition-colors" />
          </div>
          <Menu className="md:hidden cursor-pointer text-titanium" />
        </div>
      </div>
    </nav>
  );
};

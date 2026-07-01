import React from 'react';
import { Lock, Rocket, X } from 'lucide-react';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  feature: string;
}

export const Paywall = ({ isOpen, onClose, title, description, feature }: PaywallProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-dark-steel rounded-[2.5rem] border-2 border-gold/30 shadow-[0_0_50px_rgba(201,168,76,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-racing-red/10 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-titanium hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-12 text-center relative z-10">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
            <Lock className="text-gold" size={40} />
          </div>

          <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
            Limit <span className="text-gold">Reached</span>
          </h2>
          
          <div className="inline-flex items-center gap-2 bg-racing-red/10 text-racing-red px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-racing-red/20">
            {feature} LOCKED
          </div>

          <p className="text-titanium text-lg mb-10 leading-relaxed">
            {description}
          </p>

          <div className="space-y-4">
            <button 
              className="w-full gold-shimmer text-charcoal py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)] flex items-center justify-center gap-3"
              onClick={() => {
                onClose();
                const pricing = document.getElementById('pricing');
                if (pricing) pricing.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Rocket size={18} />
              Upgrade to Enthusiast
            </button>
            <p className="text-titanium/50 text-[10px] font-bold uppercase tracking-widest">
              From $29/mo • Cancel Anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

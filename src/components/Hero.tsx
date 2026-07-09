import React from 'react';

export const Hero = () => {
  return (
    <div className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background with dramatic lighting overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80")',
          filter: 'brightness(0.35) contrast(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal z-0" />
      
      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/20 px-5 py-1.5 rounded-full text-[10px] font-black mb-8 tracking-[0.2em] uppercase backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
          Trusted by Collectors Nationwide
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.85] uppercase italic">
          The Home for <br />
          <span className="text-gold drop-shadow-[0_0_30px_rgba(201,168,76,0.3)]">Muscle Car</span> Collectors
        </h1>
        
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium text-titanium leading-relaxed">
          Buy, sell, and connect with verified enthusiasts. 
          <span className="text-white block mt-2">Professional valuations, expert inspections, and a community that shares your passion.</span>
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <a href="#marketplace" className="w-full md:w-auto bg-gold text-charcoal px-12 py-5 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-gold-light transition-all hover:scale-105 shadow-[0_20px_50px_rgba(201,168,76,0.25)] border-t border-white/20 text-center">
            Browse Inventory
          </a>
          <button 
            onClick={() => {
              const pricing = document.getElementById('pricing');
              if (pricing) pricing.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full md:w-auto bg-dark-steel text-white border border-white/10 px-12 py-5 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-carbon hover:border-gold/50 transition-all hover:scale-105 shadow-2xl"
          >
            See Plans & Pricing
          </button>
        </div>
        
        <div className="mt-16 flex items-center justify-center gap-12 opacity-40">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">MOPAR</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-gold">FORD</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">CHEVY</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">PONTIAC</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </div>
  );
};

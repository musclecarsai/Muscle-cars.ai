import React from 'react';

export const Hero = () => {
  return (
    <div className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background with dramatic lighting overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80")',
          filter: 'brightness(0.3) contrast(1.2)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-transparent to-charcoal z-0" />
      
      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-racing-red/10 text-racing-red border border-racing-red/20 px-5 py-1.5 rounded-full text-[10px] font-black mb-8 tracking-[0.2em] uppercase backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-racing-red rounded-full animate-pulse" />
          Live Trading Floor • AI Valuations
        </div>
        
        <h1 className="text-7xl md:text-[9rem] font-black mb-8 tracking-tighter leading-[0.8] uppercase italic">
          Monetize Your <br />
          <span className="text-racing-red drop-shadow-[0_0_30px_rgba(212,32,32,0.3)]">Horsepower.</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium text-titanium leading-relaxed">
          The definitive digital marketplace for high-performance muscle cars. 
          <span className="text-white block mt-2">Protect your investment with professional-grade analytics.</span>
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <a href="#marketplace" className="w-full md:w-auto bg-racing-red text-white px-12 py-5 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-racing-red-light transition-all hover:scale-105 shadow-[0_20px_50px_rgba(212,32,32,0.25)] border-t border-white/20 text-center">
            Browse Inventory
          </a>
          <button 
            onClick={() => {
              const pricing = document.getElementById('pricing');
              if (pricing) pricing.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full md:w-auto bg-dark-steel text-white border border-white/10 px-12 py-5 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-carbon hover:border-racing-red/50 transition-all hover:scale-105 shadow-2xl"
          >
            Start Free Trial
          </button>
        </div>
        
        <div className="mt-16 flex items-center justify-center gap-12 opacity-40 grayscale grayscale-[50%] contrast-[1.5]">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">MOPAR</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-racing-red">FORD</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">CHEVY</div>
          <div className="text-[10px] font-black tracking-[0.3em] uppercase">PONTIAC</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-racing-red to-transparent" />
      </div>
    </div>
  );
};

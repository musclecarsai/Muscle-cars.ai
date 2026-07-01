import React from 'react';
import { BookOpen, Download, ShieldCheck } from 'lucide-react';

const GUIDES = [
  {
    title: "1960s Muscle Car Buying Guide",
    description: "What to look for, rust spots, and serial number verification. The complete collector's handbook.",
    image: "/src/assets/ebook-covers/guide-american-icons.png",
    badge: "GUIDE #1"
  },
  {
    title: "The Hemi Restoration Bible",
    description: "Complete guide to restoring 426 Hemi engines. Build, tune, and dominate the track.",
    image: "/src/assets/ebook-covers/guide-engine-mastery.png",
    badge: "GUIDE #2"
  },
  {
    title: "Market Trends 2024",
    description: "Which models are appreciating fastest this year? Valuation, authentication, and growth.",
    image: "/src/assets/ebook-covers/guide-investment-grade.png",
    badge: "GUIDE #3"
  }
];

interface FreeResourcesProps {
  onDownload?: () => void;
  onViewPremium?: () => void;
}

export const FreeResources = ({ onDownload, onViewPremium }: FreeResourcesProps) => {
  return (
    <section className="py-24 bg-charcoal border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-racing-red font-black tracking-widest text-xs uppercase">
              <BookOpen size={16} />
              Knowledge Base
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Free <span className="text-racing-red">Expertise</span></h2>
            <p className="text-titanium text-lg">Complimentary guides for serious collectors (Hard limit of 3 per user).</p>
          </div>
          <button 
            onClick={() => onViewPremium?.()}
            className="bg-dark-steel text-titanium hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/10 px-8 py-4 rounded-lg hover:border-racing-red/50 shadow-xl"
          >
            View Premium Library →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {GUIDES.map((guide) => (
            <div key={guide.title} className="group relative">
              {/* Card Container */}
              <div className="bg-dark-steel rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-racing-red/30">
                
                {/* Cover Image */}
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={guide.image} 
                    alt={guide.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal 60% to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-gold text-charcoal text-[10px] font-black px-2 py-1 rounded tracking-tighter shadow-xl">
                    {guide.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 -mt-20 relative z-10">
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-racing-red transition-colors">{guide.title}</h3>
                  <p className="text-titanium text-sm leading-relaxed mb-8 h-12 line-clamp-2">
                    {guide.description}
                  </p>
                  
                  <button 
                    onClick={() => onDownload?.()}
                    className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest bg-racing-red hover:bg-racing-red-light px-6 py-4 rounded-lg transition-all w-full justify-center shadow-lg shadow-racing-red/20"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>

                {/* Verification Footer */}
                <div className="px-8 py-3 bg-charcoal/50 border-t border-white/5 flex items-center gap-2 text-[10px] text-titanium/50 font-bold uppercase tracking-tighter">
                  <ShieldCheck size={12} className="text-emerald" />
                  Verified technical data
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

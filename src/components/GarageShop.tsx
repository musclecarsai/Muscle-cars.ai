import React from 'react';
import { Zap, ShieldCheck, Camera, FileText, BarChart3, FileOutput, BookOpen } from 'lucide-react';

const ADD_ONS = [
  {
    title: "Listing Boost",
    price: "$7.99",
    headline: "Get 10x More Eyes on Your Car.",
    description: "Jump to the top of the search results for 48 hours. Maximize visibility and faster offers.",
    image: "/src/assets/garage-shop/listing-boost-banner.png",
    icon: <Zap className="text-racing-red" size={24} />,
    accent: "border-racing-red",
    tag: "Promotion"
  },
  {
    title: "VIN History Report",
    price: "$24.99",
    headline: "Uncover the Hidden History.",
    description: "Pull data from state DMVs, insurance records, and our exclusive muscle car database.",
    image: "/src/assets/garage-shop/vin-report-banner.png",
    icon: <FileText className="text-deep-blue" size={24} />,
    accent: "border-deep-blue",
    tag: "Research"
  },
  {
    title: "AI Photo Suite",
    price: "$19.99",
    headline: "Professional Photos, No Pro Price.",
    description: "Transform driveway shots into showroom masterpieces. Enhance lighting and backgrounds.",
    image: "/src/assets/garage-shop/ai-photo-suite-banner.png",
    icon: <Camera className="text-amber-glow" size={24} />,
    accent: "border-amber-glow",
    tag: "Enhancement"
  },
  {
    title: "Verified Inspection",
    price: "$199.00",
    headline: "Our Experts, Your Eyes.",
    description: "We’ll send a certified specialist for a 150-point inspection and detailed video report.",
    image: "/src/assets/garage-shop/verified-inspection-banner.png",
    icon: <ShieldCheck className="text-gold" size={24} />,
    accent: "border-gold",
    tag: "Trust"
  },
  {
    title: "Single Valuation",
    price: "$9.99",
    headline: "Know Exactly What It’s Worth.",
    description: "AI-powered engine uses real-time market data, auction results, and rarity factors.",
    image: "/src/assets/garage-shop/valuation-banner.png",
    icon: <BarChart3 className="text-emerald" size={24} />,
    accent: "border-emerald",
    tag: "Financial"
  },
  {
    title: "Portfolio Export",
    price: "$12.99",
    headline: "Insurance-Ready Documentation.",
    description: "Generate a professional PDF of your collection. Perfect for insurance and estate planning.",
    image: "/src/assets/garage-shop/portfolio-export-banner.png",
    icon: <FileOutput className="text-emerald" size={24} />,
    accent: "border-emerald",
    tag: "Financial"
  }
];

interface GarageShopProps {
  onBuy?: (item: { title: string, price: string }) => void;
}

export const GarageShop = ({ onBuy }: GarageShopProps) => {
  return (
    <section className="py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-gold font-black tracking-[0.3em] text-xs uppercase">
              <Zap size={16} fill="currentColor" />
              The Garage Shop
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Performance <span className="text-gold">Add-ons</span></h2>
            <p className="text-titanium max-w-xl text-lg mt-4">Accelerate your sale and protect your investment with professional per-use services.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ADD_ONS.map((addon) => (
            <div key={addon.title} className={`bg-dark-steel border-t-2 ${addon.accent} rounded-2xl overflow-hidden card-hover group relative`}>
              {/* Banner Image */}
              <div className="h-40 relative overflow-hidden">
                <img src={addon.image} alt={addon.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-steel to-transparent" />
                <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-md border border-white/10">
                  {addon.tag}
                </div>
              </div>

              <div className="p-8 -mt-12 relative z-10">
                <div className="mb-6 bg-charcoal w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:border-gold/50 transition-colors">
                  {addon.icon}
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-white tracking-tight">{addon.title}</h3>
                  <span className="text-gold font-mono font-black text-xl">{addon.price}</span>
                </div>
                
                <h4 className="text-white text-sm font-bold mb-2 tracking-tight uppercase">{addon.headline}</h4>
                <p className="text-titanium text-sm leading-relaxed mb-10 h-12 line-clamp-2">
                  {addon.description}
                </p>
                
                <button 
                  onClick={() => onBuy?.({ title: addon.title, price: addon.price })}
                  className="w-full bg-charcoal border border-gold/30 text-gold py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gold hover:text-charcoal transition-all shadow-lg group-hover:shadow-gold/10"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

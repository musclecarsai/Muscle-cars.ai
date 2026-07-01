import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Clock, FileText } from 'lucide-react';

const FEATURED_ARTICLES = [
  {
    slug: "best-muscle-cars-to-flip-2026",
    title: "Best Muscle Cars to Flip in 2026",
    readTime: "6 min read",
    image: "/src/assets/car-placeholders/camaro-zl1.png"
  },
  {
    slug: "how-to-value-classic-muscle-car",
    title: "How to Value a Classic Muscle Car",
    readTime: "8 min read",
    image: "/src/assets/car-placeholders/challenger-hellcat.png"
  }
];

export const ExpertInsights = () => {
  return (
    <section className="py-24 bg-dark-steel relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-racing-red/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-racing-red font-black tracking-widest text-[10px] uppercase mb-4">
              <FileText size={14} />
              Market Intelligence
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Expert <span className="text-gold">Insights</span></h2>
          </div>
          <Link 
            to="/articles"
            className="text-gold hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 group"
          >
            View All Articles 
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {FEATURED_ARTICLES.map((article) => (
            <Link 
              key={article.slug}
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className="group relative bg-charcoal rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 flex"
            >
              <div className="w-1/3 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
              </div>
              <div className="w-2/3 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[9px] text-titanium/50 font-black uppercase tracking-widest mb-3">
                  <Clock size={12} />
                  {article.readTime}
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight italic group-hover:text-gold transition-colors">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

const ARTICLES = [
  {
    slug: "best-muscle-cars-to-flip-2026",
    title: "Best Muscle Cars to Flip in 2026: High-ROI Investment Picks",
    excerpt: "The muscle car market in 2026 has matured, rewarding those who can spot value in overlooked niches...",
    readTime: "6 min read",
    date: "July 1, 2026",
    image: "/src/assets/car-placeholders/camaro-zl1.png"
  },
  {
    slug: "how-to-value-classic-muscle-car",
    title: "How to Value a Classic Muscle Car: The Professional Collector’s Guide",
    excerpt: "Valuing a muscle car is part science, part art. Learn how the pros use VIN data and market trends...",
    readTime: "8 min read",
    date: "June 28, 2026",
    image: "/src/assets/car-placeholders/challenger-hellcat.png"
  },
  {
    slug: "muscle-car-market-trends-2026",
    title: "Muscle Car Market Trends: 2026 Comprehensive Report",
    excerpt: "The 'Radwood' effect is in full swing. See why 1990s muscle is outperforming traditional 1960s steel...",
    readTime: "10 min read",
    date: "June 25, 2026",
    image: "/src/assets/car-placeholders/mustang-dark-horse.png"
  },
  {
    slug: "professional-inspection-checklist",
    title: "The Professional Muscle Car Inspection Checklist: Protect Your Investment",
    excerpt: "Don't get burned by a 'clone' or hidden rust. Use our 50-point checklist before you cut the check...",
    readTime: "5 min read",
    date: "June 20, 2026",
    image: "/src/assets/car-placeholders/camaro-zl1.png"
  }
];

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Muscle Car Investment Guides & Market Analysis | MuscleCars.ai" },
      { name: "description", content: "Expert muscle car investment guides, market trend analysis for 2026, and professional inspection checklists. Learn how to value, flip, and collect classic muscle cars." },
      { name: "keywords", content: "muscle car investment, classic car market trends 2026, muscle car flipping, car valuation guide, muscle car inspection" },
      { property: "og:title", content: "Muscle Car Investment Guides & Market Analysis | MuscleCars.ai" },
      { property: "og:description", content: "Expert guides on muscle car investing, market trends, and professional inspection checklists for serious collectors." },
    ],
  }),
  component: ArticlesList,
});

function ArticlesList() {
  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      
      <div className="bg-dark-steel border-b border-gold/20 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/carbon-fiber.png')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-racing-red/10 text-racing-red px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-racing-red/20">
            KNOWLEDGE BASE
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic mb-6">
            Expert <span className="text-racing-red">Insights</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
            Market analysis, technical guides, and investment strategy from the world's leading muscle car authorities.
          </p>
        </div>
      </div>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {ARTICLES.map((article) => (
              <Link 
                key={article.slug}
                to="/articles/$slug"
                params={{ slug: article.slug }}
                className="group flex flex-col bg-dark-steel rounded-3xl overflow-hidden border border-white/5 hover:border-racing-red/30 transition-all duration-500 shadow-2xl shadow-black/50"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-steel to-transparent" />
                  <div className="absolute top-6 left-6">
                    <div className="bg-racing-red text-white text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase">
                      SEO INSIGHT
                    </div>
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] text-titanium/50 font-black uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime}</span>
                    <span className="w-1 h-1 rounded-full bg-titanium/30" />
                    <span>{article.date}</span>
                  </div>
                  
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-tight group-hover:text-racing-red transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-titanium leading-relaxed mb-8">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-2 text-racing-red text-[10px] font-black uppercase tracking-widest">
                    Read Article <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

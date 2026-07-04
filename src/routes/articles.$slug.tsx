import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const getArticleContent = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      const filePath = join(process.cwd(), "..", "shared", "content", "articles", `${slug}.md`);
      const content = await readFile(filePath, "utf8");
      
      // Simple metadata extraction
      const title = content.split('\n')[0].replace('# ', '');
      const body = content.split('\n').slice(1).join('\n');
      
      return { title, body };
    } catch (error) {
      console.error("Error reading article:", error);
      return { title: "Article Not Found", body: "We couldn't find the requested article." };
    }
  });

const SEO_META: Record<string, { title: string; desc: string }> = {
  "best-muscle-cars-to-flip-2026": {
    title: "Best Muscle Cars to Flip in 2026 | High-ROI Investment Picks",
    desc: "Discover the top muscle cars with highest ROI potential in 2026. Expert analysis on undervalued models from Fox Body Mustangs to AMC Javelins."
  },
  "how-to-value-classic-muscle-car": {
    title: "How to Value a Classic Muscle Car | Professional Collector's Guide",
    desc: "Learn professional techniques for valuing classic muscle cars using VIN verification, matching numbers, condition grading, and market data."
  },
  "muscle-car-market-trends-2026": {
    title: "Muscle Car Market Trends 2026 | Comprehensive Report",
    desc: "Comprehensive 2026 muscle car market analysis: Gen X takeover, Super-Restomod boom, Radwood effect, and investment strategies."
  },
  "professional-inspection-checklist": {
    title: "Professional Muscle Car Inspection Checklist | Protect Your Investment",
    desc: "50-point professional muscle car inspection checklist. Don't get burned by clones or hidden rust. Expert guide for serious collectors."
  }
};

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params: { slug } }) => getArticleContent({ data: slug }),
  head: ({ params }) => {
    const meta = SEO_META[params.slug] || { 
      title: "Muscle Car Expert Guide | MuscleCars.ai", 
      desc: "Expert muscle car investment guides, market analysis, and professional inspection resources from MuscleCars.ai."
    };
    return {
      meta: [
        { title: meta.title },
        { name: "description", content: meta.desc },
        { property: "og:title", content: meta.title },
        { property: "og:description", content: meta.desc },
        { property: "og:url", content: `https://1e492a047379233056524352bb6fcf8b.ctonew.app/articles/${params.slug}` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { title, body } = Route.useLoaderData();
  const { slug } = Route.useParams();

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/articles" 
          className="inline-flex items-center gap-2 text-titanium hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-12"
        >
          <ArrowLeft size={16} />
          Back to Insights
        </Link>
        
        <article className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-8 leading-[0.9]">
              {title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-[10px] text-titanium/50 font-black uppercase tracking-widest border-y border-white/5 py-6">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-racing-red" />
                <span>8 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-racing-red" />
                <span>July 1, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald" />
                <span>Verified Strategy</span>
              </div>
            </div>
          </header>
          
          <div className="prose prose-invert prose-racing-red max-w-none">
            {body.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-3xl font-black uppercase tracking-tight italic mt-12 mb-6 text-gold">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold uppercase tracking-tight mt-8 mb-4 text-white">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('* ')) {
                return <li key={i} className="text-titanium mb-2 ml-4">{line.replace('* ', '')}</li>;
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              const boldedLine = line.split('**').map((part, index) => {
                return index % 2 === 1 ? <strong key={index} className="text-white font-black">{part}</strong> : part;
              });
              
              return <p key={i} className="text-titanium text-lg leading-relaxed mb-6">{boldedLine}</p>;
            })}
          </div>
          
          <div className="mt-20 p-12 bg-dark-steel rounded-[2.5rem] border border-gold/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
             <div className="relative z-10">
               <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">Maximize Your <span className="text-gold">ROI</span></h3>
               <p className="text-titanium mb-8 max-w-xl">
                 Don't leave your flip to chance. Use our professional valuation engine and market reports to ensure every deal is a winner.
               </p>
               <Link 
                 to="/" 
                 className="inline-block bg-gold text-charcoal px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
               >
                 Explore Marketplace
               </Link>
             </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
}
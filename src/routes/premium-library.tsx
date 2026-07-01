import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  createUser, 
  logTransaction, 
  addAsset,
  getAssets,
  type User,
  type Asset
} from "../lib/db";
import { BookOpen, Download, ShieldCheck, Lock, ShoppingCart, CheckCircle2 } from "lucide-react";

const PREMIUM_EBOOKS = [
  {
    id: "gto-restoration",
    title: "The Ultimate GTO Restoration Guide",
    description: "Technical specs, sourcing rare parts, and common pitfalls. The definitive guide for GTO owners.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-engine-mastery.png", // Placeholder
    badge: "PREMIUM #1"
  },
  {
    id: "investment-secrets",
    title: "Muscle Car Investment Secrets",
    description: "How to spot appreciating classics and avoid 'clones'. Protect your capital with expert insight.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-investment-grade.png", // Placeholder
    badge: "PREMIUM #2"
  },
  {
    id: "engine-tuning",
    title: "Engine Performance Tuning for Classics",
    description: "Deep dive into small-block and big-block optimization. Maximize torque and reliability.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-american-icons.png", // Placeholder
    badge: "PREMIUM #3"
  }
];

const getLibraryData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    if (!email) return { user: null, purchasedAssets: [] };
    let user = await getUser(email);
    if (!user) user = await createUser(email);
    const assets = await getAssets(user.id);
    const purchasedAssets = assets.filter(a => a.type === 'ebook').map(a => a.name);
    return { user, purchasedAssets };
  });

const purchaseEBookFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, ebookId: string, title: string, priceCents: number }) => data)
  .handler(async ({ data }) => {
    await logTransaction(data.userId, 'micro-transaction', `ebook-${data.ebookId}`, data.priceCents);
    await addAsset(data.userId, data.title, 'ebook', `/downloads/${data.ebookId}.pdf`);
    return { success: true };
  });

export const Route = createFileRoute("/premium-library")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || undefined,
  }),
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getLibraryData({ data: email }),
  component: PremiumLibrary,
});

function PremiumLibrary() {
  const { user, purchasedAssets } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/premium-library" });
  const [processing, setProcessing] = useState<string | null>(null);

  const handlePurchase = async (ebook: typeof PREMIUM_EBOOKS[0]) => {
    if (!user) {
      alert("Please login first (add ?email=your@email.com to the URL)");
      return;
    }

    setProcessing(ebook.id);
    const priceCents = Math.round(parseFloat(ebook.price.replace('$', '')) * 100);
    
    try {
      await purchaseEBookFn({ 
        data: { 
          userId: user.id, 
          ebookId: ebook.id, 
          title: ebook.title, 
          priceCents 
        } 
      });
      alert(`Success! "${ebook.title}" has been added to your library.`);
      navigate({ search: (prev) => prev }); // Refresh
    } catch (err) {
      alert("Purchase failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      
      {/* Header */}
      <div className="bg-dark-steel border-b border-gold/20 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/carbon-fiber.png')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
            ELITE KNOWLEDGE BASE
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic mb-6">
            Premium <span className="text-gold">Library</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
            Technical masterclasses for the serious collector. Master restoration, investment strategy, and engine performance with our verified technical guides.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {PREMIUM_EBOOKS.map((ebook) => {
              const isPurchased = purchasedAssets.includes(ebook.title);
              
              return (
                <div key={ebook.id} className="group relative">
                  {/* Card */}
                  <div className={`bg-dark-steel rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isPurchased ? 'border-emerald/30 shadow-emerald/5' : 'border-white/5 hover:border-gold/30 shadow-2xl shadow-black/50'}`}>
                    
                    {/* Cover Image */}
                    <div className="relative h-96 overflow-hidden">
                      <img 
                        src={ebook.image} 
                        alt={ebook.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPurchased ? '' : 'grayscale-[0.5]'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-steel 70% to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-6 right-6 bg-gold text-charcoal text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest shadow-2xl uppercase">
                        {ebook.badge}
                      </div>

                      {/* Lock Icon for non-purchased */}
                      {!isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-charcoal/40 backdrop-blur-sm p-4 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="text-gold" size={32} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-10 -mt-24 relative z-10">
                      <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight group-hover:text-gold transition-colors">
                        {ebook.title}
                      </h3>
                      <p className="text-titanium text-sm leading-relaxed mb-10 h-12 line-clamp-2">
                        {ebook.description}
                      </p>
                      
                      <div className="flex items-center justify-between gap-6">
                        {isPurchased ? (
                          <button className="flex-1 flex items-center justify-center gap-3 bg-emerald/10 text-emerald border border-emerald/30 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">
                            <CheckCircle2 size={18} />
                            OWNED
                          </button>
                        ) : (
                          <div className="flex items-center gap-4 w-full">
                            <div className="text-2xl font-mono font-black text-white">{ebook.price}</div>
                            <button 
                              onClick={() => handlePurchase(ebook)}
                              disabled={processing === ebook.id}
                              className="flex-1 flex items-center justify-center gap-3 bg-gold text-charcoal hover:bg-white transition-all py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(201,168,76,0.3)] disabled:opacity-50"
                            >
                              {processing === ebook.id ? (
                                <span className="animate-pulse">PROCESSING...</span>
                              ) : (
                                <>
                                  <ShoppingCart size={18} />
                                  BUY NOW
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification Footer */}
                    <div className="px-10 py-5 bg-charcoal/50 border-t border-white/5 flex items-center justify-between text-[10px] text-titanium/50 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-gold" />
                        Master Technical Data
                      </div>
                      {isPurchased && (
                        <button className="text-gold hover:text-white transition-colors flex items-center gap-1">
                          <Download size={12} />
                          DOWNLOAD PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upsell for Enthusiasts */}
          {!user || user.tier === 'starter' ? (
            <div className="mt-24 bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-10">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tight">Unlock Everything with <span className="text-gold font-bold">Enthusiast</span></h3>
                <p className="text-titanium text-lg">Enthusiast members get full access to the entire library and unlimited AI valuations.</p>
              </div>
              <button 
                onClick={() => navigate({ to: '/', search: (prev) => prev })}
                className="bg-gold text-charcoal px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                View Plans
              </button>
            </div>
          ) : (
            <div className="mt-24 text-center">
              <p className="text-titanium font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                <CheckCircle2 className="text-emerald" size={20} />
                Enthusiast Member: Premium Access Enabled
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

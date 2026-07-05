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
  incrementGuide,
  type User,
  type Asset
} from "../lib/db";
import { BookOpen, Download, ShieldCheck, Lock, ShoppingCart, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { EmailCaptureModal } from "../components/EmailCaptureModal";
import { SignInModal } from "../components/SignInModal";
import { Paywall } from "../components/Paywall";

const FREE_GUIDES = [
  {
    id: "american-icons",
    title: "American Icons",
    subtitle: "The Complete Collector's Handbook",
    description: "1960s buying guide + GTO restoration — covers the golden era of American muscle.",
    pages: "8 pages",
    features: ["1960s Buying Guide", "GTO Restoration", "Specs: Chevelle, GTO, Boss 429"],
    filename: "american-icons.pdf",
    coverImg: "/src/assets/ebook-covers/guide-american-icons.png",
    leadMagnetImg: null
  },
  {
    id: "hemi-restoration",
    title: "The Hemi Restoration Bible",
    subtitle: "Mopar's Most Legendary Powerplant",
    description: "Complete Hemi engine restoration guide — identification, components, authenticity, and first-start procedures.",
    pages: "Free Chapter",
    features: ["426 Hemi Identification", "Component-Specific Build", "Concours Authenticity"],
    filename: "engine-mastery.pdf",
    coverImg: "/src/assets/marketing/lead-magnet-hemi-restoration.png",
    leadMagnetImg: "lead-magnet-hemi-restoration.png"
  },
  {
    id: "investment-secrets",
    title: "Muscle Car Investment Secrets",
    subtitle: "Spot Appreciating Classics",
    description: "Avoid clones, identify future classics, and build a portfolio that outperforms the market.",
    pages: "Free Chapter",
    features: ["Three Pillars of Value", "Spotting Clones", "Future Classics Watchlist"],
    filename: "investment-grade.pdf",
    coverImg: "/src/assets/marketing/lead-magnet-investment-secrets.png",
    leadMagnetImg: "lead-magnet-investment-secrets.png"
  },
  {
    id: "chevelle-ss",
    title: "Chevelle SS Buyer's Guide",
    subtitle: "How to Spot a Real Super Sport",
    description: "Complete identification guide for the Chevelle SS — decode trim tags, verify originality, and estimate restoration costs.",
    pages: "Free Chapter",
    features: ["Trim Code Decoding", "Real SS vs Clone Detection", "Restoration Cost Calculator"],
    filename: "chevelle-ss-buyers-guide.pdf",
    coverImg: "/src/assets/ebook-covers/guide-chevelle-ss.png",
    leadMagnetImg: null
  },
  {
    id: "mopar-guide",
    title: "The Ultimate Mopar Guide",
    subtitle: "Hemi Cuda, Charger, Road Runner & Super Bee",
    description: "Complete field guide to the most iconic Mopar muscle cars. Identification, production numbers, and current market values.",
    pages: "Free Chapter",
    features: ["Hemi Cuda & Challenger Specs", "Charger R/T & Daytona IDs", "Road Runner / Super Bee Values"],
    filename: "ultimate-mopar-guide.pdf",
    coverImg: "/src/assets/ebook-covers/guide-mopar.png",
    leadMagnetImg: null
  },
  {
    id: "ford-muscle",
    title: "Ford Muscle Bible",
    subtitle: "Boss 429/302, Torino Cobra & Shelby GT350/500",
    description: "The definitive reference for Ford's golden era. Engine specs, production figures, and investment-grade verification.",
    pages: "Free Chapter",
    features: ["Boss 429 vs 302 Identification", "Torino Cobra Value Guide", "Shelby GT350/500 Authenticity"],
    filename: "ford-muscle-bible.pdf",
    coverImg: "/src/assets/ebook-covers/guide-ford-muscle.png",
    leadMagnetImg: null
  },
  {
    id: "engine-building",
    title: "Engine Building 101",
    subtitle: "Small Blocks, Big Blocks & Stroker Kits",
    description: "Master engine blueprinting for street and strip. Bore, stroke, compression, and cam selection made simple.",
    pages: "Free Chapter",
    features: ["Small Block vs Big Block Guide", "Stroker Kit Selection", "Blueprinting for Street/Strip"],
    filename: "engine-building-101.pdf",
    coverImg: "/src/assets/ebook-covers/guide-engine-building.png",
    leadMagnetImg: null
  }
];

const PREMIUM_EBOOKS = [
  {
    id: "gto-restoration",
    title: "The Ultimate GTO Restoration Guide",
    description: "Technical specs, sourcing rare parts, and common pitfalls. The definitive guide for GTO owners.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-gto-restoration.png",
    badge: "PREMIUM #1"
  },
  {
    id: "investment-secrets",
    title: "Muscle Car Investment Secrets",
    description: "How to spot appreciating classics and avoid 'clones'. Protect your capital with expert insight.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-investment-secrets.png",
    badge: "PREMIUM #2"
  },
  {
    id: "engine-tuning",
    title: "Engine Performance Tuning for Classics",
    description: "Deep dive into small-block and big-block optimization. Maximize torque and reliability.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-performance-tuning.png",
    badge: "PREMIUM #3"
  },
  {
    id: "market-trends",
    title: "Muscle Car Market Trends 2026",
    description: "Analysis and projections for the serious collector. Flight to quality, survivor cars, and restomod demand.",
    price: "$14.99",
    image: "/src/assets/ebook-covers/guide-market-trends.png",
    badge: "NEW"
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

const downloadFreeGuideFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, guideTitle: string }) => data)
  .handler(async ({ data }) => {
    await incrementGuide(data.userId, data.guideTitle);
    return { success: true };
  });

export const Route = createFileRoute("/premium-library")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || undefined,
  }),
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getLibraryData({ data: email }),
  head: () => ({
    meta: [
      { title: "Premium Library — MuscleCars.ai" },
      { name: "description", content: "Expert muscle car guides and resources." },
    ],
  }),
  component: PremiumLibrary,
});

function PremiumLibrary() {
  const { user, purchasedAssets } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/premium-library" });
  const [processing, setProcessing] = useState<string | null>(null);
  const [emailCapture, setEmailCapture] = useState<{ open: boolean, guideTitle: string }>({ open: false, guideTitle: "" });
  const [signInOpen, setSignInOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handlePurchase = async (ebook: typeof PREMIUM_EBOOKS[0]) => {
    if (!user) {
      setSignInOpen(true);
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
      navigate({ search: (prev) => prev });
    } catch (err) {
      alert("Purchase failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDownloadFree = async (guide: typeof FREE_GUIDES[0]) => {
    if (!user) {
      setEmailCapture({ open: true, guideTitle: guide.title });
      return;
    }

    // Check guide limit — starter users get 3 free guides
    if (user.tier === 'starter' && user.guide_count >= 3) {
      setPaywallOpen(true);
      return;
    }

    await downloadFreeGuideFn({ data: { userId: user.id, guideTitle: guide.title } });
    alert(`Success! "${guide.title}" has been added to your portfolio. Download link sent to ${user.email}.`);
    navigate({ search: (prev) => prev });
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

      <EmailCaptureModal 
        isOpen={emailCapture.open}
        onClose={() => setEmailCapture({ ...emailCapture, open: false })}
        guideTitle={emailCapture.guideTitle}
        onSuccess={(email) => {
          setEmailCapture({ ...emailCapture, open: false });
          navigate({ search: (prev) => ({ ...prev, email }) });
        }}
      />
      <Paywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="Guide Limit Reached"
        description="You have downloaded all 3 of your free guides. Upgrade to Enthusiast for unlimited access to our entire premium library of technical manuals."
        feature="PREMIUM GUIDES"
      />
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={(email) => {
          setSignInOpen(false);
          const url = new URL(window.location.href);
          url.searchParams.set("email", email);
          window.location.href = url.toString();
        }}
      />


      {/* Free Guides Section */}
      <section className="py-24 bg-gradient-to-b from-charcoal to-dark-steel">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-racing-red/10 text-racing-red px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-racing-red/20">
              FREE DOWNLOAD
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
              Muscle Car <span className="text-gold">Guides</span>
            </h2>
            <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
              Professional-grade technical guides. Master restoration and investment strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {FREE_GUIDES.map((guide) => (
              <div key={guide.id} className="group bg-dark-steel rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 shadow-2xl shadow-black/50 card-hover">
                {/* Cover */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-b from-charcoal to-dark-steel">
                  <img 
                    src={guide.coverImg} 
                    alt={guide.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-steel via-dark-steel/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-block bg-gold text-charcoal text-[9px] font-black px-3 py-1 rounded-lg tracking-widest uppercase mb-3">
                      {guide.pages}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      {guide.title}
                    </h3>
                    <p className="text-gold text-sm font-bold uppercase tracking-wider mt-1">
                      {guide.subtitle}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-8">
                  <p className="text-titanium text-sm leading-relaxed mb-6">
                    {guide.description}
                  </p>
                  <div className="space-y-2 mb-8">
                    {guide.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-titanium/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDownloadFree(guide)}
                    className="flex items-center justify-center gap-3 w-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-charcoal transition-all py-4 rounded-2xl font-black uppercase text-xs tracking-widest group"
                  >
                    <Download size={16} className="group-hover:animate-bounce" />
                    DOWNLOAD FREE PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {PREMIUM_EBOOKS.map((ebook) => {
              const isPurchased = purchasedAssets.includes(ebook.title) || (user && user.tier !== 'starter');
              
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
                          <a href={`/downloads/${ebook.id === 'gto-restoration' ? 'american-icons' : ebook.id === 'engine-tuning' ? 'engine-mastery' : 'investment-grade'}.pdf`} download className="hover:text-white transition-colors">
                            DOWNLOAD PDF
                          </a>
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

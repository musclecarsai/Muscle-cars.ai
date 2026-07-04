import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { 
  getCars, 
  getUser, 
  createUser, 
  incrementValuation, 
  incrementGuide, 
  logTransaction,
  getUserByReferralCode,
  createReferral,
  getReferrals,
  getListingCap,
  type Car, 
  type User 
} from "../lib/db";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { CarCard } from "../components/CarCard";
import { GarageShop } from "../components/GarageShop";
import { FreeResources } from "../components/FreeResources";
import { ExpertInsights } from "../components/ExpertInsights";
import { Pricing } from "../components/Pricing";
import { Footer } from "../components/Footer";
import { Paywall } from "../components/Paywall";
import { EmailCaptureModal } from "../components/EmailCaptureModal";
import { SignInModal } from "../components/SignInModal";
import { Search, Lock } from "lucide-react";

// Asset mapping for placeholders
const CAR_IMAGES: Record<string, string> = {
  'Plymouth': '/src/assets/car-placeholders/challenger-hellcat.png',
  'Dodge': '/src/assets/car-placeholders/challenger-hellcat.png',
  'Chevrolet': '/src/assets/car-placeholders/camaro-zl1.png',
  'Ford': '/src/assets/car-placeholders/mustang-dark-horse.png',
  'Buick': '/src/assets/car-placeholders/camaro-zl1.png',
  'Pontiac': '/src/assets/car-placeholders/camaro-zl1.png',
  'Oldsmobile': '/src/assets/car-placeholders/camaro-zl1.png',
};

const getPageData = createServerFn({ method: "GET" })
  .validator((data: { email: string | undefined, ref: string | undefined }) => data)
  .handler(async ({ data: { email, ref } }) => {
    const cars = await getCars();
    let user: User | null = null;
    if (email) {
      const existingUser = await getUser(email);
      user = existingUser;
      if (!user) {
        user = await createUser(email);
        
        // Handle referral for new user
        if (ref) {
          const referrer = await getUserByReferralCode(ref);
          if (referrer && referrer.email !== email) {
            await createReferral(referrer.id, email);
          }
        }
      }
    }
    return { cars, user };
  });

const incrementValuationFn = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    await incrementValuation(userId);
    return { success: true };
  });

const incrementGuideFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, guideTitle: string }) => data)
  .handler(async ({ data: { userId, guideTitle } }) => {
    await incrementGuide(userId, guideTitle);
    return { success: true };
  });

const logTransactionFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, type: string, itemId: string, amountCents: number }) => data)
  .handler(async ({ data }) => {
    await logTransaction(data.userId, data.type, data.itemId, data.amountCents);
    return { success: true };
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MuscleCars.ai — Premium Muscle Car Marketplace, Valuations & Community" },
      { name: "description", content: "The definitive digital marketplace for high-performance muscle cars. Professional-grade AI valuations, portfolio tracking, and expert negotiation services." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
      ref: (search.ref as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email, ref } }) => ({ email, ref }),
  loader: ({ deps }) => getPageData({ data: deps }),
  component: Home,
});

function Home() {
  const { cars, user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/' });
  const [paywall, setPaywall] = useState<{ open: boolean, type: 'valuation' | 'guide' }>({ open: false, type: 'valuation' });
  const [emailCapture, setEmailCapture] = useState<{ open: boolean, guideTitle: string }>({ open: false, guideTitle: "" });
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!user) {
      setSignInOpen(true);
      return;
    }

    if (user.tier === 'starter' && user.valuation_count >= 3) {
      setPaywall({ open: true, type: 'valuation' });
      return;
    }

    await incrementValuationFn({ data: user.id });
    alert("Valuation analysis complete! Results added to your profile.");
    navigate({ search: (prev) => prev }); // Refresh data
  };

  const handleDownload = async (guideTitle: string) => {
    if (!user) {
      setEmailCapture({ open: true, guideTitle });
      return;
    }

    if (user.tier === 'starter' && user.guide_count >= 3) {
      setPaywall({ open: true, type: 'guide' });
      return;
    }

    await incrementGuideFn({ data: user.id });
    alert(`Success! "${guideTitle}" is now available in your portfolio.`);
    navigate({ search: (prev) => prev }); // Refresh data
  };

  const handleBuy = async (item: { title: string, price: string }) => {
    if (!user) {
      alert("Please login first (add ?email=your@email.com to the URL)");
      return;
    }

    // Stripe Payment Link Map — redirect every Buy button to its real checkout page
    const STRIPE_LINKS: Record<string, string> = {
      'Single Valuation': 'https://buy.stripe.com/4gMeVd1ep6Rq7GF5Lg1Nu0c',
      'VIN History Report': 'https://buy.stripe.com/bJe6oHaOZ4Ji3qp3D81Nu0d',
      'AI Photo Suite': 'https://buy.stripe.com/8x24gz6yJ2Ba3qp5Lg1Nu0e',
      'Listing Boost': 'https://buy.stripe.com/bJeeVd9KVejS0ed7To1Nu0f',
      'Featured Meet-up': 'https://buy.stripe.com/00w14n9KV7Vu2ml4Hc1Nu0n',
      'Technical eBook': 'https://buy.stripe.com/8x27sL8GR5Nm1ih5Lg1Nu0j',
      'Payment Negotiation': 'https://buy.stripe.com/3cIaEXf5f3Fe0edehM1Nu0k',
      'Verified Inspection': 'https://buy.stripe.com/14AaEXcX7cbK8KJ2z41Nu0l',
      'Portfolio Export': 'https://buy.stripe.com/9B6cN55uFa3C6CB7To1Nu0m',
    };

    const stripeUrl = STRIPE_LINKS[item.title];
    if (stripeUrl) {
      const priceCents = Math.round(parseFloat(item.price.replace('$', '')) * 100);
      await logTransactionFn({ data: { userId: user.id, type: 'micro-transaction', itemId: item.title, amountCents: priceCents } });
      window.location.href = stripeUrl;
      return;
    }

    // Fallback for any items not yet mapped
    const priceCents = Math.round(parseFloat(item.price.replace('$', '')) * 100);
    await logTransactionFn({ data: { userId: user.id, type: 'micro-transaction', itemId: item.title, amountCents: priceCents } });
    alert(`Purchase logged: ${item.title} for ${item.price}! (Stripe redirect not yet configured)`);
    navigate({ search: (prev) => prev });
  };

    const handleUpgrade = async (tier: string, price: string) => {
    if (!user) {
      const tierLower = tier.toLowerCase();
      const SUB_LINKS: Record<string, string> = {
        'enthusiast': 'https://buy.stripe.com/aFa3cv6yJgs0e53ddI1Nu0h',
        'entrepreneur': 'https://buy.stripe.com/6oU8wP2it8Zy8KJ3D81Nu0g',
        'professional': 'https://buy.stripe.com/fZuaEXg9j2Ba3qpc9E1Nu0i',
      };
      setPendingUrl(SUB_LINKS[tierLower] || null);
      setSignInOpen(true);
      return;
    }

    const tierLower = tier.toLowerCase();
    if (tierLower === 'enthusiast') {
      window.location.href = "https://buy.stripe.com/aFa3cv6yJgs0e53ddI1Nu0h";
      return;
    }
    if (tierLower === 'entrepreneur') {
      window.location.href = "https://buy.stripe.com/6oU8wP2it8Zy8KJ3D81Nu0g";
      return;
    }
    if (tierLower === 'professional') {
      window.location.href = "https://buy.stripe.com/fZuaEXg9j2Ba3qpc9E1Nu0i";
      return;
    }

    const priceCents = Math.round(parseFloat(price.replace('$', '')) * 100);
    await logTransactionFn({ data: { userId: user.id, type: 'subscription', itemId: tier, amountCents: priceCents } });
    alert(`Getting started with the ${tier} plan!`);
    navigate({ search: (prev) => prev });
  };

  const handleSignInSuccess = (email: string) => {
    setSignInOpen(false);
    if (pendingUrl) {
      window.location.href = pendingUrl;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('email', email);
    window.location.href = url.toString();
  };


  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      
      {user && (
        <div className="bg-racing-red text-white py-2 text-center text-xs font-black uppercase tracking-[0.2em] flex justify-center gap-6 border-b border-white/10">
          <span>AUTHENTICATED: {user.email}</span>
          <span className="text-gold">TIER: {user.tier}</span>
          <span className="opacity-80">LISTINGS: {user.listing_count || 0}/{user.tier === 'professional' || user.tier === 'dealership' ? '∞' : getListingCap(user.tier)}</span>
          <span className="opacity-80">FREE VALUATIONS: {user.tier === 'starter' ? Math.max(0, 3 - user.valuation_count) : 'UNLIMITED'}</span>
          <span className="opacity-80">FREE GUIDES: {user.tier === 'starter' ? Math.max(0, 3 - user.guide_count) : 'UNLIMITED'}</span>
        </div>
      )}

      <Hero />

      <Paywall 
        isOpen={paywall.open} 
        onClose={() => setPaywall({ ...paywall, open: false })}
        title="Limit Reached"
        description={paywall.type === 'valuation' 
          ? "You've used all 3 of your complimentary AI valuations. Upgrade now for unlimited access to our proprietary valuation engine."
          : "You've downloaded your 3 free guides. Upgrade to Enthusiast to unlock our entire premium library of technical manuals."
        }
        feature={paywall.type === 'valuation' ? "AI VALUATION" : "PREMIUM GUIDES"}
      />

      <EmailCaptureModal 
        isOpen={emailCapture.open}
        onClose={() => setEmailCapture({ ...emailCapture, open: false })}
        guideTitle={emailCapture.guideTitle}
        onSuccess={(email) => {
          setEmailCapture({ ...emailCapture, open: false });
          navigate({ search: (prev) => ({ ...prev, email }) });
        }}
      />

      <SignInModal
        isOpen={signInOpen}
        onClose={() => { setSignInOpen(false); setPendingUrl(null); }}
        onSignedIn={handleSignInSuccess}
      />

      {/* Marketplace Section */}
      <section className="py-24 bg-carbon-fiber" id="marketplace">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 text-racing-red font-black mb-4 tracking-[0.3em] text-xs">
                <div className="w-8 h-[2px] bg-racing-red" />
                LIVE TRADING FLOOR
              </div>
              <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">Verified <span className="text-racing-red">Inventory</span></h2>
              <p className="text-titanium max-w-xl text-lg">Premium listings sourced from verified collectors and elite dealerships.</p>
            </div>
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-titanium/50" size={20} />
              <input
                type="text"
                placeholder="Search by VIN, Model, or Year..."
                className="w-full bg-dark-steel border border-white/10 rounded-xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-racing-red transition-all placeholder:text-titanium/30 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <CarCard 
                key={car.id} 
                id={car.id}
                title={`${car.year} ${car.make} ${car.model}`}
                price={`$${car.price.toLocaleString()}`}
                mileage={`${car.mileage.toLocaleString()} MI`}
                year={car.year.toString()}
                image={CAR_IMAGES[car.make] || '/src/assets/car-placeholders/camaro-zl1.png'}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        </div>
      </section>

      <GarageShop onBuy={handleBuy} />
      <FreeResources 
        onDownload={handleDownload} 
        onViewPremium={() => navigate({ to: '/premium-library', search: (prev) => prev })}
      />
      <ExpertInsights />

      {/* Portfolio/Management Section - Premium Look */}
      <section className="bg-charcoal py-32 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-racing-red/5 skew-x-[-15deg] translate-x-1/4" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
              PRO ENGINE ACCESS
            </div>
            <h2 className="text-6xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9]">The Ultimate <br/><span className="text-gold">Portfolio</span> Tracker</h2>
            <p className="text-titanium text-xl mb-10 leading-relaxed max-w-lg">
              Don't leave your investment to guesswork. Our proprietary AI analyzes real-time auction data to protect your assets. <span className="text-white font-bold italic underline decoration-gold/50">Subscription required for full engine access.</span>
            </p>
            
            <div className="space-y-6 mb-12">
              {[
                "Live asset valuation & historical price tracking",
                "Automated seller appointment system",
                "Advanced ROI analytics for high-volume flippers"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white font-medium group">
                  <div className="w-3 h-3 bg-gold rounded-full shadow-[0_0_10px_rgba(201,168,76,0.5)] group-hover:scale-125 transition-transform" />
                  <span className="tracking-tight">{item}</span>
                </div>
              ))}
            </div>

            <button 
              className="gold-shimmer text-charcoal px-10 py-4 rounded-lg font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)]"
              onClick={() => {
                const pricing = document.getElementById('pricing');
                if (pricing) pricing.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Upgrade Your Garage
            </button>
          </div>

          <div className="relative group perspective-1000">
            <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            
            {/* Mockup Container */}
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl transition-transform duration-700 group-hover:rotate-y-[-5deg]">
              <img
                src="/src/assets/portfolio-mockup/locked-pro-state.png"
                alt="Portfolio Dashboard"
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              
              {/* Locked Overlay - Glassmorphism */}
              <div className="absolute inset-0 flex flex-col items-center justify-center glass-overlay transition-all duration-700">
                <div className="bg-charcoal/90 p-8 rounded-3xl border border-gold/30 text-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                    <Lock className="text-gold" size={32} />
                  </div>
                  <div className="text-gold font-black text-2xl mb-2 uppercase tracking-tighter italic">LOCKED</div>
                  <div className="text-titanium text-sm font-medium max-w-[200px]">Unlock professional portfolio tracking tools</div>
                </div>
              </div>
            </div>

            {/* Floating Data Badge */}
            <div className="absolute -bottom-6 -right-6 bg-dark-steel border border-racing-red p-4 rounded-2xl shadow-2xl animate-bounce-slow">
              <div className="text-racing-red font-black text-xl">+12.4%</div>
              <div className="text-[10px] text-titanium uppercase font-bold tracking-widest">Est. Appreciation</div>
            </div>
          </div>
        </div>
      </section>

      <Pricing onUpgrade={handleUpgrade} />
      <Footer />
    </div>
  );
}

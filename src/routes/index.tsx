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
  getTransactionFee,
  createSale,
  getSales,
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

// Asset mapping for placeholders — model-specific images
const CAR_IMAGES: Record<string, string> = {
  'GNX': '/src/assets/car-placeholders/buick-gnx-87.png',
  'Camaro': '/src/assets/car-placeholders/camaro-ss-69.png',
  'Camaro SS': '/src/assets/car-placeholders/camaro-ss-69.png',
  'Chevelle': '/src/assets/car-placeholders/chevelle-ss-70.png',
  'Charger': '/src/assets/car-placeholders/charger-rt-70.png',
  'Charger R/T': '/src/assets/car-placeholders/charger-rt-70.png',
  'Super Bee': '/src/assets/car-placeholders/super-bee-69.png',
  'Mustang': '/src/assets/car-placeholders/mustang-65.png',
  'Mustang GT': '/src/assets/car-placeholders/mustang-gt-67.png',
  '442': '/src/assets/car-placeholders/olds-442-70.png',
  "Belvedere HEMI": '/src/assets/car-placeholders/belvedere-hemi-66.png',
  "Hemi 'Cuda": '/src/assets/car-placeholders/hemi-cuda-70.png',
  'Road Runner': '/src/assets/car-placeholders/road-runner-70.png',
  'GTO': '/src/assets/car-placeholders/gto-67.png',
};

const getPageData = createServerFn({ method: "GET" })
  .validator((data: { email: string | undefined, ref: string | undefined }) => data)
  .handler(async ({ data: { email, ref } }) => {
    const cars = await getCars();
    const sales = await getSales();
    const completedSales = sales.filter(s => s.status === 'completed').length;
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
    return { cars, user, completedSales };
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
  .validator((data: { userId?: string, type: string, itemId: string, amountCents: number }) => data)
  .handler(async ({ data }) => {
    // userId is optional so anonymous (guest) A/B CTA clicks can be logged too.
    await logTransaction(data.userId ?? 'guest', data.type, data.itemId, data.amountCents);
    return { success: true };
  });

const processCarPurchaseFn = createServerFn({ method: "POST" })
  .validator((data: { buyerId: string, sellerId: string, carId: string, salePrice: number, feePercent: number }) => data)
  .handler(async ({ data }) => {
    const sale = await createSale(data.buyerId, data.sellerId, data.carId, data.salePrice, data.feePercent);
    // Send notification to owner
    const { execSync } = await import("node:child_process");
    try {
      execSync(`team-db "INSERT INTO notifications (type, message, details) VALUES ('car_sale', 'Car purchased: $${sale.sale_price.toLocaleString()}', 'Buyer: ${data.buyerId} | Seller: ${data.sellerId} | Car: ${data.carId} | Fee: ${sale.fee_percent * 100}% | Net to seller: $${sale.net_to_seller.toLocaleString()}')"`);
    } catch (_) {}
    return { success: true, sale };
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
      cta: (search.cta as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email, ref } }) => ({ email, ref }),
  loader: ({ deps }) => getPageData({ data: deps }),
  component: Home,
});

function Home() {
  const { cars, user, completedSales } = Route.useLoaderData();
  const { cta } = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const [paywall, setPaywall] = useState<{ open: boolean, type: 'valuation' | 'guide' }>({ open: false, type: 'valuation' });
  const [emailCapture, setEmailCapture] = useState<{ open: boolean, guideTitle: string }>({ open: false, guideTitle: "" });
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [buyConfirm, setBuyConfirm] = useState<{ open: boolean, car: Car | null, feePercent: number, feeAmount: number, netToSeller: number }>({ open: false, car: null, feePercent: 0, feeAmount: 0, netToSeller: 0 });

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
    // Stripe Payment Link Map — redirect every Buy button to its real checkout page
    const STRIPE_LINKS: Record<string, string> = {
      'Single Valuation': 'https://buy.stripe.com/dRmfZhaOZfnW1ih0qW1Nu0G',
      'VIN History Report': 'https://buy.stripe.com/9B6bJ1g9jgs01ih8Xs1Nu0H',
      'AI Photo Suite': 'https://buy.stripe.com/3cI6oHaOZ8ZyaSR0qW1Nu0I',
      'Listing Boost': 'https://buy.stripe.com/6oU4gz5uF2Ba3qp6Pk1Nu0J',
      'Featured Meet-up': 'https://buy.stripe.com/8x23cv0al7VuaSR2z41Nu0F',
      'Technical eBook': 'https://buy.stripe.com/8x27sL8GR5Nm1ih5Lg1Nu0j',
      'Payment Negotiation': 'https://buy.stripe.com/fZuaEX2itejSf978Xs1Nu0K',
      'Verified Inspection': 'https://buy.stripe.com/7sY28r0al6Rqf974Hc1Nu0L',
      'Portfolio Export': 'https://buy.stripe.com/8x2aEX2ita3C1ih4Hc1Nu0M',
    };

    const stripeUrl = STRIPE_LINKS[item.title];
    // One-off Garage Shop purchases are guest-friendly — the launch copy promises
    // "no account needed." Send the buyer straight to Stripe whether or not they're
    // logged in; Stripe collects their email for result delivery. Log if signed in.
    if (stripeUrl) {
      if (user) {
        const priceCents = Math.round(parseFloat(item.price.replace('$', '')) * 100);
        await logTransactionFn({ data: { userId: user.id, type: 'micro-transaction', itemId: item.title, amountCents: priceCents } });
      }
      window.location.href = stripeUrl;
      return;
    }

    // Fallback for any items not yet mapped — keep an account wall here
    if (!user) {
      setPendingUrl(null);
      setSignInOpen(true);
      return;
    }

    const priceCents = Math.round(parseFloat(item.price.replace('$', '')) * 100);
    await logTransactionFn({ data: { userId: user.id, type: 'micro-transaction', itemId: item.title, amountCents: priceCents } });
    alert(`Purchase logged: ${item.title} for ${item.price}! (Stripe redirect not yet configured)`);
    navigate({ search: (prev) => prev });
  };

  // A/B valuation CTA — variant chosen by ?cta=a / ?cta=b (default: a).
  // Both point to the same $7.49 Single Valuation Stripe link; the click is
  // logged so the growth team can measure which framing converts.
  const VAL_LINK = "https://buy.stripe.com/dRmfZhaOZfnW1ih0qW1Nu0G";
  const ctaVariant = cta === 'b' ? 'b' : 'a';
  const handleValuationCta = async () => {
    await logTransactionFn({ data: { userId: user?.id, type: 'cta_click', itemId: `single-valuation-${ctaVariant}`, amountCents: 0 } });
    window.location.href = VAL_LINK;
  };

  const handleCarBuy = async (car: Car) => {
    if (!user) {
      setSignInOpen(true);
      return;
    }

    const feePercent = getTransactionFee(user.tier);
    const feeAmount = Math.round(car.price * feePercent);
    const netToSeller = car.price - feeAmount;

    setBuyConfirm({
      open: true,
      car,
      feePercent,
      feeAmount,
      netToSeller,
    });
  };

  const handleConfirmBuy = async () => {
    if (!buyConfirm.car || !user) return;
    const car = buyConfirm.car;

    // Process the purchase
    const result = await processCarPurchaseFn({ data: { 
      buyerId: user.id, 
      sellerId: car.owner_id, 
      carId: car.id, 
      salePrice: car.price, 
      feePercent: buyConfirm.feePercent 
    }});

    if (result.success) {
      alert(`Purchase confirmed! ${car.year} ${car.make} ${car.model} - ${car.price.toLocaleString()}\nFee: ${(buyConfirm.feePercent * 100).toFixed(1)}% (${buyConfirm.feeAmount.toLocaleString()})\nSeller receives: ${buyConfirm.netToSeller.toLocaleString()}\n\nStatus: pending (payment processing) — owner has been notified.`);
      setBuyConfirm({ open: false, car: null, feePercent: 0, feeAmount: 0, netToSeller: 0 });
      navigate({ search: (prev) => prev });
    } else {
      alert("Purchase failed. Please try again.");
    }
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
      {/* LAUNCH PROMO — 25% off. Primary CTA routes to the $7.49 valuation offer. */}
      <div className="bg-gradient-to-r from-racing-red via-red-700 to-gold text-white border-b border-gold/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          <span className="text-xs font-black tracking-[0.2em] uppercase">🔥 Launch Sale — 25% Off</span>
          <span className="text-sm font-semibold text-white/90">Subscriptions 25% off first 3 months · One-off services 25% off</span>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleValuationCta} className="bg-white text-racing-red px-3 py-1 rounded font-bold text-xs hover:bg-gold transition">Start with a $7.49 valuation</button>
            <a href="https://buy.stripe.com/aFa3cv6yJgs0e53ddI1Nu0h" className="bg-white/15 text-white px-3 py-1 rounded font-bold text-xs hover:bg-gold hover:text-racing-red transition">Enthusiast 3mo</a>
            <a href="https://buy.stripe.com/fZuaEX2itejSf978Xs1Nu0K" className="bg-white/15 text-white px-3 py-1 rounded font-bold text-xs hover:bg-gold hover:text-racing-red transition">Negotiation — $149</a>
          </div>
        </div>
      </div>
      
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

      {/* Buy Confirmation Modal */}
      {buyConfirm.open && buyConfirm.car && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4">
          <div className="bg-dark-steel border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-racing-red font-black mb-6 tracking-[0.3em] text-xs">
              <div className="w-8 h-[2px] bg-racing-red" />
              CONFIRM PURCHASE
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 italic">{buyConfirm.car.year} {buyConfirm.car.make} {buyConfirm.car.model}</h3>
            
            <div className="space-y-3 my-6 p-4 bg-charcoal rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-titanium text-xs font-black uppercase tracking-wider">Sale Price</span>
                <span className="text-white font-mono font-black text-lg">${buyConfirm.car.price.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-titanium text-xs font-black uppercase tracking-wider">Buyer Fee</span>
                <span className={`font-mono font-black ${buyConfirm.feePercent > 0 ? 'text-racing-red' : 'text-emerald'}`}>
                  {(buyConfirm.feePercent * 100).toFixed(1)}%
                  {buyConfirm.feePercent > 0 && <span className="text-titanium ml-1">(${buyConfirm.feeAmount.toLocaleString()})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-titanium text-xs font-black uppercase tracking-wider">Seller Receives</span>
                <span className="text-emerald font-mono font-black">${buyConfirm.netToSeller.toLocaleString()}</span>
              </div>
            </div>

            {buyConfirm.feePercent > 0 && (
              <div className="mb-4 p-3 bg-racing-red/10 border border-racing-red/20 rounded-lg">
                <p className="text-[10px] font-black uppercase tracking-wider text-racing-red text-center">
                  Upgrade to Enthusiast ($29/mo) to reduce fee to 1% — Professional tier pays 0%!
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBuyConfirm({ open: false, car: null, feePercent: 0, feeAmount: 0, netToSeller: 0 })}
                className="flex-1 border border-white/10 text-titanium py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuy}
                className="flex-1 bg-emerald hover:bg-emerald/80 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Signals Bar — social proof for first-time visitors */}
      <section className="py-8 bg-charcoal border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-black text-gold font-mono italic">{cars.filter(c => c.status === 'available').length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">Verified Listings</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-gold font-mono italic">{completedSales}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">Cars Sold</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-gold font-mono italic">${cars.reduce((sum, c) => sum + c.price, 0).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">Inventory Value</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-emerald font-mono italic">100%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">Verified Sellers</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-emerald font-mono italic">24/7</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">Buyer Protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Strip */}
      <section className="py-12 bg-dark-steel">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-4 tracking-widest uppercase border border-gold/20">
              ★★★★★&nbsp;&nbsp;Trusted by Collectors
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">What Our <span className="text-racing-red">Buyers</span> Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Mike R.", role: "Private Collector", quote: "Found my dream 1970 Hemi 'Cuda through MuscleCars.ai. The AI valuation was spot-on and the transaction was seamless. Sold within 48 hours of listing." },
              { name: "Sarah T.", role: "Portfolio Investor", quote: "The fee structure is transparent and the Professional tier pays for itself on the first deal. I've bought three cars through the platform this year alone." },
              { name: "Tom D.", role: "Restoration Shop Owner", quote: "As a Verified Partner, the 0% transaction fee and priority placement have been game-changers. My shop is now booked 6 months out." },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-charcoal rounded-xl p-6 border border-white/5 hover:border-gold/20 transition-all">
                <div className="flex items-center gap-1.5 mb-3 text-gold">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-xs">★</span>)}
                </div>
                <p className="text-titanium text-sm leading-relaxed italic mb-4">"{testimonial.quote}"</p>
                <div className="border-t border-white/5 pt-3">
                  <p className="text-white text-xs font-black uppercase tracking-wider">{testimonial.name}</p>
                  <p className="text-titanium text-[10px] font-bold uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Badges — trust indicators */}
      <section className="py-8 bg-charcoal border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-10 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-titanium/50">Trusted Partners:</span>
            {['Hagerty Certified', 'Mecum Auctions', 'Barrett-Jackson', 'Hemmings', 'Dupont Registry'].map((partner) => (
              <div key={partner} className="flex items-center gap-2 px-4 py-2 bg-dark-steel rounded-lg border border-white/5 hover:border-gold/20 transition-all">
                <div className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {cars.map((car) => {
              const currentFee = user ? getTransactionFee(user.tier) : 0.045;
              return (
              <CarCard 
                key={car.id} 
                id={car.id}
                title={`${car.year} ${car.make} ${car.model}`}
                price={`$${car.price.toLocaleString()}`}
                mileage={`${car.mileage.toLocaleString()} MI`}
                year={car.year.toString()}
                image={CAR_IMAGES[car.model] || '/src/assets/car-placeholders/camaro-ss-69.png'}
                status={car.status}
                onAnalyze={handleAnalyze}
                onBuy={() => handleCarBuy(car)}
                feeDisplay={car.status === 'available' ? `${(currentFee * 100).toFixed(1)}%` : undefined}
                buyerFeePercent={currentFee}
              />
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== BUYER LAUNCH OFFER — $7.49 Instant AI Valuation (entry offer) ===== */}
      <section className="py-24 bg-gradient-to-b from-dark-steel to-charcoal relative overflow-hidden" id="instant-valuation">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.12),transparent_45%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
                INSTANT AI VALUATION · LAUNCH PRICE
              </div>
              {ctaVariant === 'b' ? (
                <>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-5">
                    The most expensive mistake is <span className="text-gold">guessing.</span>
                  </h2>
                  <p className="text-titanium text-xl mb-8 max-w-xl leading-relaxed">
                    Find out what it's worth in 60 seconds. Auction buyers who didn't check paid, on
                    average, for a number they could have known.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-5">
                    Know the <span className="text-gold">real market value</span> before you bid.
                  </h2>
                  <p className="text-titanium text-xl mb-8 max-w-xl leading-relaxed">
                    Stop guessing at auctions and classifieds. Professional-grade AI valuation for any
                    muscle car in ~60 seconds — no account needed, results delivered instantly.
                  </p>
                </>
              )}

              <button onClick={handleValuationCta} className="group relative inline-flex items-center gap-3 bg-gold text-charcoal px-8 py-4 rounded font-black text-lg uppercase tracking-wide shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:bg-yellow-400 transition">
                {ctaVariant === 'b' ? "Don't Overpay — Get the True Price" : "Get My Valuation — $7.49"}
                <span className="text-xl transition group-hover:translate-x-1">→</span>
              </button>

              <p className="text-sm text-titanium/70 italic mt-4">
                Less than a tank of gas. 25% off launch pricing for the first 3 months — today only, no coupon needed.
              </p>

              {/* Trust signals */}
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-charcoal/60 border border-white/10 rounded-lg p-4">
                  <div className="text-gold font-black mb-1">60-sec turnaround</div>
                  <p className="text-sm text-titanium leading-snug">Enter year/make/model, get a market-backed number instantly.</p>
                </div>
                <div className="bg-charcoal/60 border border-white/10 rounded-lg p-4">
                  <div className="text-gold font-black mb-1">No account needed</div>
                  <p className="text-sm text-titanium leading-snug">Checkout with Stripe. Result delivered right away — no sign-up wall.</p>
                </div>
                <div className="bg-charcoal/60 border border-white/10 rounded-lg p-4">
                  <div className="text-gold font-black mb-1">Real market data</div>
                  <p className="text-sm text-titanium leading-snug">Trained on real-time auction results, listings &amp; rarity factors — not a guess.</p>
                </div>
              </div>

              {/* Upsell — professional negotiation */}
              <div className="mt-8 border border-gold/30 bg-gold/5 rounded-lg p-5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[220px]">
                  <div className="font-bold text-white">Buying a six-figure classic?</div>
                  <p className="text-sm text-titanium">Our professional negotiators handle payment terms, deposits, and final pricing for you.</p>
                </div>
                <a href="https://buy.stripe.com/fZuaEX2itejSf978Xs1Nu0K" className="inline-flex items-center gap-2 bg-white text-racing-red px-5 py-2.5 rounded font-bold text-sm hover:bg-gold transition">Professional Negotiation — $149</a>
              </div>
            </div>

            {/* Right — Sample valuation card (trust anchor) */}
            <div className="bg-charcoal border border-white/15 rounded-2xl p-8 shadow-2xl">
              <div className="text-[10px] font-black tracking-[0.2em] uppercase text-gold mb-4">Sample Valuation</div>
              <h3 className="text-2xl font-black uppercase italic mb-6">1969 Chevrolet Camaro SS 396</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-titanium">Fair</span><span className="font-black text-white">$58,000</span></div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-titanium">Good</span><span className="font-black text-white">$72,500</span></div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-titanium">Excellent</span><span className="font-black text-emerald-400">$91,000</span></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mt-4">
                <div className="bg-white/5 rounded p-3"><div className="text-gold font-bold mb-1">▲ +6.4%</div><div className="text-titanium">Market trend YoY</div></div>
                <div className="bg-white/5 rounded p-3"><div className="text-gold font-bold mb-1">412</div><div className="text-titanium">Auction comps</div></div>
                <div className="bg-white/5 rounded p-3"><div className="text-gold font-bold mb-1">High</div><div className="text-titanium">Rarity index</div></div>
              </div>
              <p className="text-sm text-titanium italic mt-5">"Looks to be one of the strongest appreciating segments of the market right now."</p>
              <p className="text-[10px] text-titanium/60 mt-4">Footnote: illustrative sample only — your result is generated from your vehicle's specifics.</p>
            </div>
          </div>
        </div>
      </section>

      
      <GarageShop onBuy={handleBuy} />

      {/* Merchandise Section — Shop Branded Gear */}
      <section className="py-32 bg-gradient-to-b from-charcoal to-dark-steel relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gold/5 skew-x-[12deg] -translate-x-1/4" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
              OFFICIAL GEAR
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
              Rep the <span className="text-gold">Brand</span>
            </h2>
            <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
              Premium MuscleCars.ai merchandise. Look the part at your next car meet, show, or cruise-in.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="group bg-dark-steel rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all">
              <div className="aspect-square bg-gradient-to-br from-charcoal to-dark-steel flex items-center justify-center p-8">
                <img src="/src/assets/garage-shop/merch-tshirt.png" alt="T-Shirt" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-white font-black uppercase text-sm tracking-tight">T-Shirt</h3>
                <p className="text-gold font-bold text-lg font-mono">$29.99</p>
              </div>
            </a>

            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="group bg-dark-steel rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all">
              <div className="aspect-square bg-gradient-to-br from-charcoal to-dark-steel flex items-center justify-center p-8">
                <img src="/src/assets/garage-shop/merch-hat.png" alt="Hat" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Hat</h3>
                <p className="text-gold font-bold text-lg font-mono">$24.99</p>
              </div>
            </a>

            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="group bg-dark-steel rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all">
              <div className="aspect-square bg-gradient-to-br from-charcoal to-dark-steel flex items-center justify-center p-8">
                <img src="/src/assets/garage-shop/merch-hoodie.png" alt="Hoodie" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Hoodie</h3>
                <p className="text-gold font-bold text-lg font-mono">$54.99</p>
              </div>
            </a>

            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="group bg-dark-steel rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all">
              <div className="aspect-square bg-gradient-to-br from-charcoal to-dark-steel flex items-center justify-center p-8">
                <img src="/src/assets/garage-shop/merch-decals.png" alt="Decals" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Decals</h3>
                <p className="text-gold font-bold text-lg font-mono">$9.99</p>
              </div>
            </a>
          </div>

          <div className="text-center mt-12">
            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gold text-charcoal px-10 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)]">
              Visit the Shop
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

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

      {/* Contact Section */}
      <section className="py-24 bg-dark-steel border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
            GET IN TOUCH
          </div>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
            Contact <span className="text-gold">Us</span>
          </h2>
          <p className="text-titanium text-xl max-w-2xl mx-auto mb-16">
            Questions, partnerships, or high-value consignments — reach out to the owner directly.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-charcoal border border-white/5 rounded-2xl p-8 hover:border-gold/30 transition-all">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gold/20">
                <svg className="text-gold" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 className="font-black uppercase text-sm mb-2">Owner / Operator</h3>
              <p className="text-gold text-lg font-bold">Colin Dorman</p>
              <p className="text-titanium text-xs mt-2">Direct line for dealers and serious collectors</p>
            </div>
            
            <div className="bg-charcoal border border-white/5 rounded-2xl p-8 hover:border-gold/30 transition-all">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gold/20">
                <svg className="text-gold" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h3 className="font-black uppercase text-sm mb-2">Phone</h3>
              <p className="text-white text-lg font-bold">(610) 931-3829</p>
              <p className="text-titanium text-xs mt-2">Call or text — 9am-6pm EST</p>
            </div>
            
            <div className="bg-charcoal border border-white/5 rounded-2xl p-8 hover:border-gold/30 transition-all">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gold/20">
                <svg className="text-gold" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 className="font-black uppercase text-sm mb-2">General Inquiries</h3>
              <p className="text-white text-lg font-bold">info@musclecars.ai</p>
              <p className="text-titanium text-xs mt-2">Questions about memberships and services</p>
            </div>
            
            <div className="bg-charcoal border border-white/5 rounded-2xl p-8 hover:border-gold/30 transition-all">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gold/20">
                <svg className="text-gold" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="font-black uppercase text-sm mb-2">Support</h3>
              <p className="text-white text-lg font-bold">support@musclecars.ai</p>
              <p className="text-titanium text-xs mt-2">Technical support and account help</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

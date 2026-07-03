import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  createUser, 
  addCar,
  getRemainingListings,
  getListingCap,
  calcTransactionFee,
  type User 
} from "../lib/db";
import { Car, DollarSign, Tag, Info, Gauge, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

const getPageData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    let user: User | null = null;
    if (email) {
      user = await getUser(email);
      if (!user) {
        user = await createUser(email);
      }
    }
    return { user };
  });

const addCarFn = createServerFn({ method: "POST" })
  .validator((data: { ownerId: string, make: string, model: string, year: number, price: number, mileage: number, description: string }) => data)
  .handler(async ({ data }) => {
    return await addCar(data.ownerId, data.make, data.model, data.year, data.price, data.mileage, data.description);
  });

export const Route = createFileRoute("/sell")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getPageData({ data: email }),
  component: SellPage,
});

function SellPage() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/sell' });
  const [carData, setCarData] = useState({
    make: '',
    model: '',
    year: 2024,
    price: 0,
    mileage: 0,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const remaining = user ? getRemainingListings(user) : 0;
  const cap = user ? getListingCap(user.tier) : 0;
  const isUnlimited = cap === Infinity;
  const atCap = user && remaining === 0;
  const fee = carData.price > 0 && user ? calcTransactionFee(carData.price, user.tier) : null;

  if (!user) {
    return (
      <div className="bg-charcoal min-h-screen text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-black uppercase mb-8">Authentication Required</h1>
          <p className="text-titanium mb-12">Please sign in to list your vehicle for sale.</p>
          <button 
            onClick={() => navigate({ to: '/', search: { email: 'tester@musclecars.ai' } })}
            className="bg-racing-red px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-racing-red-light transition-all"
          >
            Sign In as Tester
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (atCap) {
      setError(`You've reached your listing cap. Your ${user.tier} tier allows ${isUnlimited ? 'unlimited' : cap} listings. Please upgrade to list more.`);
      return;
    }

    setIsSubmitting(true);
    const result = await addCarFn({ data: { ...carData, ownerId: user.id } });
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    
    alert("Vehicle listed successfully! Referral rewards applied if applicable.");
    navigate({ to: '/', search: (prev) => prev });
  };

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      
      <div className="bg-racing-red text-white py-2 text-center text-xs font-black uppercase tracking-[0.2em] flex justify-center gap-8 border-b border-white/10">
        <span>AUTHENTICATED: {user.email}</span>
        <span className="text-gold">TIER: {user.tier}</span>
        <span>LISTINGS: {user.listing_count || 0}/{isUnlimited ? '∞' : cap}</span>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="flex items-center gap-3 text-racing-red font-black mb-4 tracking-[0.3em] text-xs">
          <div className="w-8 h-[2px] bg-racing-red" />
          MARKETPLACE
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">
          List Your <span className="text-racing-red">Muscle Car</span>
        </h1>

        {/* Listing Cap & Fee Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-dark-steel rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 text-titanium/70 text-xs font-black uppercase tracking-widest mb-2">
              <Car size={14} />
              LISTING SLOTS
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-white">{user.listing_count || 0}</span>
              <span className="text-titanium/50 text-lg font-mono font-black">/ {isUnlimited ? '∞' : cap}</span>
              <span className="text-titanium/50 text-xs font-bold uppercase tracking-wider ml-2">used</span>
            </div>
            {atCap ? (
              <div className="mt-3 flex items-center gap-2 text-racing-red text-xs font-black uppercase tracking-widest">
                <AlertTriangle size={14} />
                CAP REACHED
              </div>
            ) : (
              <div className="mt-3 text-emerald text-xs font-black uppercase tracking-widest">
                {remaining === Infinity ? 'Unlimited listings' : `${remaining} remaining`}
              </div>
            )}
          </div>
          <div className="bg-dark-steel rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 text-titanium/70 text-xs font-black uppercase tracking-widest mb-2">
              <TrendingUp size={14} />
              TRANSACTION FEE
            </div>
            {user.tier === 'starter' ? (
              <div>
                <div className="text-2xl font-black text-racing-red">Up to 7.5%</div>
                <div className="text-titanium/50 text-[10px] font-bold uppercase tracking-wider mt-1">
                  Non-subscriber rate. <span className="text-gold">Upgrade to 0%!</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-black text-emerald">0%</div>
                <div className="text-titanium/50 text-[10px] font-bold uppercase tracking-wider mt-1">
                  Subscriber benefit — no transaction fees
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-racing-red/10 border border-racing-red/30 rounded-2xl p-6 mb-8 flex items-center gap-4">
            <AlertTriangle className="text-racing-red flex-shrink-0" size={24} />
            <div>
              <p className="text-white font-bold text-sm">{error}</p>
              {error.includes('cap') && (
                <button
                  onClick={() => navigate({ to: '/', search: (prev) => prev, hash: 'pricing' })}
                  className="text-gold text-xs font-black uppercase tracking-widest mt-2 hover:underline"
                >
                  View Pricing Plans →
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-dark-steel p-10 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Make</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={18} />
                <input 
                  required
                  type="text" 
                  value={carData.make}
                  onChange={(e) => setCarData({...carData, make: e.target.value})}
                  placeholder="e.g. Chevrolet"
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Model</label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={18} />
                <input 
                  required
                  type="text" 
                  value={carData.model}
                  onChange={(e) => setCarData({...carData, model: e.target.value})}
                  placeholder="e.g. Camaro SS"
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Year</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={18} />
                <input 
                  required
                  type="number" 
                  value={carData.year}
                  onChange={(e) => setCarData({...carData, year: parseInt(e.target.value)})}
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={18} />
                <input 
                  required
                  type="number" 
                  value={carData.price}
                  onChange={(e) => setCarData({...carData, price: parseInt(e.target.value)})}
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Mileage</label>
            <div className="relative">
              <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={18} />
              <input 
                required
                type="number" 
                value={carData.mileage}
                onChange={(e) => setCarData({...carData, mileage: parseInt(e.target.value)})}
                className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Description</label>
            <div className="relative">
              <Info className="absolute left-4 top-6 text-titanium/50" size={18} />
              <textarea 
                required
                rows={4}
                value={carData.description}
                onChange={(e) => setCarData({...carData, description: e.target.value})}
                placeholder="Tell us about the condition, upgrades, and history..."
                className="w-full bg-charcoal border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all resize-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-racing-red hover:bg-racing-red-light py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-racing-red/20 disabled:opacity-50"
          >
            {isSubmitting ? 'LISTING VEHICLE...' : 'LIST VEHICLE FOR SALE'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

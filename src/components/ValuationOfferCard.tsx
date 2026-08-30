import { TrendingUp } from "lucide-react";

// Compact $7.49 valuation offer card used in the /blog and /articles sidebars.
// It links to the homepage #instant-valuation section so the visitor lands on
// the A/B-tracked primary CTA (the conversion is measured there).
export function ValuationOfferCard() {
  return (
    <a
      href="/#instant-valuation"
      className="block group bg-gradient-to-br from-charcoal to-dark-steel border border-gold/30 rounded-2xl p-6 shadow-xl hover:border-gold/60 hover:shadow-gold/10 transition-all overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-gold" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gold">
          Instant AI Valuation
        </span>
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight italic leading-tight mb-2">
        Know what it's worth <span className="text-gold">before you bid.</span>
      </h3>
      <p className="text-sm text-titanium leading-snug mb-4">
        Professional-grade market value for any muscle car in ~60 seconds — no account needed.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center bg-gold text-charcoal px-4 py-2 rounded font-black text-sm uppercase group-hover:bg-yellow-400 transition-colors">
          Get Valuation — $7.49
        </span>
        <span className="text-xs text-white/50 line-through">$9.99</span>
      </div>
      <p className="text-[10px] text-titanium/60 italic mt-3">
        25% off launch pricing for the first 3 months — no coupon needed.
      </p>
    </a>
  );
}

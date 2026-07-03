import React from 'react';
import { Check, Lock } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Dip your toes into the muscle car world.',
    features: [
      { text: '1 Active Listing', included: true },
      { text: '3 High-Res Car Guides', included: true },
      { text: '3 Market Valuations', included: true },
      { text: 'Browse Marketplace', included: true },
      { text: 'Portfolio Management', included: false },
      { text: 'Sell Vehicles', included: true },
      { text: '4.5%–7.5% Transaction Fee', included: true, warn: true },
    ],
    button: 'Get Started',
    highlight: false
  },
  {
    name: 'Enthusiast',
    price: '$29',
    description: 'For the serious owner and collector.',
    features: [
      { text: '5 Active Listings', included: true },
      { text: '0% Transaction Fees', included: true, accent: true },
      { text: 'Up to 5 Active Listings', included: true },
      { text: 'Unlimited Portfolio Access', included: true },
      { text: '5 Valuations per Month', included: true },
      { text: 'Verified Seller Badge', included: true },
      { text: 'Standard Support', included: true },
    ],
    button: 'Go Enthusiast',
    highlight: true
  },
  {
    name: 'Entrepreneur',
    price: '$79',
    description: 'Maximize your ROI on every flip.',
    features: [
      { text: '25 Active Listings', included: true },
      { text: '0% Transaction Fees', included: true, accent: true },
      { text: 'Unlimited Listings', included: true },
      { text: 'Real-time Valuation Engine', included: true },
      { text: 'Appointment Scheduling', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Priority Support', included: true },
    ],
    button: 'Go Entrepreneur',
    highlight: false
  },
  {
    name: 'Professional',
    price: '$249',
    description: 'For dealerships and high-volume collectors.',
    features: [
      { text: 'Unlimited Listings', included: true },
      { text: '0% Transaction Fees', included: true, accent: true },
      { text: 'High-Volume Inventory', included: true },
      { text: 'Lead CRM', included: true },
      { text: 'API Access', included: true },
      { text: '2 Negotiator Services/mo', included: true },
      { text: 'Priority Support', included: true },
    ],
    button: 'Go Professional',
    highlight: false
  }
];

interface PricingProps {
  onUpgrade?: (tier: string, price: string) => void;
}

export const Pricing = ({ onUpgrade }: PricingProps) => {
  return (
    <section className="py-24 bg-black text-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">CHOOSE YOUR <span className="text-red-600">MONSTER</span></h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">From free insights to professional dealership tools.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`p-8 rounded-3xl flex flex-col relative ${
                tier.highlight 
                  ? 'bg-red-600 border-2 border-red-500 scale-105 z-10' 
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black">{tier.price}</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <p className={`mb-8 ${tier.highlight ? 'text-red-100' : 'text-zinc-400'}`}>
                {tier.description}
              </p>
              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    {(feature as any).accent ? (
                      <Check size={20} className="text-emerald" />
                    ) : (feature as any).warn ? (
                      <Check size={20} className="text-racing-red" />
                    ) : feature.included ? (
                      <Check size={20} className={tier.highlight ? 'text-white' : 'text-red-600'} />
                    ) : (
                      <Lock size={18} className="text-zinc-600" />
                    )}
                    <span className={`text-sm font-medium ${(feature as any).accent ? 'text-emerald' : (feature as any).warn ? 'text-racing-red' : !feature.included && 'text-zinc-600'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onUpgrade?.(tier.name, tier.price)}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                tier.highlight 
                  ? 'bg-white text-red-600 hover:bg-gray-100 shadow-xl' 
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}>
                {tier.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

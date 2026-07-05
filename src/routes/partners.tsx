import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getUser, createUser, createOrder, type User } from "../lib/db";
import { ShieldCheck, Star, Zap, Truck, Wrench, Camera, BadgeCheck, ArrowRight } from "lucide-react";

const getData = createServerFn({ method: "GET" }).validator((e: string | undefined) => e).handler(async ({ data: email }) => {
  if (!email) return { user: null };
  let user = await getUser(email);
  if (!user) user = await createUser(email);
  return { user };
});

const partnerFn = createServerFn({ method: "POST" }).validator((d: { userId: string, email: string, tier: string, planName: string, cents: number }) => d).handler(async ({ data }) => {
  await createOrder(data.userId, 'partner', data.planName, data.cents, `Tier: ${data.tier}, Email: ${data.email}`);
  const links: Record<string, string> = {
    'verified': 'https://buy.stripe.com/test_partner_verified',
    'premium': 'https://buy.stripe.com/test_partner_premium',
  };
  return { success: true, stripeUrl: links[data.tier] || links['verified'] };
});

export const Route = createFileRoute("/partners")({
  validateSearch: (s: Record<string, unknown>) => ({ email: (s.email as string) || undefined }),
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getData({ data: email }),
  head: () => ({
    meta: [
      { title: "Verified Partner Program — MuscleCars.ai" },
      { name: "description", content: "Join the MuscleCars.ai Verified Partner Program." },
    ],
  }),
  component: PartnersPage,
});

const PLANS = [
  { id: 'verified', name: 'Verified Partner', price: '$99/mo', cents: 9900, tag: 'POPULAR', color: 'border-gold', features: ['Verified Partner Badge on Profile', 'Listed in Partner Directory', 'Featured in Relevant Listings', 'Priority Email Support'] },
  { id: 'premium', name: 'Premium Partner', price: '$249/mo', cents: 24900, tag: 'BEST VALUE', color: 'border-racing-red', features: ['Everything in Verified', 'Priority Directory Placement', 'Social Media Shoutout', 'Promoted in Newsletter', 'Dedicated Account Manager'] },
];

function PartnersPage() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/partners' });
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSignup = async (plan: typeof PLANS[0]) => {
    if (!user) { navigate({ to: '/', search: { email: undefined } }); return; }
    setProcessing(plan.id);
    try {
      const res = await partnerFn({ data: { userId: user.id, email: user.email, tier: plan.id, planName: plan.name, cents: plan.cents } });
      if (res.stripeUrl) window.location.href = res.stripeUrl;
    } catch { alert("Signup failed. Try again."); }
    finally { setProcessing(null); }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <BadgeCheck className="text-gold mx-auto mb-4" size={48} />
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic mb-6">Verified Partner <span className="text-gold">Program</span></h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto">Get listed as a trusted provider on the premier muscle car platform. Parts suppliers, restoration shops, insurers, transporters, and detailers.</p>
        </div>
      </div>
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-dark-steel rounded-3xl overflow-hidden border-t-4 ${plan.color} shadow-2xl relative`}>
              {plan.tag && <div className="absolute top-6 right-6 bg-gold text-charcoal px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{plan.tag}</div>}
              <div className="p-10">
                <h3 className="text-3xl font-black uppercase italic mb-2">{plan.name}</h3>
                <div className="text-5xl font-mono font-black text-gold mb-8">{plan.price}</div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-titanium text-sm"><ShieldCheck size={16} className="text-gold shrink-0" />{f}</li>
                  ))}
                </ul>
                <button onClick={() => handleSignup(plan)} disabled={processing === plan.id} className="w-full bg-gold text-charcoal py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {processing === plan.id ? '...' : <>Get Started <ArrowRight size={18} /></>}
                </button>
                <p className="text-titanium/50 text-[10px] text-center mt-4 uppercase tracking-widest">Owner will review and approve your listing</p>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto mt-20 bg-charcoal border border-white/5 rounded-3xl p-10">
          <h3 className="text-2xl font-black uppercase italic mb-6 text-center">Who Should Apply</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ icon: <Wrench size={24} />, title: 'Restoration Shops', desc: 'Showcase your concours-level builds to serious collectors.' },
              { icon: <Truck size={24} />, title: 'Transport & Logistics', desc: 'Enclosed transport for high-value muscle cars.' },
              { icon: <Camera size={24} />, title: 'Inspectors & Detailers', desc: 'Certified inspection and concours detailing services.' }]
              .map((c, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20 text-gold">{c.icon}</div>
                <h4 className="font-black uppercase text-sm mb-2">{c.title}</h4>
                <p className="text-titanium text-xs">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

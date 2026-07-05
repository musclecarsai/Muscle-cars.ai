import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getUser, createUser, createOrder } from "../lib/db";
import { ShoppingBag, Shirt, Tag, Image, Star } from "lucide-react";

const ITEMS = [
  { id: "t-shirt", title: "MuscleCars.ai T-Shirt", price: "$29.99", cents: 2999, desc: "Premium cotton tee with embroidered logo. Available in black and charcoal.", img: "/src/assets/ebook-covers/guide-american-icons.png", icon: "shirt" },
  { id: "tag", title: "Embroidered Logo Hat", price: "$24.99", cents: 2499, desc: "Classic dad-hat style with embroidered MuscleCars.ai logo.", img: "/src/assets/ebook-covers/guide-engine-mastery.png", icon: "tag" },
  { id: "hoodie", title: "MuscleCars.ai Hoodie", price: "$54.99", cents: 5499, desc: "Heavyweight fleece hoodie. Raglan sleeves, kangaroo pocket, embroidered chest logo.", img: "/src/assets/ebook-covers/guide-performance-tuning.png", icon: "bag" },
  { id: "decals", title: "Decal / Sticker Pack", price: "$9.99", cents: 999, desc: "Set of 3 premium vinyl decals. Weatherproof for garage, toolbox, or bumper.", img: "/src/assets/ebook-covers/guide-market-trends.png", icon: "image" },
  { id: "banners", title: "Event / Partner Banner", price: "$49.99", cents: 4999, desc: "Full-color 3ft x 6ft vinyl banner. Perfect for car meets and showrooms.", img: "/src/assets/ebook-covers/guide-investment-grade.png", icon: "star" },
];

const getData = createServerFn({ method: "GET" })
  .validator((e: string | undefined) => e)
  .handler(async ({ data: email }) => {
    if (!email) return { user: null };
    let user = await getUser(email);
    if (!user) user = await createUser(email);
    return { user };
  });

const purchaseFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string, email: string, itemName: string, itemId: string, cents: number }) => d)
  .handler(async ({ data }) => {
    await createOrder(data.userId, 'merch', data.itemName, data.cents, "Item: " + data.itemId + ", Email: " + data.email);
    const links: Record<string, string> = { 't-shirt': 'https://buy.stripe.com/bJe4gz0al2Bad0ZflQ1Nu0o', 'tag': 'https://buy.stripe.com/8x29AT7CNfnWd0Z5Lg1Nu0p', 'hoodie': 'https://buy.stripe.com/cNi6oH0al7VuaSR2z41Nu0r', 'decals': 'https://buy.stripe.com/14fAfZh2it1x64utgpU1Nu0s', 'banners': 'https://buy.stripe.com/cNicN58GRa3Cd0Z3D81Nu0q' };
    return { success: true, stripeUrl: links[data.itemId] || links['t-shirt'] };
  });

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>) => ({ email: (s.email as string) || undefined }),
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getData({ data: email }),
  component: ShopPage,
});

function ShopPage() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/shop' });
  const [processing, setProcessing] = useState<string | null>(null);

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'shirt': return <Shirt size={24} />;
      case 'tag': return <Tag size={24} />;
      case 'bag': return <ShoppingBag size={24} />;
      case 'image': return <Image size={24} />;
      default: return <Star size={24} />;
    }
  };

  const handleBuy = async (item: { id: string; title: string; cents: number }) => {
    if (!user) { navigate({ to: '/', search: { email: undefined } }); return; }
    setProcessing(item.id);
    try {
      const result = await purchaseFn({ data: { userId: user.id, email: user.email, itemName: item.title, itemId: item.id, cents: item.cents } });
      if (result.stripeUrl) window.location.href = result.stripeUrl;
    } catch { alert("Purchase failed. Try again."); }
    finally { setProcessing(null); }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20"><ShoppingBag size={12} /> OFFICIAL MERCH</div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic mb-6">Merchandise <span className="text-gold">Store</span></h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto">Rep the brand at your next car meet. Premium gear for the serious collector.</p>
        </div>
      </div>
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-dark-steel rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all group">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-charcoal to-dark-steel">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-steel to-transparent" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center border border-white/10 text-gold">{renderIcon(item.icon)}</div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                </div>
                <p className="text-titanium text-sm leading-relaxed mb-6 h-12">{item.desc}</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-mono font-black text-gold">{item.price}</span>
                  <button onClick={() => handleBuy(item)} disabled={processing === item.id} className="bg-gold text-charcoal px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all disabled:opacity-50">
                    {processing === item.id ? '...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

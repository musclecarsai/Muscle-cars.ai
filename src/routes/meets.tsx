import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  createUser, 
  getMeets, 
  createMeet, 
  featureMeet,
  type Meet, 
  type User 
} from "../lib/db";
import { Calendar, MapPin, Users, Star, Plus, ShieldCheck, Zap } from "lucide-react";

const getPageData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    const meets = await getMeets();
    let user: User | null = null;
    if (email) {
      user = await getUser(email);
      if (!user) {
        user = await createUser(email);
      }
    }
    return { meets, user };
  });

const createMeetFn = createServerFn({ method: "POST" })
  .validator((data: { organizerId: string, title: string, description: string, location: string, date: string }) => data)
  .handler(async ({ data }) => {
    await createMeet(data.organizerId, data.title, data.description, data.location, data.date);
    return { success: true };
  });

const featureMeetFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, meetId: string }) => data)
  .handler(async ({ data }) => {
    await featureMeet(data.userId, data.meetId);
    return { success: true };
  });

export const Route = createFileRoute("/meets")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getPageData({ data: email }),
  component: MeetsPage,
});

function MeetsPage() {
  const { meets, user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/meets' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeet, setNewMeet] = useState({ title: '', description: '', location: '', date: '' });

  const isEntrepreneur = user && (user.tier === 'entrepreneur' || user.tier === 'dealership');

  const handleCreateMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isEntrepreneur) {
      alert("Only Entrepreneur and Dealership tiers can organize meets. Please upgrade your plan.");
      return;
    }
    await createMeetFn({ data: { ...newMeet, organizerId: user.id } });
    setShowCreateModal(false);
    setNewMeet({ title: '', description: '', location: '', date: '' });
    navigate({ search: (prev) => prev });
  };

  const handleFeature = async (meetId: string) => {
    if (!user) return;
    const confirmed = confirm("Promote this meet to 'Featured' status for $49.00?");
    if (confirmed) {
      await featureMeetFn({ data: { userId: user.id, meetId } });
      alert("Meet promoted successfully!");
      navigate({ search: (prev) => prev });
    }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      
      {user && (
        <div className="bg-racing-red text-white py-2 text-center text-xs font-black uppercase tracking-[0.2em] flex justify-center gap-8 border-b border-white/10">
          <span>AUTHENTICATED: {user.email}</span>
          <span className="text-gold">TIER: {user.tier}</span>
          <span>ORGANIZER ACCESS: {isEntrepreneur ? 'ENABLED' : 'LOCKED'}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-carbon-fiber py-16 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-3 text-gold font-black mb-4 tracking-[0.3em] text-xs">
                <div className="w-8 h-[2px] bg-gold" />
                COMMUNITY HUB
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic mb-4">
                Local <span className="text-racing-red">Meet-ups</span>
              </h1>
              <p className="text-titanium text-lg max-w-xl">
                Connect with local collectors, show off your ride, and organize your own exclusive events.
              </p>
            </div>
            
            {isEntrepreneur ? (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-3 bg-racing-red hover:bg-racing-red-light px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-racing-red/20 group"
              >
                <Plus className="group-hover:rotate-90 transition-transform" />
                Organize a Meet
              </button>
            ) : (
              <div className="bg-dark-steel border border-gold/30 p-6 rounded-2xl flex flex-col items-center text-center max-w-[300px] shadow-2xl">
                <ShieldCheck className="text-gold mb-3" size={32} />
                <div className="text-gold font-black uppercase text-xs tracking-widest mb-2">Organizer Access</div>
                <p className="text-titanium text-xs mb-4">Upgrade to Entrepreneur tier to host and promote your own car meets.</p>
                <button 
                  onClick={() => navigate({ to: '/', hash: 'pricing', search: (prev) => prev })}
                  className="w-full py-2 border border-gold text-gold rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Meets List */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              Upcoming Events
              <span className="bg-racing-red/10 text-racing-red px-3 py-1 rounded text-xs font-mono">{meets.length}</span>
            </h2>

            {meets.length === 0 ? (
              <div className="bg-dark-steel/50 border border-white/5 rounded-3xl p-12 text-center">
                <Users className="text-titanium/20 mx-auto mb-4" size={64} />
                <p className="text-titanium italic">No upcoming meets scheduled in your area yet. Be the first to start one!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {meets.map((meet) => (
                  <div 
                    key={meet.id} 
                    className={`relative bg-dark-steel rounded-3xl border transition-all overflow-hidden group ${meet.is_featured ? 'border-gold shadow-[0_0_30px_rgba(201,168,76,0.15)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    {meet.is_featured === 1 && (
                      <div className="absolute top-0 right-0 bg-gold text-charcoal px-4 py-1 rounded-bl-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Star size={12} fill="currentColor" />
                        Featured Event
                      </div>
                    )}

                    <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-racing-red text-xs font-bold uppercase tracking-widest mb-3">
                          <Calendar size={14} />
                          {new Date(meet.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} @ {new Date(meet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-racing-red transition-colors">{meet.title}</h3>
                        <p className="text-titanium mb-6 line-clamp-2">{meet.description}</p>
                        
                        <div className="flex flex-wrap gap-6 text-sm font-bold text-white/80">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-racing-red" />
                            {meet.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-gold" />
                            By {meet.organizer_email}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">
                          View Details
                        </button>
                        {user && user.id === meet.organizer_id && meet.is_featured === 0 && (
                          <button 
                            onClick={() => handleFeature(meet.id)}
                            className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                          >
                            <Zap size={12} fill="currentColor" />
                            Feature — $49
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-racing-red/5 border border-racing-red/20 rounded-3xl p-8">
              <h4 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-racing-red" />
                Meet-up Rules
              </h4>
              <ul className="space-y-4 text-sm text-titanium">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-racing-red rounded-full mt-1.5 shrink-0" />
                  <span>Respect the venue and local noise ordinances. No excessive revving.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-racing-red rounded-full mt-1.5 shrink-0" />
                  <span>No burnouts, drifting, or reckless driving on site. Safety first.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-racing-red rounded-full mt-1.5 shrink-0" />
                  <span>Keep it clean — disposal of trash in designated bins is mandatory.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-3xl p-8 relative overflow-hidden group">
              <Star className="absolute -top-4 -right-4 text-gold/10 group-hover:scale-150 transition-transform duration-700" size={120} />
              <div className="relative z-10">
                <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-gold italic">Pro Tip</h4>
                <p className="text-titanium text-sm leading-relaxed">
                  Featured events get <span className="text-white font-bold">5x more RSVPs</span> and appear at the top of the search results for everyone in the area. Invest $49 to sell out your event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-dark-steel border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-8">Organize <span className="text-racing-red">New Meet</span></h2>
            
            <form onSubmit={handleCreateMeet} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Event Title</label>
                <input 
                  required
                  type="text" 
                  value={newMeet.title}
                  onChange={(e) => setNewMeet({...newMeet, title: e.target.value})}
                  placeholder="e.g. Saturday Morning Pistons & Coffee"
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all placeholder:text-titanium/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Date & Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={newMeet.date}
                    onChange={(e) => setNewMeet({...newMeet, date: e.target.value})}
                    className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all color-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Location</label>
                  <input 
                    required
                    type="text" 
                    value={newMeet.location}
                    onChange={(e) => setNewMeet({...newMeet, location: e.target.value})}
                    placeholder="City, State or Venue Name"
                    className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all placeholder:text-titanium/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-titanium ml-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newMeet.description}
                  onChange={(e) => setNewMeet({...newMeet, description: e.target.value})}
                  placeholder="What should people bring? Special highlights? (Max 200 chars)"
                  maxLength={200}
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all resize-none placeholder:text-titanium/30"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-racing-red hover:bg-racing-red-light py-4 px-12 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-racing-red/20"
                >
                  Launch Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Sponsorship Packages */}
      <section className="py-24 bg-gradient-to-b from-charcoal to-dark-steel">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
              EVENT SPONSORSHIP
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
              Sponsor Your <span className="text-gold">Meet-up</span>
            </h2>
            <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
              Let us handle the logistics. We promote, sponsor, and equip your event with premium materials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Sponsored Meet-up', price: '$499', cents: 49900, time: '2+ weeks advance', features: ['Major advertising campaigns', 'Email & social promotion', 'Location coordination', 'Banners & promo materials mailed'], color: 'border-gold' },
              { name: 'Sponsored + Merch', price: '$749', cents: 74900, time: '2+ weeks advance', features: ['Everything in Sponsored', 'Custom MuscleCars.ai merch', 'T-shirts & hats for event', 'Decals for attendees'], color: 'border-racing-red' },
              { name: 'Premium VIP Experience', price: '$2,499', cents: 249900, time: '4+ weeks advance', features: ['Everything in +Merch', 'Team member hosts event', 'Livestream on social media', 'Pro photography & video', 'Concierge planning'], color: 'border-gold' },
            ].map((pkg, i) => (
              <div key={i} className={"bg-dark-steel rounded-3xl overflow-hidden border-t-4 " + pkg.color + " shadow-2xl relative group"}>
                <div className="p-8">
                  <h3 className="text-2xl font-black uppercase italic mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-mono font-black text-gold mb-2">{pkg.price}</div>
                  <div className="text-titanium/60 text-[10px] font-bold uppercase tracking-widest mb-6">Requires {pkg.time}</div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-titanium text-xs"><div className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <button onClick={async () => {
                    if (!user) return;
                    if (!confirm("Confirm sponsorship: " + pkg.name + " for " + pkg.price + "?")) return;
                    const sponsorLinks: Record<string, string> = { 'Sponsored Meet-up': 'https://buy.stripe.com/28E5kDcX70t23qpehM1Nu0v', 'Sponsored + Merch': 'https://buy.stripe.com/dRm28r7CNcbK7GFgpU1Nu0w', 'Premium VIP Experience': 'https://buy.stripe.com/00wdR9e1b2Ba4utehM1Nu0x' };
                      const sl = sponsorLinks[pkg.name];
                      if (sl) { window.open(sl, '_blank'); }
                      await fetch("/api/order", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId: user.id, email: user.email, type: "sponsorship", itemName: pkg.name, amountCents: pkg.cents, details: "Meet sponsorship: " + pkg.name}) });
                    alert("Sponsorship request submitted! We will contact you within 24 hours.");
                  }} className="w-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-charcoal transition-all py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

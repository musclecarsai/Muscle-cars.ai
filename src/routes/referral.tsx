import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  createUser, 
  getReferrals, 
  createReferral, 
  generateReferralCode,
  type Referral, 
  type User 
} from "../lib/db";
import { Fuel, Copy, Check, Users, Gem, Rocket, Shield, ClipboardCheck, ArrowRight, Share2 } from "lucide-react";

const getPageData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    let user: User | null = null;
    let referrals: Referral[] = [];
    
    if (email) {
      user = await getUser(email);
      if (!user) {
        user = await createUser(email);
      }
      
      if (!user.referral_code) {
        user.referral_code = await generateReferralCode(user.id, user.email);
      }
      
      referrals = await getReferrals(user.id);
    }
    
    return { user, referrals };
  });

const inviteFriendFn = createServerFn({ method: "POST" })
  .validator((data: { referrerId: string, email: string }) => data)
  .handler(async ({ data }) => {
    await createReferral(data.referrerId, data.email);
    return { success: true };
  });

export const Route = createFileRoute("/referral")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getPageData({ data: email }),
  head: () => ({
    meta: [
      { title: "Referral Program — MuscleCars.ai" },
      { name: "description", content: "Earn rewards by referring collectors." },
    ],
  }),
  component: ReferralDashboard,
});

function ReferralDashboard() {
  const { user, referrals } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/referral' });
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  if (!user) {
    return (
      <div className="bg-charcoal min-h-screen text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-black uppercase mb-8">Authentication Required</h1>
          <p className="text-titanium mb-12">Please sign in to access your referral dashboard.</p>
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

  const referralLink = `${window.location.origin}/?ref=${user.referral_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    await inviteFriendFn({ data: { referrerId: user.id, email: inviteEmail } });
    setIsInviting(false);
    setInviteEmail("");
    alert(`Invitation sent to ${inviteEmail}!`);
    navigate({ search: (prev) => prev });
  };

  const stats = {
    total: referrals.length,
    earned: referrals.filter(r => r.status === 'completed').length,
    pending: referrals.filter(r => r.status === 'pending').length
  };

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      
      <div className="bg-racing-red text-white py-2 text-center text-xs font-black uppercase tracking-[0.2em] flex justify-center gap-8 border-b border-white/10">
        <span>AUTHENTICATED: {user.email}</span>
        <span className="text-gold">TIER: {user.tier}</span>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 text-gold font-black mb-4 tracking-[0.3em] text-xs">
              <div className="w-8 h-[2px] bg-gold" />
              REFERRAL PROGRAM
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              Fuel For <span className="text-racing-red">Friends</span>
            </h1>
          </div>
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20 animate-pulse">
            <Fuel className="text-gold" size={40} />
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="bg-dark-steel border border-white/10 rounded-[2rem] p-10 mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-gold/10 transition-colors duration-700" />
          
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-titanium mb-6">Your Unique Referral Link</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-charcoal border border-gold/30 rounded-xl py-4 px-6 font-mono text-sm text-gold break-all flex items-center">
              {referralLink}
            </div>
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${copied ? 'bg-emerald text-white' : 'bg-racing-red hover:bg-racing-red-light text-white shadow-racing-red/20'}`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  COPIED!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  COPY LINK
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Referrals', value: stats.total, color: 'text-gold', border: 'border-gold/20' },
            { label: 'Earned', value: stats.earned, color: 'text-emerald', border: 'border-emerald/20' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-glow', border: 'border-amber-glow/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-dark-steel border ${stat.border} rounded-2xl p-8 text-center card-hover`}>
              <div className={`text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-titanium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* History & Invite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* History */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              Referral History
              <span className="bg-white/5 text-titanium px-3 py-1 rounded text-xs font-mono">{referrals.length}</span>
            </h3>
            
            {referrals.length === 0 ? (
              <div className="bg-dark-steel/50 border border-white/5 rounded-3xl p-12 text-center">
                <Users className="text-titanium/10 mx-auto mb-4" size={64} />
                <p className="text-titanium italic">No referrals yet. Share your link to start earning rewards!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref.id} className="bg-dark-steel border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-charcoal rounded-full flex items-center justify-center border border-white/10 font-black text-gold uppercase">
                        {ref.referred_email[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white mb-1">{ref.referred_email}</div>
                        <div className="text-[10px] text-titanium uppercase tracking-widest">{new Date(ref.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ref.status === 'completed' ? 'bg-emerald/10 border-emerald/30 text-emerald' : 'bg-amber-glow/10 border-amber-glow/30 text-amber-glow'}`}>
                        {ref.status}
                      </div>
                      {ref.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-gold">
                          {ref.reward_type === 'valuation' ? <Gem size={16} /> : <Rocket size={16} />}
                          <span className="text-[10px] font-black uppercase">{ref.reward_type === 'valuation' ? 'FREE VALUATION' : 'LISTING BOOST'}</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-glow/30 border-t-amber-glow animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Form */}
          <div className="space-y-8">
            <div className="bg-racing-red/5 border border-racing-red/20 rounded-3xl p-8">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <Share2 className="text-racing-red" size={20} />
                Invite Friend
              </h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Friend's Email Address"
                  required
                  className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-racing-red outline-none transition-all placeholder:text-titanium/30"
                />
                <button 
                  type="submit"
                  disabled={isInviting}
                  className="w-full bg-racing-red hover:bg-racing-red-light py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-racing-red/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isInviting ? 'SENDING...' : (
                    <>
                      SEND INVITE
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-3xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gold mb-4">How it works</h4>
                <div className="space-y-6">
                  {[
                    { icon: <Copy size={16} />, text: "Share your unique link with fellow collectors." },
                    { icon: <Users size={16} />, text: "They sign up and list their first muscle car." },
                    { icon: <Gem size={16} />, text: "You both get a Free Valuation credit!" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-8 h-8 bg-charcoal border border-gold/30 rounded-lg flex items-center justify-center shrink-0 text-gold">
                        {step.icon}
                      </div>
                      <p className="text-xs text-titanium leading-relaxed">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

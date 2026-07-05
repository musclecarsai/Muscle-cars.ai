import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Mail, FileText, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/outreach-templates")({
  component: OutreachTemplates,
});

const TEMPLATES = [
  {
    title: "Universal Outreach — Works for Anyone",
    bestFor: "Email, LinkedIn DM, Facebook, Forums — your go-to",
    body: `Hey [Name],

I'm Colin Dorman — owner of MuscleCars.ai, a marketplace and community for serious muscle car collectors.

I'm reaching out because I think there's a great opportunity for us to work together.

👉 Go-to link: https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners

Let me know what you think — happy to hop on a call.

Colin Dorman
Owner/Operator, MuscleCars.ai
colin@musclecars.ai | (610) 931-3829`
  },
  {
    title: "Restoration Shops & Builders",
    bestFor: "LinkedIn DM, Email",
    body: `Hey [Name],

I'm Colin — owner of MuscleCars.ai. We're building a verified directory of the best restoration shops and parts suppliers for serious muscle car collectors.

Your work at [Shop Name] fits exactly what we're looking for. I'd love to feature your shop as a Verified Partner — free to list, and you'd get in front of collectors actively looking for restoration work.

Here's the partner page: https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners

Want me to set you up? Takes 2 minutes.

Colin Dorman
colin@musclecars.ai | (610) 931-3829`
  },
  {
    title: "Parts Suppliers (Premium Tier)",
    bestFor: "Email, LinkedIn",
    body: `Hi [Name],

I run MuscleCars.ai — a marketplace for serious muscle car collectors. We're launching a Verified Partner directory and want to include [Company Name] as a featured supplier.

Our Premium Partner tier ($249/mo) gets you:
• Priority placement in the Partner Directory
• Featured in our newsletter (going to 1,000+ active collectors)
• Social media shoutout on our channels
• Listed alongside every relevant car listing

We already have serious buyers browsing our marketplace daily. Let me know if you'd like to see the details.

https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners

Colin Dorman
Owner/Operator, MuscleCars.ai
colin@musclecars.ai | (610) 931-3829`
  },
  {
    title: "Car Clubs & Meet Organizers (Sponsorships)",
    bestFor: "Facebook groups, forum DMs, email",
    body: `Hey [Name],

I'm Colin from MuscleCars.ai. We help car clubs and event organizers run better meets — and we're looking to sponsor events like yours.

We've got 3 sponsorship packages:

Sponsored ($499) — We run ads for your event, help secure the location, mail you banners & materials. (2 weeks advance)
+ Merch ($749) — Same + custom MuscleCars.ai merch for your event.
VIP Experience ($2,499) — We fly out, livestream, do pro photography, feature you everywhere. (4 weeks advance)

Full details: https://1e492a047379233056524352bb6fcf8b.ctonew.app/meets

Want to chat about what works best for your event?

Colin Dorman
colin@musclecars.ai | (610) 931-3829`
  },
  {
    title: "Transport Companies",
    bestFor: "LinkedIn, Email",
    body: `Hi [Name],

I'm building a partner network of trusted enclosed transporters for our muscle car marketplace. When a collector buys a $100k+ classic, they need someone they can trust to move it.

I'd like to add [Company Name] to our directory as a Verified Partner ($99/mo). No long-term commitment.

https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners

Want in?

Colin Dorman
colin@musclecars.ai | (610) 931-3829`
  },
  {
    title: "Short LinkedIn DM",
    bestFor: "LinkedIn quick messages",
    body: `Hey [Name] — I'm Colin from MuscleCars.ai. We're putting together a directory of verified muscle car professionals (shops, suppliers, transport). Think your shop would be a good fit?

https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners`
  },
  {
    title: "Facebook Group Post",
    bestFor: "Car club / muscle car groups",
    body: `We're looking for 5 restoration shops and 3 car clubs to feature on MuscleCars.ai's new Partner Directory. Free listing, no commitment. If you run a shop or organize meets, drop a comment or DM me!

https://1e492a047379233056524352bb6fcf8b.ctonew.app/partners`
  }
];

function OutreachTemplates() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyTemplate = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <Mail className="text-gold mx-auto mb-4" size={48} />
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
            Outreach <span className="text-gold">Templates</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto">
            Copy-paste templates for reaching restoration shops, parts suppliers, car clubs, and more. All with your contact info pre-filled.
          </p>
        </div>
      </div>

      <section className="py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          {TEMPLATES.map((tpl, i) => (
            <div key={i} className="bg-dark-steel rounded-3xl overflow-hidden border border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">{tpl.title}</h2>
                  <span className="text-gold text-xs font-bold uppercase tracking-wider">{tpl.bestFor}</span>
                </div>
                <button onClick={() => copyTemplate(i, tpl.body)}
                  className="flex items-center gap-2 bg-gold/10 text-gold border border-gold/30 px-5 py-3 rounded-xl hover:bg-gold hover:text-charcoal transition-all font-black uppercase text-xs tracking-widest">
                  {copiedId === i ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copiedId === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-8">
                <pre className="text-titanium text-sm leading-relaxed whitespace-pre-wrap font-sans">{tpl.body}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
// Blog post data — 13 community posts compiled from
// /home/team/shared/content/forum-facebook-posts.md and forum-facebook-posts-v2.md
export interface BlogPost {
  slug: string;
  title: string;
  channel: string;
  date: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
  excerpt: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "free-meet-tools-for-car-clubs",
    title: "Free Meet Organization Tools for Car Clubs",
    channel: "Facebook · Car Show Enthusiasts",
    date: "Aug 11, 2026",
    body: "We just launched free meet organization tools on MuscleCars.ai — built specifically for car clubs and meet organizers. Create events, share them with your members, and promote them to the local muscle car community. No fees, no commitment.",
    ctaUrl: "/meets",
    ctaLabel: "Start Organizing a Meet",
    excerpt: "Free meet organization tools for car clubs and meet organizers — no fees, no commitment."
  },
  {
    slug: "sponsoring-local-car-shows",
    title: "We're Sponsoring Local Car Shows & Cruise-Ins",
    channel: "Facebook · Classic Car Events & Cruise-Ins",
    date: "Aug 11, 2026",
    body: "Organizing a cruise-in or car show this year? We're sponsoring local meets with banners, promo materials, and even full event support. Packages start at $499. If you run a regular event, DM us and we'll send you the details.",
    ctaUrl: "/meets",
    ctaLabel: "See Sponsorship Packages",
    excerpt: "MuscleCars.ai sponsors local car meets with banners and promo materials — packages from $499."
  },
  {
    slug: "list-your-muscle-car-free",
    title: "List Your Muscle Car Free — 0% Transaction Fees",
    channel: "Facebook · Muscle Car Swap Meet",
    date: "Aug 11, 2026",
    body: "Selling a muscle car? MuscleCars.ai lets you list for free with 0% transaction fees for subscribers. No auction fees, no seller surprises. We've got AI valuations to help you price it right too.",
    ctaUrl: "/",
    ctaLabel: "List Your Car Now",
    excerpt: "Free muscle car listings with 0% transaction fees for subscribers on MuscleCars.ai."
  },
  {
    slug: "pro-touring-free-meet-tools",
    title: "Free Meet Organization Tools for Car Clubs (Pro-Touring)",
    channel: "Forum · Pro-Touring.com",
    date: "Aug 11, 2026",
    body: "Hey everyone — wanted to share something we built that might be useful for local clubs and meet organizers. MuscleCars.ai has a free Car Meet-up Hub where you can organize events, promote them, and even get sponsorship support (banners, promo materials, etc.). We're focused on the muscle car community specifically. Totally free to use for organizers.",
    ctaUrl: "/meets",
    ctaLabel: "Visit the Meet-up Hub",
    excerpt: "Free Car Meet-up Hub for clubs and organizers, focused on the muscle car community."
  },
  {
    slug: "marketplace-for-muscle-car-builders",
    title: "New Marketplace for Muscle Car Builders",
    channel: "Forum · Lateral-G.net",
    date: "Aug 11, 2026",
    body: "We launched MuscleCars.ai — a marketplace for serious muscle cars. Free to list, 0% fees for subscribers, and AI valuations to help price your builds. We're also building a partner directory for restoration shops and parts suppliers.",
    ctaUrl: "/",
    ctaLabel: "Explore the Marketplace",
    excerpt: "Marketplace for serious muscle cars: free listings, 0% fees for subscribers, AI valuations."
  },
  {
    slug: "free-listings-for-chevelle-owners",
    title: "Free Listings for Chevelle Owners",
    channel: "Forum · Chevelles.com",
    date: "Aug 11, 2026",
    body: "Built a marketplace specifically for muscle car collectors. If you're listing a Chevelle (or any muscle car), you can list for free and sell with 0% transaction fees if you're a subscriber. We also have free technical guides (buying guides, restoration guides).",
    ctaUrl: "/",
    ctaLabel: "List Your Chevelle",
    excerpt: "Free Chevelle listings with 0% transaction fees for subscribers plus free technical guides."
  },
  {
    slug: "free-mopar-meet-tools",
    title: "Free Mopar Meet Organization Tools",
    channel: "Forum · ForBBodiesOnly.com",
    date: "Aug 11, 2026",
    body: "If you organize Mopar meets or cruise-ins, MuscleCars.ai has free event tools — create events, promote them, and apply for sponsorship. We're also a marketplace for selling with 0% fees for subscribers.",
    ctaUrl: "/meets",
    ctaLabel: "Organize a Mopar Meet",
    excerpt: "Free event tools for Mopar meets and cruise-ins, plus a 0%-fee marketplace."
  },
  {
    slug: "why-pay-5-percent-buyer-fees",
    title: "Why Pay 5% Buyer's Fees? 0% on MuscleCars.ai",
    channel: "Facebook · Classic Car Buyers & Sellers",
    date: "Aug 12, 2026",
    body: "Tired of paying 5% buyer's fees on auction sites? On a $100K muscle car purchase, that's $5,000 — gone before you even get the keys. MuscleCars.ai charges subscribers 0% transaction fees. We also have VIN verification tools and a professional inspection network so you don't get burned by clones. Worth checking out before your next purchase.",
    ctaUrl: "/",
    ctaLabel: "Browse Cars With 0% Fees",
    excerpt: "0% transaction fees for subscribers vs 5% auction buyer's premiums — save $5K on a $100K car."
  },
  {
    slug: "2026-buyers-guide-now-live",
    title: "2026 Muscle Car Buyer's Guide Is Now Live",
    channel: "Facebook · Muscle Car Market Watch 2026",
    date: "Aug 12, 2026",
    body: "Just published our 2026 Muscle Car Buyer's Guide — what $50K, $100K, and $250K actually gets you in today's market. Fox Body Mustangs are the sleeper pick under $50K. Hemi 'Cudas still dominate the high end. Full breakdown here:",
    ctaUrl: "/articles/2026-muscle-car-buyers-guide",
    ctaLabel: "Read the Buyer's Guide",
    excerpt: "New guide: what $50K, $100K, and $250K gets you in the 2026 muscle car market."
  },
  {
    slug: "verified-partner-program",
    title: "Verified Partner Program for Restoration Shops & Suppliers",
    channel: "Facebook · Restoration Shops & Parts Suppliers",
    date: "Aug 12, 2026",
    body: "We're building a trusted partner directory for the muscle car community — restoration shops, parts suppliers, transport companies, detailers. If you run a business that serves muscle car owners, the Verified Partner badge starts at $99/mo and puts you in front of serious collectors.",
    ctaUrl: "/partners",
    ctaLabel: "Become a Verified Partner",
    excerpt: "Verified Partner badge from $99/mo puts your business in front of serious muscle car collectors."
  },
  {
    slug: "dont-get-burned-by-a-clone",
    title: "Don't Get Burned by a Clone — Free VIN Verification Guide",
    channel: "Forum · TeamCamaro.net",
    date: "Aug 12, 2026",
    body: "Just wanted to share a resource for anyone shopping for a Camaro (or any muscle car) right now. We put together a step-by-step VIN verification guide that walks through checking engine stamps, trim tags, hidden VINs, and the most common clone tells. The clone market has gotten sophisticated — we've seen re-stamped blocks that look convincing until you know what to look for. Guide is free:",
    ctaUrl: "/articles/avoid-buying-clone-vin-verification",
    ctaLabel: "Read the VIN Guide",
    excerpt: "Step-by-step VIN verification guide — spot re-stamped engines, bogus trim tags, and clones."
  },
  {
    slug: "marketplace-with-zero-fees",
    title: "New Marketplace with 0% Fees — Worth Knowing About",
    channel: "Forum · Vintage-Mustang.com",
    date: "Aug 12, 2026",
    body: "For anyone listing a Mustang for sale — there's a new option worth knowing about. MuscleCars.ai is a marketplace built specifically for muscle cars and they charge 0% transaction fees for subscribers. No auction premiums, no BaT-style buyer's fees. They also have AI valuations to help you price correctly. Sharing because I know how much fees eat into these sales.",
    ctaUrl: "/",
    ctaLabel: "Check the Marketplace",
    excerpt: "Mustang marketplace with 0% transaction fees for subscribers and AI valuation tools."
  },
  {
    slug: "drag-street-scene-marketplace",
    title: "Muscle Car Marketplace — Free Listings, 0% Fees for Subscribers",
    channel: "Forum · YellowBullet.com",
    date: "Aug 12, 2026",
    body: "For anyone in the drag/street scene looking to buy or sell — MuscleCars.ai is a new marketplace for muscle cars with 0% transaction fees for subscribers. Free to list. They cover everything from Fox Bodies to Hellcats. Also have a VIN verification tool if you're worried about buying a clone or re-stamped car. Worth a look:",
    ctaUrl: "/",
    ctaLabel: "Visit MuscleCars.ai",
    excerpt: "Marketplace for drag and street scene: free listings, 0% fees, VIN verification tool."
  }
];

export const getBlogPost = (slug: string) =>
  BLOG_POSTS.find((p) => p.slug === slug);

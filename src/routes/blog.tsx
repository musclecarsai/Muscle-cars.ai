import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Newspaper, ChevronRight } from "lucide-react";
import { BLOG_POSTS } from "../lib/blogPosts";
import { ValuationOfferCard } from "../components/ValuationOfferCard";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Community News — MuscleCars.ai" },
      { name: "description", content: "The MuscleCars.ai blog: meet organization tools, event sponsorship opportunities, free 0%-fee listings, marketplace announcements, and buyer protection resources for the muscle car community." },
      { name: "keywords", content: "muscle car blog, car meet tools, muscle car marketplace news, 0% fees, muscle car community" },
      { property: "og:title", content: "Blog & Community News — MuscleCars.ai" },
      { property: "og:description", content: "Meet tools, sponsorships, 0%-fee listings, and buyer protection — latest from the MuscleCars.ai community." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://1e492a047379233056524352bb6fcf8b.ctonew.app/blog" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-8 h-8 text-gold" />
          <h1 className="text-4xl font-black uppercase tracking-tight">Blog & Community News</h1>
        </div>
        <p className="text-white/60 mb-12 max-w-2xl">
          Announcements, resources, and news from the MuscleCars.ai community — free meet tools,
          event sponsorships, marketplace updates, and buyer protection guides.
        </p>

        <ValuationOfferCard />
        <div className="mt-6 space-y-4">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="block group"
            >
              <article className="bg-white/5 border border-white/10 rounded-xl p-6 transition-colors group-hover:border-gold/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">{post.channel}</span>
                  <span className="text-xs text-white/40">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{post.title}</h2>
                <p className="text-white/60 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-racing-red mt-3 group-hover:text-gold transition-colors">
                  Read more <ChevronRight className="w-4 h-4" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

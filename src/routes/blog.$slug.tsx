import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ArrowLeft, Share2, MessageCircle, Link2, Check } from "lucide-react";
import { useState } from "react";
import { getBlogPost, BLOG_POSTS } from "../lib/blogPosts";
import { ValuationOfferCard } from "../components/ValuationOfferCard";

const BASE_URL = "https://1e492a047379233056524352bb6fcf8b.ctonew.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params: { slug } }) => getBlogPost(slug),
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    const title = post ? `${post.title} — MuscleCars.ai Blog` : "Blog Post — MuscleCars.ai";
    const desc = post ? post.excerpt : "MuscleCars.ai community news and resources.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: "muscle cars, muscle car community, car meet, 0% fees, muscle car marketplace" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${BASE_URL}/blog/${params.slug}` },
        { property: "og:site_name", content: "MuscleCars.ai" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const url = `${BASE_URL}/blog/${post?.slug ?? ""}`;

  if (!post) {
    return (
      <div className="bg-charcoal min-h-screen text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-black mb-4">Post not found</h1>
          <Link to="/blog" className="inline-flex items-center gap-2 text-racing-red font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shareText = encodeURIComponent(`${post.title} — via MuscleCars.ai`);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">{post.channel}</span>
          <span className="text-xs text-white/40">{post.date}</span>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight mb-6 leading-tight">{post.title}</h1>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-white/80 leading-relaxed text-lg mb-6">{post.body}</p>
          <a
            href={post.ctaUrl}
            className="inline-block bg-racing-red hover:bg-red-700 transition-colors px-6 py-3 rounded-lg font-bold uppercase tracking-wide"
          >
            {post.ctaLabel}
          </a>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Share this post</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#145dbf] transition-colors px-4 py-2 rounded-lg font-semibold text-sm"
            >
              <Share2 className="w-4 h-4" /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1780bd] transition-colors px-4 py-2 rounded-lg font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" /> X
            </a>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg font-semibold text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        <div className="mt-12">
          <ValuationOfferCard />
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">More from the blog</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4).map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors"
              >
                <span className="text-xs text-gold uppercase tracking-widest font-bold">{p.channel}</span>
                <h3 className="font-bold mt-1 text-sm leading-snug">{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, X, CheckCircle2, Download, ArrowRight } from 'lucide-react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  title?: string;
  description?: string;
  guideTitle?: string;
}

export const EmailCaptureModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Unlock Your Free Guide",
  description = "Join 10,000+ muscle car collectors. Enter your email to receive your technical guide and weekly market updates.",
  guideTitle
}: EmailCaptureModalProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // We call onSuccess which will probably trigger a page refresh with the email in search params
    // to simulate the "login" and then the download.
    setTimeout(() => {
      onSuccess(email);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-dark-steel rounded-[2.5rem] border-2 border-gold/30 shadow-[0_0_50px_rgba(201,168,76,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-racing-red/10 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-titanium hover:text-white transition-colors z-20"
        >
          <X size={24} />
        </button>

        <div className="p-12 text-center relative z-10">
          {!isSuccess ? (
            <>
              <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                <Mail className="text-gold" size={40} />
              </div>

              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic leading-tight">
                {title}
              </h2>
              
              {guideTitle && (
                <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
                  {guideTitle}
                </div>
              )}

              <p className="text-titanium text-lg mb-10 leading-relaxed">
                {description}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium/50" size={20} />
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-charcoal border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder:text-titanium/30"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-shimmer text-charcoal py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : (
                    <>
                      Get Free Access
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              
              <p className="mt-6 text-titanium/40 text-[10px] font-bold uppercase tracking-widest">
                No Spam • Secure Data • Master Technical Insights
              </p>
            </>
          ) : (
            <div className="py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="text-emerald" size={56} />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
                Access <span className="text-emerald">Granted</span>
              </h2>
              <p className="text-titanium text-lg mb-8">
                Your guide is being prepared for download.
              </p>
              <div className="flex items-center justify-center gap-3 text-gold font-black uppercase text-xs tracking-widest animate-pulse">
                <Download size={18} />
                Starting Download...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

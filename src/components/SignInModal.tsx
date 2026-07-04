import React, { useState } from 'react';
import { X, Mail, LogIn, UserPlus, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn?: (email: string) => void;
}

export const SignInModal = ({ isOpen, onClose, onSignedIn }: SignInModalProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError('Authentication failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.id) {
        setIsSuccess(true);
        setTimeout(() => {
          onSignedIn?.(email);
        }, 1200);
      } else {
        setError('Unexpected response from server.');
        setIsSubmitting(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-dark-steel rounded-[2.5rem] border-2 border-gold/30 shadow-[0_0_50px_rgba(201,168,76,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Decorative glow */}
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
              {/* Icon */}
              <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                {mode === 'signin' ? (
                  <LogIn className="text-gold" size={40} />
                ) : (
                  <UserPlus className="text-gold" size={40} />
                )}
              </div>

              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic leading-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Join the Club'}
              </h2>

              <p className="text-titanium text-lg mb-10 leading-relaxed">
                {mode === 'signin'
                  ? 'Sign in to manage your collection, access valuations, and track your portfolio.'
                  : 'Get started with 3 free valuations and 3 free guides. No credit card required.'}
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

                {error && (
                  <div className="text-racing-red text-xs font-bold uppercase tracking-widest bg-racing-red/10 rounded-xl py-3 px-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-shimmer text-charcoal py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Free Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle mode */}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className="mt-6 text-gold text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already a member? Sign In'}
              </button>

              <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-titanium/40 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} />
                  Free Trial
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} />
                  No Spam
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} />
                  Instant Access
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="text-emerald" size={56} />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
                {mode === 'signin' ? 'Signed <span className="text-emerald">In</span>' : 'Account <span className="text-emerald">Created</span>'}
              </h2>
              <p className="text-titanium text-lg mb-8">
                Welcome to MuscleCars.ai, <span className="text-gold font-bold">{email}</span>.
              </p>
              <div className="flex items-center justify-center gap-3 text-gold font-black uppercase text-xs tracking-widest animate-pulse">
                Redirecting...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
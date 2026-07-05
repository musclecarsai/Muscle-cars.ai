import React, { useState } from 'react';
import { Car, Menu, User, LogOut } from 'lucide-react';
import { SignInModal } from './SignInModal';

export const Navbar = () => {
  const [signInOpen, setSignInOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check URL for ?email= to determine logged-in user
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const userEmail = params?.get('email') || null;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : null;

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('email');
      window.location.href = url.pathname;
    }
  };

  const handleSignedIn = (email: string) => {
    setSignInOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('email', email);
      window.location.href = url.toString();
    }
  };

  return (
    <>
      <nav className="bg-charcoal text-white py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-charcoal/90">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <img
              src="/src/assets/logo.png"
              alt="MuscleCars.ai"
              className="h-9 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
            />
          </div>
          
          <div className="hidden md:flex gap-10 font-bold uppercase text-[10px] tracking-[0.2em] text-titanium">
            <a href="/#marketplace" className="hover:text-white transition-colors relative group">
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
            </a>
            <a href="/articles" className="hover:text-white transition-colors relative group">
              Articles
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
            </a>
            <a href="/premium-library" className="hover:text-white transition-colors relative group">
              Library
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold transition-all group-hover:w-full" />
            </a>
            <a href="/meets" className="hover:text-white transition-colors relative group">
              Meetups
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold transition-all group-hover:w-full" />
            </a>
            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors relative group">
              Merchandise
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold transition-all group-hover:w-full" />
            </a>
            <a href="/partners" className="hover:text-white transition-colors relative group">
              Partners
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
            </a>
            <a href="/referral" className="hover:text-white transition-colors relative group">
              Referrals
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
            </a>
            <a href="/#pricing" className="hover:text-white transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-racing-red transition-all group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a href="/sell" className="hidden md:block bg-racing-red px-6 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-racing-red-light transition-all shadow-lg shadow-racing-red/20">
              Sell Vehicle
            </a>
            {userEmail ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-dark-steel border border-white/10 rounded-full px-4 py-2">
                  <div className="w-7 h-7 rounded-full bg-gold text-charcoal flex items-center justify-center font-black text-sm">
                    {userInitial}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-titanium hidden md:block max-w-[100px] truncate">
                    {userEmail}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-9 h-9 rounded-full bg-dark-steel border border-white/10 flex items-center justify-center hover:border-racing-red/50 transition-colors group"
                  title="Sign Out"
                >
                  <LogOut size={14} className="text-titanium group-hover:text-racing-red transition-colors" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setSignInOpen(true)}
                className="w-10 h-10 rounded-full bg-dark-steel border border-white/10 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors group"
              >
                <User size={18} className="text-titanium group-hover:text-gold transition-colors" />
              </div>
            )}
            <Menu
              className="md:hidden cursor-pointer text-titanium"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-steel border-t border-white/5 px-4 py-6 space-y-4">
            <a href="/#marketplace" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Marketplace</a>
            <a href="/articles" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Articles</a>
            <a href="/premium-library" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Library</a>
            <a href="/meets" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Meetups</a>
            <a href="https://dcreaz-6z.myshopify.com" target="_blank" rel="noopener noreferrer" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2">Merchandise</a>
            <a href="/partners" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Partners</a>
            <a href="/referral" className="block text-titanium font-bold uppercase text-xs tracking-widest hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Referrals</a>
            <a href="/sell" className="block bg-racing-red px-6 py-3 rounded-lg font-black uppercase text-xs tracking-widest text-center">Sell Vehicle</a>
            {!userEmail && (
              <button onClick={() => { setSignInOpen(true); setMobileMenuOpen(false); }} className="w-full bg-gold text-charcoal px-6 py-3 rounded-lg font-black uppercase text-xs tracking-widest text-center">
                Sign In / Get Started
              </button>
            )}
          </div>
        )}
      </nav>

      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={handleSignedIn}
      />
    </>
  );
};
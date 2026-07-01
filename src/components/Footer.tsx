import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-black text-zinc-600 py-12 border-t border-zinc-900">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
        <div className="font-bold text-white text-xl tracking-tighter">
          MUSCLECARS<span className="text-red-600">.AI</span>
        </div>
        <div className="flex gap-8">
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
        <div>
          © 2026 MuscleCars.ai. High-Performance Trading.
        </div>
      </div>
    </footer>
  );
};

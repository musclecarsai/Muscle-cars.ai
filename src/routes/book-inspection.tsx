import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { createInquiry, getUser, createUser } from "../lib/db";
import { ShieldCheck, MapPin, Car, Clock, CheckCircle2, AlertCircle, Mail, Phone, User as UserIcon, Send, CreditCard } from "lucide-react";

const submitInquiryFn = createServerFn({ method: "POST" })
  .validator((data: { name: string, email: string, phone: string, carMake: string, carModel: string, carYear: number, location: string, notes: string }) => data)
  .handler(async ({ data }) => {
    await createInquiry(data.email, data.carMake, data.carModel, data.carYear, data.location, data.notes);
    let user = await getUser(data.email);
    if (!user) await createUser(data.email);
    try { await fetch('http://localhost:3000/api/notify-owner', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type: 'inspection', itemName: data.carYear + ' ' + data.carMake + ' ' + data.carModel + ' + $199 deposit paid', customerName: data.name, customerEmail: data.email, details: 'Phone: ' + data.phone + ', Location: ' + data.location + ', Notes: ' + data.notes + ' | $199 deposit secured' }) }); } catch(e) { console.error(e); }
    return { success: true };
  });

export const Route = createFileRoute("/book-inspection")({
  component: BookInspection,
});

function BookInspection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", carMake: "", carModel: "", carYear: new Date().getFullYear(), location: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  // Stripe Payment Link for the $199 inspection deposit
  // The lead/owner should replace this with the actual payment link created from price_1TodZJDY9dw5xXBNq6loGqzh
  // ⚠️ OWNER ACTION NEEDED: Create a Stripe Payment Link from price_1TodZJDY9dw5xXBNq6loGqzh
  // Go to Stripe Dashboard → Payment Links → Create → select "Verified Physical Inspection" ($199)
  const DEPOSIT_LINK = "https://buy.stripe.com/bJedR9f5f3Fe0ed2z41Nu0y";

  const handlePayAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.carMake || !form.carModel || !form.carYear || !form.location) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Submit inquiry first
      await submitInquiryFn({ data: form });
      // Then redirect to Stripe for the $199 deposit
      window.open(DEPOSIT_LINK, '_blank');
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
            <ShieldCheck size={12} /> PROFESSIONAL CERTIFICATION
          </div>
          <h1 className="text-6xl font-black mb-6 uppercase tracking-tighter italic leading-[0.9]">
            Book <span className="text-gold">Inspection</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
            Tell us about your vehicle and location. A <span className="text-gold font-bold">$199 deposit</span> secures your booking — the remainder is quoted after we review.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {showSuccess ? (
            <div className="bg-dark-steel border border-green-500/30 rounded-3xl p-12 text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase italic">Inquiry Submitted!</h2>
              <p className="text-titanium mb-4 max-w-md mx-auto">
                Thank you, {form.name}! Your inspection request for your <span className="text-white font-bold">{form.carYear} {form.carMake} {form.carModel}</span> has been received.
              </p>
              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6 max-w-md mx-auto mb-8">
                <p className="text-gold font-bold text-lg mb-1">Deposit Payment</p>
                <p className="text-titanium text-sm">
                  A new tab has opened for your <span className="text-white font-bold">$199 deposit</span>. Complete payment there to secure your booking. Your deposit will be deducted from the final inspection cost.
                </p>
              </div>
              <p className="text-titanium text-sm mb-8 max-w-md mx-auto">
                A specialist will contact you at <span className="text-white font-bold">{form.email}</span> within 24 hours with a custom quote.
              </p>
              <button onClick={() => { setShowSuccess(false); setForm({ name: "", email: "", phone: "", carMake: "", carModel: "", carYear: new Date().getFullYear(), location: "", notes: "" }); }} className="bg-green-500 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg">
                Submit Another
              </button>
            </div>
          ) : (
            <div className="bg-dark-steel border border-white/10 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handlePayAndSubmit} className="space-y-8">
                {/* Contact Info */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2"><UserIcon size={14} className="text-gold" /> Full Name *</label>
                    <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="John Doe" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2"><Mail size={14} className="text-gold" /> Email *</label>
                    <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="john@example.com" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2"><Phone size={14} className="text-gold" /> Phone</label>
                    <input type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="(555) 123-4567" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2"><Car size={14} className="text-gold" /> Make *</label>
                    <input type="text" value={form.carMake} onChange={e => handleChange("carMake", e.target.value)} placeholder="e.g. Ford" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4">Model *</label>
                    <input type="text" value={form.carModel} onChange={e => handleChange("carModel", e.target.value)} placeholder="e.g. Mustang" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4">Year *</label>
                    <input type="number" value={form.carYear} onChange={e => handleChange("carYear", parseInt(e.target.value) || 0)} placeholder="e.g. 1969" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2"><MapPin size={14} className="text-gold" /> Vehicle Location *</label>
                  <input type="text" value={form.location} onChange={e => handleChange("location", e.target.value)} placeholder="Full address where the vehicle is located" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all" />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4">Additional Notes</label>
                  <textarea rows={3} value={form.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="Any special instructions, access notes, or questions for the inspector" className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all resize-none" />
                </div>

                <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-charcoal border-2 border-gold/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_10px_40px_rgba(201,168,76,0.15)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={18} className="text-gold" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-gold">Book with Deposit</div>
                    </div>
                    <div className="text-2xl font-black text-white">$199 Deposit</div>
                    <div className="text-titanium text-xs mt-1">Applied to final inspection cost. We'll quote the remainder based on your location.</div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-gold text-charcoal px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(201,168,76,0.3)] flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSubmitting ? "Processing..." : "Pay $199 & Submit"}
                    {!isSubmitting && <Send size={16} />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* How It Works sidebar */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gold/20 to-charcoal border border-gold/30 rounded-3xl p-8">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">How It Works:</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white text-sm font-medium">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black border border-gold/30">1</div>
                  Fill out your vehicle and contact details
                </div>
                <div className="flex items-center gap-3 text-white text-sm font-medium">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black border border-gold/30">2</div>
                  Pay <span className="text-gold font-bold">$199 deposit</span> to secure your booking
                </div>
                <div className="flex items-center gap-3 text-white text-sm font-medium">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black border border-gold/30">3</div>
                  We review and email you the remaining quote
                </div>
                <div className="flex items-center gap-3 text-white text-sm font-medium">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black border border-gold/30">4</div>
                  150-point inspection + video walkaround
                </div>
                <div className="flex items-center gap-3 text-white text-sm font-medium">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black border border-gold/30">5</div>
                  PDF report with market valuation
                </div>
              </div>
            </div>
            <div className="bg-dark-steel border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="text-racing-red" size={20} />
                <h4 className="text-white font-black uppercase tracking-widest text-xs">Deposit Policy</h4>
              </div>
              <p className="text-titanium text-sm leading-relaxed">
                Your $199 deposit is fully applied to the final inspection cost. If we can't service your area, we'll issue a full refund. After receiving your custom quote, you have the option to proceed or cancel with your deposit intact.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
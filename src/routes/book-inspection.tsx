import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  getUserCars,
  createInspection,
  getInspections,
  logTransaction,
  type User,
  type Car,
  type Inspection
} from "../lib/db";
import { ShieldCheck, MapPin, Car as CarIcon, Clock, CheckCircle2, AlertCircle, Calendar, CreditCard } from "lucide-react";

const getBookingData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    if (!email) return { user: null, cars: [], inspections: [] };
    const user = await getUser(email);
    if (!user) return { user: null, cars: [], inspections: [] };
    const cars = await getUserCars(user.id);
    const inspections = await getInspections(user.id);
    return { user, cars, inspections };
  });

const submitBookingFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, location: string, carId?: string, carDetails?: string }) => data)
  .handler(async ({ data }) => {
    // Log the transaction ($199.00)
    await logTransaction(data.userId, 'micro-transaction', 'Verified Inspection', 19900);
    
    // Create the inspection record
    await createInspection(data.userId, data.location, data.carId, data.carDetails);
    
    return { success: true };
  });

export const Route = createFileRoute("/book-inspection")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getBookingData({ data: email }),
  component: BookInspection,
});

function BookInspection() {
  const { user, cars, inspections } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/book-inspection' });
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [carDetails, setCarDetails] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!location) {
      alert("Please provide a location for the inspection.");
      return;
    }
    if (!selectedCarId && !carDetails) {
      alert("Please select a car or provide car details.");
      return;
    }

    if (!confirm("This will cost $199.00. Proceed with booking the inspection?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitBookingFn({
        data: {
          userId: user.id,
          location,
          carId: selectedCarId || undefined,
          carDetails: selectedCarId ? undefined : carDetails
        }
      });

      if (result.success) {
        setShowSuccess(true);
        // Refresh data would be good here, but for now we'll just show success state
      }
    } catch (error) {
      console.error(error);
      alert("Failed to book inspection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-charcoal min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <ShieldCheck size={64} className="text-racing-red mx-auto mb-6 opacity-20" />
            <h1 className="text-3xl font-black mb-4 uppercase italic">Access Denied</h1>
            <p className="text-titanium mb-8">You must be logged in to book a physical inspection. Please return to the homepage and enter your email.</p>
            <button 
              onClick={() => navigate({ to: '/' })}
              className="bg-racing-red text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-charcoal min-h-screen text-white selection:bg-racing-red selection:text-white">
      <Navbar />
      
      <div className="bg-racing-red text-white py-2 text-center text-xs font-black uppercase tracking-[0.2em] border-b border-white/10">
        <span>INSPECTION CONSOLE: {user.email}</span>
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
              <ShieldCheck size={12} />
              Professional Certification
            </div>
            <h1 className="text-6xl font-black mb-6 uppercase tracking-tighter italic leading-[0.9]">
              Verified <span className="text-gold">Inspection</span>
            </h1>
            <p className="text-titanium text-xl max-w-2xl leading-relaxed">
              Our certified specialists perform a 150-point inspection, complete with paint depth analysis and a detailed mechanical report.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-8">
              {showSuccess ? (
                <div className="bg-dark-steel border border-green-500/30 rounded-3xl p-12 text-center shadow-2xl animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                    <CheckCircle2 className="text-green-500" size={40} />
                  </div>
                  <h2 className="text-3xl font-black mb-4 uppercase italic">Booking Confirmed</h2>
                  <p className="text-titanium mb-8 max-w-md mx-auto">
                    Your request for a physical inspection has been received. A specialist will contact you within 24 hours to schedule the visit to <span className="text-white font-bold">{location}</span>.
                  </p>
                  <button 
                    onClick={() => {
                      setShowSuccess(false);
                      navigate({ search: (prev) => prev }); // Refresh
                    }}
                    className="bg-green-500 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg"
                  >
                    View My Requests
                  </button>
                </div>
              ) : (
                <div className="bg-dark-steel border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2">
                        <CarIcon size={14} className="text-gold" />
                        Select Vehicle
                      </label>
                      <select 
                        className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                        value={selectedCarId}
                        onChange={(e) => setSelectedCarId(e.target.value)}
                      >
                        <option value="">-- Choose from your collection --</option>
                        {cars.map(car => (
                          <option key={car.id} value={car.id}>
                            {car.year} {car.make} {car.model}
                          </option>
                        ))}
                        <option value="other">Other (Enter details below)</option>
                      </select>
                    </div>

                    {(selectedCarId === "other" || selectedCarId === "") && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4">
                          Vehicle Details (Year, Make, Model, VIN)
                        </label>
                        <textarea 
                          className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all h-32"
                          placeholder="e.g. 1969 Dodge Charger R/T, VIN: XXXXXXXXXXXXX"
                          value={carDetails}
                          onChange={(e) => setCarDetails(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2">
                        <MapPin size={14} className="text-gold" />
                        Inspection Location
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                        placeholder="Full address where the vehicle is located"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="bg-charcoal/50 border border-gold/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                          <CreditCard className="text-gold" size={24} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-titanium">Total Charge</div>
                          <div className="text-2xl font-black text-white italic">$199.00</div>
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto bg-gold text-charcoal px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? "Processing..." : "Complete Booking"}
                        {!isSubmitting && <ArrowRight size={16} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* History Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                  <Clock className="text-gold" size={24} />
                  Inspection <span className="text-gold">History</span>
                </h3>
                
                {inspections.length === 0 ? (
                  <div className="bg-dark-steel border border-white/5 rounded-3xl p-12 text-center opacity-30">
                    <Calendar size={48} className="mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">No pending or past inspections</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspections.map((ins) => (
                      <div key={ins.id} className="bg-dark-steel border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                            ins.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                            ins.status === 'scheduled' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                            'bg-gold/10 border-gold/20 text-gold'
                          }`}>
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <div className="text-white font-black uppercase tracking-tight text-lg italic">
                              {ins.car_details || "Managed Asset"}
                            </div>
                            <div className="text-titanium text-xs flex items-center gap-2 mt-1">
                              <MapPin size={12} /> {ins.location}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end gap-2">
                          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            ins.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            ins.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-gold/10 text-gold border-gold/20'
                          }`}>
                            {ins.status}
                          </div>
                          <div className="text-titanium text-[10px] font-mono">
                            {new Date(ins.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gold/20 to-charcoal border border-gold/30 rounded-3xl p-8">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Standard Includes:</h4>
                <div className="space-y-4">
                  {[
                    "150-Point Structural Inspection",
                    "Mechanical & Electrical Diagnostic",
                    "Paint Depth & Body Panel Audit",
                    "Engine Performance Compression Test",
                    "Professional HD Video Walkaround",
                    "Market Value Consultation"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-steel border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="text-racing-red" size={20} />
                  <h4 className="text-white font-black uppercase tracking-widest text-xs">Important Information</h4>
                </div>
                <p className="text-titanium text-sm leading-relaxed">
                  Inspections are typically scheduled within 48 hours of booking. Ensure the vehicle is accessible and has sufficient fuel for a test drive. You will receive a PDF report and video link via email upon completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

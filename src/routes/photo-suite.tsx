import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  getUser, 
  addAsset, 
  logTransaction,
  type User 
} from "../lib/db";
import { Camera, Upload, Sparkles, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";

const getSuiteData = createServerFn({ method: "GET" })
  .validator((email: string | undefined) => email)
  .handler(async ({ data: email }) => {
    if (!email) return { user: null };
    const user = await getUser(email);
    return { user };
  });

const processImageFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string, fileName: string }) => data)
  .handler(async ({ data }) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Log the transaction ($19.99)
    await logTransaction(data.userId, 'micro-transaction', 'AI Photo Suite', 1999);
    
    // Add the "enhanced" asset
    // In a real app, this would be a URL to the processed image
    const enhancedUrl = `/src/assets/car-placeholders/mustang-dark-horse.png`; // Using a nice placeholder
    await addAsset(data.userId, `Enhanced ${data.fileName}`, 'image', enhancedUrl);
    
    return { success: true, url: enhancedUrl };
  });

export const Route = createFileRoute("/photo-suite")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    };
  },
  loaderDeps: ({ search: { email } }) => ({ email }),
  loader: ({ deps: { email } }) => getSuiteData({ data: email }),
  component: PhotoSuite,
});

function PhotoSuite() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate({ from: '/photo-suite' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setStatus('idle');
      setProgress(0);
      setResultUrl(null);
    }
  };

  const handleEnhance = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!file) return;

    if (!confirm("This will cost $19.99. Proceed with AI Enhancement?")) {
      return;
    }

    setStatus('processing');
    
    try {
      const result = await processImageFn({ data: { userId: user.id, fileName: file.name } });
      if (result.success) {
        setStatus('complete');
        setResultUrl(result.url);
      }
    } catch (error) {
      console.error(error);
      alert("Enhancement failed. Please try again.");
      setStatus('idle');
    }
  };

  if (!user) {
    return (
      <div className="bg-charcoal min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <Camera size={64} className="text-racing-red mx-auto mb-6 opacity-20" />
            <h1 className="text-3xl font-black mb-4 uppercase italic">Access Denied</h1>
            <p className="text-titanium mb-8">You must be logged in to access the AI Photo Suite. Please return to the homepage and enter your email.</p>
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
        <span>AI PHOTO SUITE ACTIVE: {user.email}</span>
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-glow/10 text-amber-glow px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-amber-glow/20">
              <Sparkles size={12} />
              Elite Enhancement Engine
            </div>
            <h1 className="text-6xl font-black mb-6 uppercase tracking-tighter italic leading-[0.9]">
              Showroom <span className="text-amber-glow">Ready</span>
            </h1>
            <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
              Our neural networks analyze your vehicle's lines and environment to deliver studio-quality lighting and background correction instantly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Upload/Preview Zone */}
            <div className="bg-dark-steel border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-glow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              {!preview ? (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-amber-glow/50 transition-all group">
                  <div className="bg-charcoal w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="text-titanium group-hover:text-amber-glow" size={32} />
                  </div>
                  <span className="text-white font-black uppercase tracking-widest text-sm mb-2">Upload Original</span>
                  <span className="text-titanium text-xs">RAW, JPG, or PNG (MAX 25MB)</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group-hover:border-amber-glow/30 transition-colors">
                    <img src={preview} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/10">
                      Original
                    </div>
                    {status === 'processing' && (
                      <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                        <Loader2 className="text-amber-glow animate-spin mb-6" size={48} />
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                          <div 
                            className="bg-amber-glow h-full transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-amber-glow font-black italic uppercase tracking-widest text-sm animate-pulse">
                          Enhancing Lighting... {progress}%
                        </div>
                      </div>
                    )}
                  </div>
                  {status === 'idle' && (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {setFile(null); setPreview(null);}}
                        className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                      >
                        Replace
                      </button>
                      <button 
                        onClick={handleEnhance}
                        className="flex-[2] bg-amber-glow text-charcoal py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(255,191,0,0.2)] flex items-center justify-center gap-2"
                      >
                        Enhance Asset <Sparkles size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results/Gallery Zone */}
            <div className="space-y-8">
              <div className="bg-dark-steel border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                  <ImageIcon className="text-amber-glow" size={24} />
                  Output <span className="text-amber-glow">Preview</span>
                </h3>
                
                {status === 'complete' && resultUrl ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-amber-glow/50 shadow-[0_0_30px_rgba(255,191,0,0.2)]">
                      <img src={resultUrl} alt="Enhanced" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-amber-glow text-charcoal px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                        Enhanced
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="bg-charcoal/80 backdrop-blur-md p-2 rounded-lg border border-white/10">
                          <CheckCircle2 className="text-green-500" size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
                      <div className="bg-green-500 rounded-full p-1">
                        <CheckCircle2 className="text-white" size={14} />
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-green-500">Success!</span> Asset saved to your profile and processed at 4K resolution.
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setStatus('idle');
                        setFile(null);
                        setPreview(null);
                        setResultUrl(null);
                      }}
                      className="w-full border border-amber-glow/30 text-amber-glow py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-glow/10 transition-all flex items-center justify-center gap-2"
                    >
                      Process Another <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-8 grayscale opacity-20">
                    <Sparkles size={48} className="mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">Waiting for enhancement</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-dark-steel to-charcoal border border-white/10 rounded-3xl p-8">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Service Includes:</h4>
                <div className="space-y-4">
                  {[
                    "Shadow & Highlight Reconstruction",
                    "Dynamic Sky Replacement (Golden Hour)",
                    "Motion Blur Correction",
                    "Paint Depth & Reflection Enhancement"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-titanium text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-amber-glow rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

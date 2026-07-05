import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Upload, CheckCircle2, AlertCircle, Image } from "lucide-react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file (PNG, JPG, etc.)" });
      return;
    }
    setFile(f);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Logo uploaded successfully! The site is now updated." });
        setFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed. Check server logs." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase border border-gold/20">
            <Image size={12} /> ADMIN
          </div>
          <h1 className="text-6xl font-black mb-6 uppercase tracking-tighter italic leading-[0.9]">
            Upload <span className="text-gold">Logo</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto leading-relaxed">
            Upload a new logo image. It will replace the current site logo and be available immediately.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-dark-steel border border-white/10 rounded-3xl p-10 shadow-2xl">
            {/* Preview */}
            <div className="mb-10 text-center">
              <div className="w-48 h-20 mx-auto mb-4 flex items-center justify-center bg-charcoal rounded-2xl border-2 border-dashed border-white/10 p-4">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-titanium text-sm flex flex-col items-center gap-2">
                    <Image size={32} className="opacity-30" />
                    <span>No file selected</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-titanium">
                {preview ? "Preview" : "Current logo will show here"}
              </p>
            </div>

            {/* File picker */}
            <div className="mb-8">
              <label className="block text-xs font-black uppercase tracking-widest text-titanium mb-4 flex items-center gap-2">
                <Upload size={14} className="text-gold" /> Select Logo Image
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="w-full bg-charcoal border border-white/10 rounded-xl py-4 px-6 text-white file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-gold file:text-charcoal file:font-black file:text-[10px] file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-gold-light transition-all cursor-pointer"
              />
              <p className="text-titanium text-[10px] mt-2 uppercase tracking-widest">
                Recommended: PNG, max 500KB. Will be saved as logo.png and logo-white.png
              </p>
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-gold text-charcoal px-10 py-5 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(201,168,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Logo
                </>
              )}
            </button>

            {/* Message */}
            {message && (
              <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${
                message.type === "success" ? "bg-green-500/10 border border-green-500/30" : "bg-racing-red/10 border border-racing-red/30"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-racing-red shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className={`font-bold text-sm ${message.type === "success" ? "text-green-400" : "text-racing-red"}`}>
                    {message.type === "success" ? "Success" : "Error"}
                  </p>
                  <p className="text-titanium text-sm mt-1">{message.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-8 bg-dark-steel border border-white/5 rounded-3xl p-8">
            <h3 className="font-black uppercase text-xs tracking-widest text-gold mb-4">How it works</h3>
            <ul className="space-y-3 text-titanium text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black shrink-0 mt-0.5 border border-gold/30">1</div>
                Select a PNG or JPEG logo image from your computer
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black shrink-0 mt-0.5 border border-gold/30">2</div>
                Click "Upload Logo" — the file is saved to the server
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black shrink-0 mt-0.5 border border-gold/30">3</div>
                The navbar and all logo references update automatically — no code changes needed
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-[10px] font-black shrink-0 mt-0.5 border border-gold/30">4</div>
                A copy is also saved as <code className="text-gold text-[11px]">logo-white.png</code> for light backgrounds
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
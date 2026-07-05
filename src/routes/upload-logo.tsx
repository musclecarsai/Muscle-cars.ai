import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/upload-logo")({
  head: () => ({
    meta: [
      { title: "Upload Logo — MuscleCars.ai" },
      { name: "description", content: "Upload a new site logo for MuscleCars.ai." },
    ],
  }),
   UploadLogoPage,
});

function UploadLogoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/upload-logo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Logo uploaded! Refresh the site to see it live.' });
        setFile(null);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Upload failed.' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Upload failed. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen text-white font-sans">
      <Navbar />
      <div className="bg-dark-steel border-b border-gold/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <Upload className="text-gold mx-auto mb-4" size={48} />
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
            Upload <span className="text-gold">Logo</span>
          </h1>
          <p className="text-titanium text-xl max-w-2xl mx-auto">Replace the site logo with your own image file.</p>
        </div>
      </div>

      <section className="py-24 container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-dark-steel rounded-3xl p-10 border border-white/5">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20">
              <Upload className="text-gold" size={36} />
            </div>
            <p className="text-titanium">Select a PNG or JPG image to use as the site logo.</p>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-gold/30 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
            {file ? (
              <div>
                <CheckCircle2 className="text-emerald mx-auto mb-3" size={36} />
                <p className="text-white font-bold">{file.name}</p>
                <p className="text-titanium text-sm">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <Upload className="text-titanium/50 mx-auto mb-3" size={36} />
                <p className="text-titanium font-medium">Click or drag a file here</p>
                <p className="text-titanium/50 text-sm mt-1">PNG or JPG recommended</p>
              </div>
            )}
            <input id="file-input" type="file" accept="image/png,image/jpeg" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          </div>

          {status && (
            <div className={`flex items-center gap-3 mt-6 p-4 rounded-xl ${status.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-racing-red/10 text-racing-red border border-racing-red/20'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{status.msg}</span>
            </div>
          )}

          <button onClick={handleUpload} disabled={!file || uploading}
            className={`w-full mt-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${file && !uploading ? 'bg-gold text-charcoal hover:scale-[1.02]' : 'bg-white/5 text-titanium/50 cursor-not-allowed'}`}>
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
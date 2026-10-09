import { useState, useRef } from 'react';
import { Loader2, UploadCloud, X, Link2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  currentImage?: string;
  onRemove?: () => void;
  folder?: string;
  accept?: string;
}

export function ImageUpload({
  onUploadSuccess,
  label = "Upload Image",
  currentImage,
  onRemove,
  folder = "products",
  accept = "image/*"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = accept?.includes('video') || (currentImage && /\.(mp4|webm|ogg|mov)$/i.test(currentImage));

  // Direct upload via backend /api/upload-image (ImageKit Server SDK)
  const uploadFile = async (file: File) => {
    // Validate file size (max 35MB)
    if (file.size > 35 * 1024 * 1024) {
      setError("File is too large. Maximum size allowed is 35MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Read file as Base64 Data URL
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // 2. Upload directly to server API
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Data,
          fileName: `${folder}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`,
          folder: folder
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("Server returned no image URL");
      }

      onUploadSuccess(data.url);
      setError(null);
    } catch (err: any) {
      console.error("ImageKit upload error:", err);
      setError(err?.message || "Failed to upload image. Please try again or paste image URL directly.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onUploadSuccess(manualUrl.trim());
    setManualUrl('');
    setShowUrlInput(false);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        {label && <label className="block text-[11px] font-black uppercase tracking-widest text-[#667067]">{label}</label>}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] font-bold text-green hover:underline flex items-center gap-1"
        >
          <Link2 size={12} />
          {showUrlInput ? "Upload File" : "Paste Image URL"}
        </button>
      </div>

      {showUrlInput ? (
        <form onSubmit={handleManualUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://ik.imagekit.io/... or https://..."
            className="input text-xs py-2 flex-grow"
            autoFocus
          />
          <button
            type="submit"
            className="btn green px-4 text-xs py-2 whitespace-nowrap"
          >
            Apply URL
          </button>
        </form>
      ) : null}

      <div className="relative">
        {currentImage ? (
          <div className="relative aspect-square w-full max-w-[200px] border-2 border-dashed border-[#dfe5df] rounded-2xl overflow-hidden group bg-slate-50">
            {isVideo ? (
              <video src={currentImage} className="w-full h-full object-cover" controls />
            ) : (
              <img
                src={currentImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback icon if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all text-xs font-bold"
                title="Replace image"
              >
                <ImageIcon size={18} />
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="bg-rose-500/80 hover:bg-rose-600 text-white p-2 rounded-full backdrop-blur-md transition-all"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative aspect-square w-full max-w-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none
              ${isDragging ? 'border-green bg-green/10 scale-[1.02]' : isUploading ? 'border-green bg-green/5' : 'border-[#dfe5df] bg-[#f8faf8] hover:border-green hover:bg-green/5'}
            `}
          >
            {isUploading ? (
              <div className="text-center p-4">
                <Loader2 className="w-8 h-8 text-green animate-spin mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-tight text-green">Uploading to ImageKit...</p>
                <p className="text-[9px] text-slate-400 mt-1">Please wait a moment</p>
              </div>
            ) : (
              <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-slate-300 mb-2 group-hover:text-green transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-tight text-slate-600">Click or drag & drop</p>
                <p className="text-[9px] text-slate-400 mt-1">{accept.includes('video') ? "PNG, JPG, MP4 up to 35MB" : "PNG, JPG, WEBP up to 35MB"}</p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] p-2.5 rounded-xl font-medium mt-2 flex items-start justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

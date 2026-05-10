'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadBadgeImage } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

interface ArtworkUploaderProps {
  onUpload: (url: string) => void;
  className?: string;
}

export function ArtworkUploader({ onUpload, className }: ArtworkUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, SVG, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const result = await uploadBadgeImage(file);
      onUpload(result.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        id="artwork-drop-zone"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
          'flex flex-col items-center justify-center min-h-48 gap-3',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          preview ? 'min-h-64' : ''
        )}
      >
        {preview ? (
          <div className="relative w-full h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Badge preview"
              className="w-full h-full object-contain rounded-xl"
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading to Cloudinary…</span>
                </div>
              </div>
            )}
            <button
              type="button"
              id="remove-artwork-button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(''); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              {dragging ? (
                <Upload size={24} className="text-primary" />
              ) : (
                <ImageIcon size={24} className="text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragging ? 'Drop image here' : 'Upload badge artwork'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG, GIF · max 10MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, Loader2, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
  loading?: boolean;
}

export function UploadZone({
  onFilesSelected,
  accept = '.pdf,.png,.jpg,.jpeg',
  multiple = true,
  maxSize = 10,
  className,
  loading = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFiles = (files: File[]): boolean => {
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSize}MB limit`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (validateFiles(files)) {
      onFilesSelected?.(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (validateFiles(files)) {
      onFilesSelected?.(files);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-[2.5rem] p-12 border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center',
        isDragging
          ? 'border-primary bg-primary/5 shadow-purple'
          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />

      <div className="max-w-xs mx-auto">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-900 font-bold">Uploading & Processing...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-white shadow-soft flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 mb-2">
              Drop your invoices here
            </h4>
            <p className="text-slate-400 font-medium mb-8 text-sm">
              Support for PDF, PNG, JPG and JPEG formats up to {maxSize}MB.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2 mx-auto"
            >
              <File size={18} className="text-primary" />
              Browse Documents
            </button>
          </>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-500 text-xs font-bold animate-shake">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

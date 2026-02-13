'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface FileUploadProps {
  onUpload?: (data: any) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, []);

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file (setup-results.json)');
      return;
    }

    setFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Read file contents
      const text = await file.text();
      const data = JSON.parse(text);

      // Send to validation API
      const response = await fetch('/api/validate-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Call callback if provided
      if (onUpload) {
        onUpload(result);
      }

      // Store result in sessionStorage and navigate to results page
      sessionStorage.setItem('validationResult', JSON.stringify(result));
      sessionStorage.setItem('setupData', JSON.stringify(data));
      router.push('/results');

    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON file. Please check the file format.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-700 hover:border-primary/50 bg-background-card'
          }
        `}
      >
        {/* Upload Icon */}
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <p className="text-lg font-medium text-white mb-2">
            {file ? file.name : 'Upload setup-results.json'}
          </p>
          <p className="text-sm text-gray-400">
            Drag and drop your file here, or click to browse
          </p>
        </div>

        {/* File Input */}
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* File Selected */}
        {file && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">File ready to upload</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Upload Error</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !error && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`
            mt-6 w-full py-3 px-6 rounded-lg font-medium transition-all
            ${uploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white'
            }
          `}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Validating...
            </span>
          ) : (
            'Validate Setup'
          )}
        </button>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-300">
          <span className="font-medium">Expected file:</span> setup-results.json
        </p>
        <p className="text-xs text-blue-400 mt-2">
          This file is generated by the setup script (setup-mac.sh or setup-windows.ps1) and contains information about your installed tools.
        </p>
      </div>
    </div>
  );
}

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PosterUploadProps {
  onUpload: (url: string) => void;
  currentPoster?: string;
  onRemove?: () => void;
}

export function PosterUpload({ onUpload, currentPoster, onRemove }: PosterUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `giveaway-posters/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('giveaway-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('giveaway-assets')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  if (currentPoster) {
    return (
      <div className="relative">
        <div className="relative group">
          <img
            src={currentPoster}
            alt="Giveaway poster"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <button
                {...getRootProps()}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <input {...getInputProps()} />
                <Upload size={16} />
                <span>Replace</span>
              </button>
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="mx-auto text-purple-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
      } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="space-y-4">
          <Loader2 size={48} className="mx-auto text-purple-600 animate-spin" />
          <div>
            <p className="text-lg font-medium text-gray-900">Uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Image size={48} className="mx-auto text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop your poster here' : 'Upload Giveaway Poster'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop an image, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports: JPEG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useCallback } from 'react';
import { uploadFileClientSide, uploadMultipleFiles, validateFileSize, UploadProgress, UploadResult } from '@/lib/services/clientUploadService';

export interface UseFileUploadOptions {
  folder: string;
  maxSize?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  validateFile: (file: File) => boolean;
}

export const useFileUpload = (options: UseFileUploadOptions): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { folder, maxSize = '5tb', onSuccess, onError, onProgress } = options;

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      // Validate file size
      if (!validateFileSize(file, maxSize)) {
        throw new Error(`File size exceeds maximum allowed size of ${maxSize}`);
      }

      const result = await uploadFileClientSide(file, folder, (progress) => {
        setProgress(progress);
        onProgress?.(progress);
      });

      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [folder, maxSize, onSuccess, onError, onProgress]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    try {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      // Validate all files
      for (const file of files) {
        if (!validateFileSize(file, maxSize)) {
          throw new Error(`File "${file.name}" size exceeds maximum allowed size of ${maxSize}`);
        }
      }

      const results = await uploadMultipleFiles(files, folder, (fileIndex, progress) => {
        setProgress(progress);
        onProgress?.(progress);
      });

      onSuccess?.(results[0]); // Call onSuccess for the first file
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [folder, maxSize, onSuccess, onError, onProgress]);

  const validateFile = useCallback((file: File): boolean => {
    return validateFileSize(file, maxSize);
  }, [maxSize]);

  return {
    uploadFile,
    uploadMultiple,
    isUploading,
    progress,
    error,
    validateFile,
  };
};

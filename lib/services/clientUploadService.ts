import { put } from '@vercel/blob';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
}

/**
 * Client-side file upload to Vercel Blob
 * Bypasses the 4.5MB serverless function limit
 * Supports files up to 5TB
 */
export const uploadFileClientSide = async (
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const pathname = `uploads/${folder}/${filename}`;

    // For large files, we can implement chunked upload
    // For now, we'll use the standard put method
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      // Add progress tracking if needed
      ...(onProgress && {
        onUploadProgress: (progress) => {
          onProgress({
            loaded: progress.loaded,
            total: progress.total,
            percentage: Math.round((progress.loaded / progress.total) * 100)
          });
        }
      })
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading file client-side:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Upload multiple files concurrently
 * Useful for batch uploads
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadFileClientSide(
      file, 
      folder, 
      onProgress ? (progress) => onProgress(index, progress) : undefined
    )
  );

  return Promise.all(uploadPromises);
};

/**
 * Check if file size is within limits
 */
export const validateFileSize = (file: File, maxSize: string = '5tb'): boolean => {
  const maxSizeBytes = parseSizeToBytes(maxSize);
  return file.size <= maxSizeBytes;
};

/**
 * Parse size string to bytes
 * Supports: b, kb, mb, gb, tb
 */
const parseSizeToBytes = (sizeStr: string): number => {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
    'tb': 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)$/);
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
};

/**
 * Format bytes to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

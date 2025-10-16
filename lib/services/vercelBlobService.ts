import { put } from '@vercel/blob';
import { del } from '@vercel/blob';

export interface BlobFileInfo {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
}

export const saveFileToBlob = async (
  file: File,
  folder: string
): Promise<BlobFileInfo> => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const pathname = `uploads/${folder}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: buffer.length, // Use buffer length instead of blob.size
    };
  } catch (error) {
    console.error("Error saving file to Vercel Blob:", error);
    throw new Error("Failed to save file to blob storage");
  }
};

export const deleteFileFromBlob = async (url: string): Promise<void> => {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting file from Vercel Blob:", error);
    throw new Error("Failed to delete file from blob storage");
  }
};

export const getFileFromBlob = async (url: string): Promise<Buffer> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error fetching file from Vercel Blob:", error);
    throw new Error("Failed to fetch file from blob storage");
  }
};

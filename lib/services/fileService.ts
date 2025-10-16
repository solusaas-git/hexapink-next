import path from "path";
import fs from "fs/promises";
import csvParser from "csv-parser";
import File from "@/lib/models/File";
import { createReadStream } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { saveFileToBlob, getFileFromBlob, deleteFileFromBlob } from "./vercelBlobService";

export const getPurchasedLeadsData = async (
  collectionId: string,
  userId: string
) => {
  try {
    const files = await File.find({
      user: userId,
      collectionId: collectionId,
    });

    // Read data based on the file path
    const fileDataPromises = files.map(async (file) => {
      const filePath = path.join(process.cwd(), file.path || "");
      const data = await readFileData(filePath);
      return { ...file.toObject(), data };
    });

    const fileData = await Promise.all(fileDataPromises);

    // Extract unique primary values
    const allColumns = fileData.flatMap((file) =>
      Object.keys(file.data[0] || {})
    );
    const primaryColumn = allColumns.find(
      (column) =>
        column.toLowerCase().includes("email") ||
        column.toLowerCase().includes("phone")
    );

    if (!primaryColumn) {
      return { message: "Primary column not found" };
    }

    const uniqueValues = [
      ...new Set(
        fileData.flatMap((file) => file.data.map((row) => row[primaryColumn]))
      ),
    ];

    return { primaryColumn, uniqueValues };
  } catch (error) {
    console.error(error);
    return { message: "Error getting purchased files", error };
  }
};

export const readFileData = async (filePath: string): Promise<any[]> => {
  try {
    let fileContent: Buffer;
    
    // Check if it's a blob URL or local file path
    if (filePath.startsWith('http')) {
      // It's a blob URL, fetch from Vercel Blob
      fileContent = await getFileFromBlob(filePath);
    } else {
      // It's a local file path (for development)
      const absolutePath = path.resolve(filePath);
      fileContent = await fs.readFile(absolutePath);
    }

    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === ".json") {
      return JSON.parse(fileContent.toString('utf-8'));
    } else if (fileExtension === ".csv") {
      const rows: any[] = [];
      return new Promise((resolve, reject) => {
        // Create a readable stream from the buffer
        const { Readable } = require('stream');
        const stream = Readable.from(fileContent);
        
        stream
          .pipe(csvParser())
          .on("data", (row) => rows.push(row))
          .on("end", () => resolve(rows))
          .on("error", (error) => reject(error));
      });
    } else {
      throw new Error("Unsupported file format");
    }
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error("Failed to read file data");
  }
};

export const saveFile = async (
  file: File,
  folder: string
): Promise<string> => {
  try {
    // Use Vercel Blob for production, local filesystem for development
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const blobInfo = await saveFileToBlob(file, folder);
      return blobInfo.url; // Return the blob URL
    } else {
      // Development mode - use local filesystem
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create upload directory path
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      
      // Ensure directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Return relative path for database storage
      return `uploads/${folder}/${filename}`;
    }
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file");
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Check if it's a blob URL
    if (filePath.startsWith('http')) {
      await deleteFileFromBlob(filePath);
    } else {
      // Local file deletion (for development)
      const absolutePath = path.join(process.cwd(), "public", filePath);
      if (existsSync(absolutePath)) {
        await fs.unlink(absolutePath);
      }
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
};


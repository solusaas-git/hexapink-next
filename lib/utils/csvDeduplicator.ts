import * as fs from "fs";
import { parse } from "csv-parse";
import * as path from "path";
import Table from "@/lib/models/Table";
import { getFileFromBlob, saveFileToBlob } from "@/lib/services/vercelBlobService";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { Readable } from "stream";

interface DedupeResult {
  uniqueCount: number;
  duplicatesRemoved: number;
  duplicatesFile?: string;
}

/**
 * Deduplicate a CSV file based on specified columns
 * Overwrites the original file with deduplicated data
 */
export async function deduplicateCSV(
  filePath: string,
  delimiter: string,
  dedupeColumns: string[]
): Promise<DedupeResult> {
  return new Promise(async (resolve, reject) => {
    try {
      // Map delimiter names to actual characters
      const delimiterMap: { [key: string]: string } = {
        comma: ",",
        tab: "\t",
        semicolon: ";",
        pipe: "|",
      };

      const actualDelimiter = delimiterMap[delimiter.toLowerCase()] || ",";

      console.log(`Starting deduplication on: ${filePath}`);
      console.log(`Dedupe columns: ${dedupeColumns.join(", ")}`);

      const records: any[] = [];
      const duplicateRecords: any[] = [];
      const seen = new Set<string>();
      let totalRecords = 0;
      let duplicates = 0;

      // Get file content
      let fileContent: Buffer;
      if (filePath.startsWith('http')) {
        // It's a blob URL, fetch from Vercel Blob
        fileContent = await getFileFromBlob(filePath);
      } else {
        // It's a local file path (for development)
        const resolvedPath = path.isAbsolute(filePath)
          ? filePath
          : path.join(process.cwd(), "public", filePath);
        fileContent = await fs.promises.readFile(resolvedPath);
      }

      // Create a readable stream from the buffer
      const fileStream = Readable.from(fileContent);

    const parser = parse({
      columns: true,
      delimiter: actualDelimiter,
      trim: true,
      skip_empty_lines: true,
      skip_records_with_error: true,
      relax_column_count: true,
      relax_quotes: true,
      quote: null, // Disable quote handling for consistency
      escape: null,
      bom: true,
      cast: false,
    });
    
    fileStream.pipe(parser);

    parser.on("data", (record) => {
      totalRecords++;

      // Create a unique key based on the selected dedupe columns
      const keyParts = dedupeColumns.map((col) => {
        const value = record[col];
        // Normalize the value (trim, lowercase) for better matching
        return typeof value === "string" ? value.trim().toLowerCase() : String(value || "");
      });
      
      // Check if all dedupe column values are empty/null
      const hasAllEmptyValues = keyParts.every(part => part === "" || part === "null" || part === "undefined");
      
      // If all dedupe columns are empty, always keep the record (don't dedupe empty values)
      if (hasAllEmptyValues) {
        records.push(record);
        return;
      }
      
      const uniqueKey = keyParts.join("|||"); // Use delimiter unlikely to appear in data

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        records.push(record);
      } else {
        duplicates++;
        duplicateRecords.push(record);
      }

      // Log progress every 50k records
      if (totalRecords % 50000 === 0) {
        console.log(
          `Deduplication progress: ${totalRecords.toLocaleString()} processed, ${duplicates.toLocaleString()} duplicates found`
        );
      }
    });

    parser.on("end", async () => {
      console.log(`Deduplication complete: ${records.length} unique records, ${duplicates} duplicates removed`);

      try {
        // Write the deduplicated data back to the file
        if (filePath.startsWith('http')) {
          // For blob URLs, we need to create a new blob file
          const csvContent = convertRecordsToCSV(records, actualDelimiter);
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const newBlobInfo = await saveFileToBlob(blob as any, "tables");
          // Note: We can't overwrite the original blob, so we return the same URL
          // In a real implementation, you might want to delete the old blob and use the new one
        } else {
          // For local files, write directly
          const resolvedPath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), "public", filePath);
          await writeDeduplicatedCSV(resolvedPath, records, actualDelimiter);
        }

        // Write duplicates to a separate file if any exist
        let duplicatesFilePath: string | undefined;
        if (duplicateRecords.length > 0) {
          if (filePath.startsWith('http')) {
            // For blob URLs, create a new blob for duplicates
            const csvContent = convertRecordsToCSV(duplicateRecords, actualDelimiter);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const duplicatesBlobInfo = await saveFileToBlob(blob as any, "tables");
            duplicatesFilePath = duplicatesBlobInfo.url;
          } else {
            // For local files
            const resolvedPath = path.isAbsolute(filePath)
              ? filePath
              : path.join(process.cwd(), "public", filePath);
            const dir = path.dirname(resolvedPath);
            const basename = path.basename(resolvedPath, path.extname(resolvedPath));
            const ext = path.extname(resolvedPath);
            const duplicatesFullPath = path.join(dir, `${basename}_duplicates${ext}`);
            
            await writeDeduplicatedCSV(duplicatesFullPath, duplicateRecords, actualDelimiter);
            
            // Return relative path for public access
            if (duplicatesFullPath.includes("/public/")) {
              duplicatesFilePath = duplicatesFullPath.split("/public/")[1];
            } else {
              duplicatesFilePath = filePath.replace(path.extname(filePath), `_duplicates${path.extname(filePath)}`);
            }
          }
          
          console.log(`Duplicates saved to: ${duplicatesFilePath}`);
        }

        resolve({
          uniqueCount: records.length,
          duplicatesRemoved: duplicates,
          duplicatesFile: duplicatesFilePath,
        });
      } catch (error) {
        reject(error);
      }
    });

    parser.on("error", (error) => {
      console.error("Error during deduplication:", error);
      reject(error);
    });

    fileStream.on("error", (error) => {
      console.error("Error reading file for deduplication:", error);
      reject(error);
    });
    } catch (error) {
      console.error("Error in deduplicateCSV:", error);
      reject(error);
    }
  });
}

/**
 * Convert records array to CSV string
 */
function convertRecordsToCSV(records: any[], delimiter: string): string {
  if (records.length === 0) return '';
  
  // Get headers from first record
  const headers = Object.keys(records[0]);
  
  // Create CSV content
  const csvRows = [headers.join(delimiter)];
  
  for (const record of records) {
    const values = headers.map(header => {
      const value = record[header] || '';
      // Escape values that contain delimiter or quotes
      if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(delimiter));
  }
  
  return csvRows.join('\n');
}

/**
 * Write deduplicated records back to CSV file
 */
async function writeDeduplicatedCSV(
  filePath: string,
  records: any[],
  delimiter: string
): Promise<void> {
  if (records.length === 0) {
    console.log("No records to write");
    return;
  }

  // Get column names from first record
  const columns = Object.keys(records[0]);
  
  // Build CSV string manually for better control
  const lines: string[] = [];
  
  // Add header
  lines.push(columns.join(delimiter));
  
  // Add data rows
  for (const record of records) {
    const row = columns.map((col) => {
      const value = record[col];
      // Simple escaping - no quotes needed since we removed quote handling
      return value != null ? String(value) : "";
    });
    lines.push(row.join(delimiter));
  }
  
  // Write to file
  const csvContent = lines.join("\n");
  await fs.promises.writeFile(filePath, csvContent, "utf8");
  
  console.log(`Deduplicated file written successfully: ${filePath} (${records.length} records)`);
}

/**
 * Deduplicate a CSV file against existing database tables
 * Checks if any records already exist in other tables
 */
export async function deduplicateAgainstDatabase(
  filePath: string,
  delimiter: string,
  dedupeColumns: string[],
  userId: string
): Promise<DedupeResult> {
  return new Promise(async (resolve, reject) => {
    // Map delimiter names to actual characters
    const delimiterMap: { [key: string]: string } = {
      comma: ",",
      tab: "\t",
      semicolon: ";",
      pipe: "|",
    };

    const actualDelimiter = delimiterMap[delimiter.toLowerCase()] || ",";

    // Resolve file path
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), "public", filePath);

    console.log(`Starting database deduplication on: ${resolvedPath}`);
    console.log(`Checking against existing tables for user: ${userId}`);
    console.log(`Dedupe columns: ${dedupeColumns.join(", ")}`);

    try {
      // Get all existing tables for this user
      const existingTables = await Table.find({ userId }).select("file delimiter columns");
      console.log(`Found ${existingTables.length} existing tables to check against`);

      if (existingTables.length === 0) {
        // No existing tables, no duplicates
        const records: any[] = [];
        const fileStream = fs.createReadStream(resolvedPath, { encoding: "utf8" });
        const parser = fileStream.pipe(
          parse({
            columns: true,
            delimiter: actualDelimiter,
            trim: true,
            skip_empty_lines: true,
            quote: null,
            escape: null,
            bom: true,
          })
        );

        parser.on("data", (record) => records.push(record));
        parser.on("end", () => {
          console.log(`No existing tables - all ${records.length} records are unique`);
          resolve({ uniqueCount: records.length, duplicatesRemoved: 0 });
        });
        parser.on("error", reject);
        return;
      }

      // Build a set of existing keys from all tables
      const existingKeys = new Set<string>();
      
      for (const table of existingTables) {
        const tableFilePath = path.isAbsolute(table.file)
          ? table.file
          : path.join(process.cwd(), "public", table.file);

        if (!fs.existsSync(tableFilePath)) {
          console.log(`Skipping missing file: ${tableFilePath}`);
          continue;
        }

        const tableDelimiter = delimiterMap[table.delimiter.toLowerCase()] || ",";
        
        await new Promise<void>((resolveTable, rejectTable) => {
          const tableStream = fs.createReadStream(tableFilePath, { encoding: "utf8" });
          const tableParser = tableStream.pipe(
            parse({
              columns: true,
              delimiter: tableDelimiter,
              trim: true,
              skip_empty_lines: true,
              skip_records_with_error: true,
              quote: null,
              escape: null,
              bom: true,
            })
          );

          let tableRecordCount = 0;
          tableParser.on("data", (record) => {
            tableRecordCount++;
            // Create key from dedupe columns
            const keyParts = dedupeColumns.map((col) => {
              const value = record[col];
              return typeof value === "string" ? value.trim().toLowerCase() : String(value || "");
            });
            
            // Skip empty values - don't add them to the existing keys set
            const hasAllEmptyValues = keyParts.every(part => part === "" || part === "null" || part === "undefined");
            if (hasAllEmptyValues) {
              return; // Don't add empty keys to the set
            }
            
            const uniqueKey = keyParts.join("|||");
            existingKeys.add(uniqueKey);
          });

          tableParser.on("end", () => {
            console.log(`Loaded ${tableRecordCount} keys from table: ${table.file}`);
            resolveTable();
          });
          tableParser.on("error", rejectTable);
        });
      }

      console.log(`Total existing keys in database: ${existingKeys.size.toLocaleString()}`);

      // Now filter the new file against existing keys
      const uniqueRecords: any[] = [];
      const duplicateRecords: any[] = [];
      let totalRecords = 0;
      let duplicates = 0;

      const fileStream = fs.createReadStream(resolvedPath, { encoding: "utf8" });
      const parser = fileStream.pipe(
        parse({
          columns: true,
          delimiter: actualDelimiter,
          trim: true,
          skip_empty_lines: true,
          skip_records_with_error: true,
          quote: null,
          escape: null,
          bom: true,
        })
      );

      parser.on("data", (record) => {
        totalRecords++;

        // Create key from dedupe columns
        const keyParts = dedupeColumns.map((col) => {
          const value = record[col];
          return typeof value === "string" ? value.trim().toLowerCase() : String(value || "");
        });
        
        // Check if all dedupe column values are empty/null
        const hasAllEmptyValues = keyParts.every(part => part === "" || part === "null" || part === "undefined");
        
        // If all dedupe columns are empty, always keep the record (don't dedupe empty values)
        if (hasAllEmptyValues) {
          uniqueRecords.push(record);
          return;
        }
        
        const uniqueKey = keyParts.join("|||");

        if (!existingKeys.has(uniqueKey)) {
          uniqueRecords.push(record);
        } else {
          duplicates++;
          duplicateRecords.push(record);
        }

        // Log progress
        if (totalRecords % 50000 === 0) {
          console.log(
            `DB deduplication progress: ${totalRecords.toLocaleString()} processed, ${duplicates.toLocaleString()} duplicates found`
          );
        }
      });

      parser.on("end", async () => {
        console.log(
          `DB deduplication complete: ${uniqueRecords.length} unique records, ${duplicates} database duplicates removed`
        );

        // Write the deduplicated data back to the file
        await writeDeduplicatedCSV(resolvedPath, uniqueRecords, actualDelimiter);

        // Write database duplicates to a separate file if any exist
        let duplicatesFilePath: string | undefined;
        if (duplicateRecords.length > 0) {
          const dir = path.dirname(resolvedPath);
          const basename = path.basename(resolvedPath, path.extname(resolvedPath));
          const ext = path.extname(resolvedPath);
          const duplicatesFullPath = path.join(dir, `${basename}_db_duplicates${ext}`);
          
          await writeDeduplicatedCSV(duplicatesFullPath, duplicateRecords, actualDelimiter);
          
          // Return relative path for public access
          if (duplicatesFullPath.includes("/public/")) {
            duplicatesFilePath = duplicatesFullPath.split("/public/")[1];
          } else {
            duplicatesFilePath = filePath.replace(path.extname(filePath), `_db_duplicates${path.extname(filePath)}`);
          }
          
          console.log(`Database duplicates saved to: ${duplicatesFilePath}`);
        }

        resolve({
          uniqueCount: uniqueRecords.length,
          duplicatesRemoved: duplicates,
          duplicatesFile: duplicatesFilePath,
        });
      });

      parser.on("error", (error) => {
        console.error("Error during database deduplication:", error);
        reject(error);
      });

      fileStream.on("error", (error) => {
        console.error("Error reading file for database deduplication:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Error in database deduplication:", error);
      reject(error);
    }
  });
}


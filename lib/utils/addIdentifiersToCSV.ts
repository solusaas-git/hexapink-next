import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { generateLeadIdentifier } from "./leadIdentifier";
import { getFileFromBlob, saveFileToBlob } from "@/lib/services/vercelBlobService";
import { Readable } from "stream";

/**
 * Add unique identifiers to a CSV file
 * Creates a new file with an additional "lead_id" column as the first column
 * Returns the path to the new file and stats
 */
export async function addIdentifiersToCSV(
  filePath: string,
  delimiter: string = ",",
  tableId?: string
): Promise<{
  newFilePath: string;
  totalRows: number;
  identifiersAdded: number;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      const delimiterMap: Record<string, string> = {
        comma: ",",
        semicolon: ";",
        tab: "\t",
        pipe: "|",
      };
      const actualDelimiter = delimiterMap[delimiter] || delimiter;

      let fileContent: Buffer;
      let newFilePath: string;

      // Check if it's a blob URL or local file path
      if (filePath.startsWith('http')) {
        // It's a blob URL, fetch from Vercel Blob
        fileContent = await getFileFromBlob(filePath);
        // For blob URLs, we'll create a new blob with identifiers
        const timestamp = Date.now();
        newFilePath = `uploads/tables/${timestamp}-with-ids.csv`;
      } else {
        // It's a local file path (for development)
        let fullFilePath = filePath;
        if (!filePath.startsWith('/') && !filePath.includes('public/')) {
          fullFilePath = path.join(process.cwd(), 'public', filePath);
        } else if (!filePath.startsWith('/')) {
          fullFilePath = path.join(process.cwd(), filePath);
        }

        fileContent = await fs.promises.readFile(fullFilePath);
        
        // Generate new file path
        const dir = path.dirname(fullFilePath);
        const ext = path.extname(fullFilePath);
        const basename = path.basename(fullFilePath, ext);
        newFilePath = path.join(dir, `${basename}_with_ids${ext}`);
      }

      // Track skipped rows from parser
      let parserErrors = 0;
      const records: any[] = [];
      
      const parser = parse({
        delimiter: actualDelimiter,
        columns: true,
        skip_empty_lines: true,
        // Most lenient settings possible
        relax_quotes: true,
        relax_column_count: true,
        relax_column_count_less: true,
        relax_column_count_more: true,
        trim: true,
        skip_records_with_error: true, // Skip problematic records instead of crashing
        raw: false,
        escape: '\\',
        quote: '"',
        max_record_size: 1000000,
      });
      
      // Track skipped records
      parser.on("skip", (err) => {
        parserErrors++;
        // Only log first 5 unique errors to avoid spam
        if (parserErrors <= 5) {
          console.warn(`⚠️  Skipped row ${err.lines}: ${err.message}`);
        }
      });

      const readStream = Readable.from(fileContent);
      let writeStream: any;
      let csvContent = '';

      // Initialize write stream based on file type
      if (filePath.startsWith('http')) {
        // For blob URLs, we'll collect content in memory
        csvContent = '';
      } else {
        // For local files, use file stream
        writeStream = fs.createWriteStream(newFilePath);
      }

      let totalRows = 0;
      let identifiersAdded = 0;
      let skippedRows = 0;
      let headers: string[] = [];
      let headerWritten = false;

      // Helper function to properly escape CSV values
      const escapeCSVValue = (value: string): string => {
        if (!value) return '';
        const stringValue = value.toString();
        
        // Only quote if the value contains the delimiter, newline, or quotes
        const needsQuoting = stringValue.includes(actualDelimiter) || 
                            stringValue.includes('\n') || 
                            stringValue.includes('\r') ||
                            stringValue.includes('"');
        
        if (needsQuoting) {
          // Escape quotes by doubling them, then wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };

      parser.on("readable", function () {
        let record: any;
        while ((record = parser.read()) !== null) {
          totalRows++;

          try {
            // Write headers on first record
            if (!headerWritten) {
              headers = Object.keys(record);
              // Add lead_id column as first column - use the SAME delimiter
              const headerRow = ['lead_id', ...headers].map(h => escapeCSVValue(h)).join(actualDelimiter);
              if (filePath.startsWith('http')) {
                csvContent += headerRow + '\n';
              } else {
                writeStream.write(headerRow + '\n');
              }
              headerWritten = true;
            }

            // Generate identifier (format: LEAD-XXXXXXXXXXXXXXXX)
            const identifier = generateLeadIdentifier(record, tableId);
            identifiersAdded++;

            // Build row with identifier - use the SAME delimiter
            const values = headers.map(header => escapeCSVValue(record[header] || ""));
            const rowLine = [escapeCSVValue(identifier), ...values].join(actualDelimiter);
            if (filePath.startsWith('http')) {
              csvContent += rowLine + '\n';
            } else {
              writeStream.write(rowLine + '\n');
            }
          } catch (error) {
            skippedRows++;
            console.error(`Error processing row ${totalRows}:`, error);
            // Continue with next row
          }
        }
      });

      parser.on("error", (err) => {
        console.error("Error parsing CSV:", err);
        if (writeStream) writeStream.end();
        reject(err);
      });

      parser.on("end", async () => {
        if (writeStream) writeStream.end();
        
        const totalSkipped = skippedRows + parserErrors;
        console.log(`✓ Added ${identifiersAdded} identifiers to ${totalRows} rows`);
        
        if (totalSkipped > 0) {
          console.warn(`⚠️  WARNING: ${totalSkipped} rows were skipped:`);
          console.warn(`   - Parser errors: ${parserErrors}`);
          console.warn(`   - Processing errors: ${skippedRows}`);
        }
        
        try {
          if (filePath.startsWith('http')) {
            // For blob URLs, save the new content to blob storage
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const blobInfo = await saveFileToBlob(blob as any, "tables");
            
            resolve({
              newFilePath: blobInfo.url,
              totalRows: identifiersAdded,
              identifiersAdded,
            });
          } else {
            // For local files, replace original file with new file
            let fullFilePath = filePath;
            if (!filePath.startsWith('/') && !filePath.includes('public/')) {
              fullFilePath = path.join(process.cwd(), 'public', filePath);
            } else if (!filePath.startsWith('/')) {
              fullFilePath = path.join(process.cwd(), filePath);
            }
            
            await fs.promises.rename(newFilePath, fullFilePath);
            
            // Return the relative path (without public/)
            const relativePath = filePath.includes('public/') 
              ? filePath.replace(/^.*public\//, '') 
              : filePath;
            resolve({
              newFilePath: relativePath,
              totalRows: identifiersAdded,
              identifiersAdded,
            });
          }
        } catch (error) {
          reject(error);
        }
      });

      readStream.pipe(parser);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Check if a CSV file already has a lead_id column
 */
export async function hasIdentifierColumn(
  filePath: string,
  delimiter: string = ","
): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const delimiterMap: Record<string, string> = {
        comma: ",",
        semicolon: ";",
        tab: "\t",
        pipe: "|",
      };
      const actualDelimiter = delimiterMap[delimiter] || delimiter;

      let fileContent: Buffer;
      
      // Check if it's a blob URL or local file path
      if (filePath.startsWith('http')) {
        // It's a blob URL, fetch from Vercel Blob
        fileContent = await getFileFromBlob(filePath);
      } else {
        // It's a local file path (for development)
        let fullFilePath = filePath;
        if (!filePath.startsWith('/') && !filePath.includes('public/')) {
          fullFilePath = path.join(process.cwd(), 'public', filePath);
        } else if (!filePath.startsWith('/')) {
          fullFilePath = path.join(process.cwd(), filePath);
        }
        fileContent = await fs.promises.readFile(fullFilePath);
      }

      const parser = parse({
        delimiter: actualDelimiter,
        columns: true,
        to_line: 1, // Only read first line
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        trim: true,
        skip_records_with_error: true,
      });

      const readStream = Readable.from(fileContent);
      
      parser.on("readable", function () {
        const record = parser.read();
        if (record) {
          const hasId = "lead_id" in record || "LEAD_ID" in record || "_id" in record || "ID" in record;
          resolve(hasId);
        }
      });

      parser.on("error", () => {
        resolve(false);
      });

      parser.on("end", () => {
        resolve(false);
      });

      readStream.pipe(parser);
    } catch (error) {
      console.error("Error checking for identifier column:", error);
      resolve(false);
    }
  });
}


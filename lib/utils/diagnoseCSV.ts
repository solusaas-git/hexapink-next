import fs from "fs";
import { parse } from "csv-parse";
import { getFileFromBlob } from "@/lib/services/vercelBlobService";
import { Readable } from "stream";

/**
 * Diagnose CSV file issues
 * Returns detailed information about parsing problems
 */
export async function diagnoseCSV(
  filePath: string,
  delimiter: string = ";"
): Promise<{
  totalLines: number;
  successfullyParsed: number;
  errors: Array<{ line: number; error: string; sample: string }>;
  firstFewRows: any[];
}> {
  return new Promise(async (resolve) => {
    const errors: Array<{ line: number; error: string; sample: string }> = [];
    const firstFewRows: any[] = [];
    const lineNumber = 0;
    let successfullyParsed = 0;
    
    try {
      let fileContent: Buffer;
      
      // Check if it's a blob URL or local file path
      if (filePath.startsWith('http')) {
        // It's a blob URL, fetch from Vercel Blob
        fileContent = await getFileFromBlob(filePath);
      } else {
        // It's a local file path (for development)
        fileContent = await fs.promises.readFile(filePath);
      }
      
      const contentString = fileContent.toString('utf-8');
      const lines = contentString.split('\n');
      const totalLines = lines.length;
      
      // Now parse with error tracking
      const parser = parse({
        delimiter,
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        relax_column_count_less: true,
        relax_column_count_more: true,
        trim: true,
        skip_records_with_error: false, // Don't skip, track errors
      });
      
      // Create a readable stream from the buffer
      const readStream = Readable.from(fileContent);
      
      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          successfullyParsed++;
          if (firstFewRows.length < 5) {
            firstFewRows.push(record);
          }
        }
      });
      
      parser.on("error", (err: any) => {
        const line = err.lines || lineNumber;
        const sample = lines[line - 1]?.substring(0, 100) || "N/A";
        errors.push({
          line,
          error: err.message,
          sample,
        });
        
        // Try to continue parsing
        parser.resume();
      });
      
      parser.on("end", () => {
        resolve({
          totalLines,
          successfullyParsed,
          errors: errors.slice(0, 20), // First 20 errors
          firstFewRows,
        });
      });
      
      readStream.pipe(parser);
    } catch (error) {
      console.error("Error in diagnoseCSV:", error);
      resolve({
        totalLines: 0,
        successfullyParsed: 0,
        errors: [{ line: 0, error: error instanceof Error ? error.message : "Unknown error", sample: "N/A" }],
        firstFewRows: [],
      });
    }
  });
}


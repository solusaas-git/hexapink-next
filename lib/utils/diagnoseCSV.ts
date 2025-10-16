import fs from "fs";
import { parse } from "csv-parse";

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
  return new Promise((resolve) => {
    const errors: Array<{ line: number; error: string; sample: string }> = [];
    const firstFewRows: any[] = [];
    const lineNumber = 0;
    let successfullyParsed = 0;
    
    // Read file line by line to count total
    const lineCounter = fs.createReadStream(filePath, { encoding: "utf8" });
    const lines: string[] = [];
    let buffer = "";
    
    lineCounter.on("data", (chunk) => {
      buffer += chunk;
      const newLines = buffer.split("\n");
      buffer = newLines.pop() || "";
      lines.push(...newLines);
    });
    
    lineCounter.on("end", () => {
      if (buffer) lines.push(buffer);
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
      
      const readStream = fs.createReadStream(filePath);
      
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
    });
  });
}


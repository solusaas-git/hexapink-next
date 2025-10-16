import { parse, Options } from "csv-parse";

interface ParseResult {
  columns: string[];
  rowCount: number;
  detectedDelimiter: string;
  totalLines: number;
  skippedLines: number;
}

// Automatically detect CSV delimiter from first few lines
function detectDelimiter(text: string): string {
  const delimiters = [",", ";", "\t", "|"];
  const firstLine = text.split("\n")[0];
  
  let maxCount = 0;
  let detectedDelimiter = ",";
  
  for (const delimiter of delimiters) {
    const count = firstLine.split(delimiter).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  }
  
  return detectedDelimiter;
}

export async function parseCSV(file: File, delimiter?: string): Promise<ParseResult> {
  try {
    console.log(`Starting to parse file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Read only first chunk to detect delimiter and get columns
    const sampleSize = Math.min(1024 * 1024, file.size); // First 1MB or whole file if smaller
    const slice = file.slice(0, sampleSize);
    const sample = await slice.text();

    // Detect delimiter automatically if not provided
    const actualDelimiter = delimiter || detectDelimiter(sample);
    console.log(`Detected delimiter: ${actualDelimiter}`);

    // Count lines in entire file using simple line counting (more reliable)
    const countLines = async (): Promise<number> => {
      const reader = file.stream().getReader();
      const decoder = new TextDecoder();
      let lineCount = 0;
      let buffer = "";
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Count newlines in buffer
          const lines = buffer.split('\n');
          lineCount += lines.length - 1;
          buffer = lines[lines.length - 1]; // Keep incomplete line
        }
        
        // Add final line if buffer is not empty
        if (buffer.trim().length > 0) {
          lineCount++;
        }
        
        return lineCount;
      } catch (error) {
        console.error("Error counting lines:", error);
        throw error;
      }
    };

    // Get total line count (including header)
    const totalLines = await countLines();
    console.log(`Total lines in file: ${totalLines}`);

    // Parse first few rows to get column names
    return new Promise((resolve, reject) => {
      let columns: string[] = [];
      let sampleRowCount = 0;
      const maxSampleRows = 100; // Only parse first 100 rows to get columns

      const parserOptions: Options = {
        delimiter: actualDelimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        skip_records_with_error: true, // Skip errors instead of stopping
        skip_records_with_empty_values: false,
        relax_column_count: true,
        relax_column_count_less: true,
        relax_column_count_more: true,
        relax_quotes: true, // More lenient quote handling - will auto-fix quote issues
        escape: null, // Disable escape character - prevents escaping issues
        quote: null, // Disable quote handling entirely - treat quotes as regular characters
        cast: false,
        bom: true, // Handle BOM (Byte Order Mark)
        max_record_size: 10000000, // 10MB max record size
        to_line: maxSampleRows + 1, // Only parse first 100 rows
      };
      
      const parser = parse(parserOptions);

      parser.on("readable", function() {
        let record;
        while ((record = parser.read()) !== null) {
          if (columns.length === 0) {
            columns = Object.keys(record).map((col) => col.trim());
            console.log(`Found ${columns.length} columns:`, columns.slice(0, 5));
          }
          sampleRowCount++;
          if (sampleRowCount >= maxSampleRows) {
            parser.end();
            break;
          }
        }
      });

      parser.on("end", () => {
        if (columns.length === 0) {
          reject(new Error("No columns found in CSV file"));
          return;
        }

        // Total rows = total lines - 1 (header line)
        const rowCount = Math.max(0, totalLines - 1);
        const skippedLines = 0; // In preview, we don't skip any lines - just count them
        console.log(`Final count: ${rowCount} data rows (${totalLines} total lines - 1 header)`);

        // Map delimiter back to string name for storage
        const delimiterMap: { [key: string]: string } = {
          ",": "comma",
          "\t": "tab",
          ";": "semicolon",
          "|": "pipe",
        };

        resolve({
          columns,
          rowCount,
          detectedDelimiter: delimiterMap[actualDelimiter] || "comma",
          totalLines,
          skippedLines,
        });
      });

      parser.on("error", (error: Error) => {
        console.error("CSV parsing error:", error);
        reject(new Error(`CSV parsing error: ${error.message}`));
      });

      // Write sample to parser
      parser.write(sample);
      parser.end();
    });
  } catch (error) {
    console.error("CSV parsing initialization error:", error);
    throw new Error(`CSV parsing error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}


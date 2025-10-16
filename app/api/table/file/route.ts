import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { fileName, delimiterKey } = await request.json();

    // Define the directory where files are stored
    const uploadsDir = path.resolve(process.cwd(), "public");

    // Construct the full file path
    const filePath = path.join(uploadsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Determine the delimiter from the query parameters
    const delimiterMap: Record<string, string> = {
      comma: ",",
      semicolon: ";",
      tab: "\t",
      pipe: "|",
    };

    const delimiter = delimiterMap[delimiterKey];

    if (!delimiter) {
      return NextResponse.json(
        { error: "Invalid delimiter" },
        { status: 400 }
      );
    }

    // Read and parse the CSV file
    const results: any[] = [];
    let errorCount = 0;
    let totalProcessed = 0;
    let lastSkippedLine = -1;
    let sameLineSkipCount = 0;
    const MAX_SAME_LINE_SKIPS = 50; // Maximum times to skip the same line before forcing continue

    return new Promise((resolve) => {
      const fileStream = fs.createReadStream(filePath, { 
        encoding: 'utf8',
        highWaterMark: 256 * 1024 // Increased to 256KB chunks for better performance
      });

      const parser = fileStream.pipe(
        parse({
          columns: true,
          delimiter,
          trim: true,
          skip_empty_lines: true,
          skip_records_with_error: true,
          relax_column_count: true,
          relax: true,
          relax_quotes: true,
          cast: false,
          bom: true,
          max_record_size: 10000000,
          on_record: (record: any) => {
            totalProcessed++;
            lastSkippedLine = -1;
            sameLineSkipCount = 0;
            return record;
          }
        } as any)
      );

      parser.on("data", (data) => {
        // Clean up the data by removing or fixing problematic quotes
        const cleanedData: any = {};
        
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            // Remove standalone quotes and fix common quote issues
            const cleaned = value
              // Remove quotes at the beginning or end that are not properly paired
              .replace(/^"([^"]*[^"])$/, '$1') // Remove starting quote if no ending quote
              .replace(/^([^"][^"]*)"$/, '$1') // Remove ending quote if no starting quote
              // Remove isolated quotes in the middle of text
              .replace(/([a-zA-Z0-9])\s*"\s*([a-zA-Z0-9])/g, '$1 $2')
              // Clean up multiple spaces that might result from removal
              .replace(/\s+/g, ' ')
              .trim();
            
            cleanedData[key] = cleaned;
          } else {
            cleanedData[key] = value;
          }
        }
        
        results.push(cleanedData);
        
        // Log progress every 10k records
        if (results.length % 10000 === 0) {
          console.log(`Progress: ${results.length} records parsed...`);
        }
      });

      parser.on("skip", (error: any) => {
        const currentLine = error.lines || -1;
        
        // Check if we're stuck on the same line
        if (currentLine === lastSkippedLine) {
          sameLineSkipCount++;
          
          // If stuck too many times on same line, log once and stop tracking
          if (sameLineSkipCount === MAX_SAME_LINE_SKIPS) {
            console.log(`WARNING: Stuck at line ${currentLine}, attempting to force continue...`);
          } else if (sameLineSkipCount > MAX_SAME_LINE_SKIPS) {
            // Stop logging after max skips - parser will eventually move on
            return;
          }
        } else {
          // New line, reset counter
          lastSkippedLine = currentLine;
          sameLineSkipCount = 1;
        }
        
        // Only log if not stuck in loop
        if (sameLineSkipCount < 5) {
          errorCount++;
          console.log(`Skipped record at line ${currentLine}: ${error.message}`);
        }
      });

      parser.on("end", () => {
        console.log(`Successfully parsed ${results.length} records from ${fileName}`);
        if (errorCount > 0) {
          console.log(`Skipped ${errorCount} records due to errors`);
        }
        console.log(`Total processed: ${totalProcessed}`);
        resolve(NextResponse.json(results));
      });

      parser.on("error", (error) => {
        console.error("Fatal error parsing CSV file:", error);
        // Even on error, return what we have
        if (results.length > 0) {
          console.log(`Returning ${results.length} successfully parsed records despite error`);
          resolve(NextResponse.json(results));
        } else {
          resolve(
            NextResponse.json(
              { error: `Error parsing CSV file: ${error.message}` },
              { status: 500 }
            )
          );
        }
      });

      fileStream.on("error", (error) => {
        console.error("Error reading file:", error);
        resolve(
          NextResponse.json(
            { error: `Error reading file: ${error.message}` },
            { status: 500 }
          )
        );
      });
    });
  } catch (error: any) {
    console.error("Error reading file:", error);
    return NextResponse.json(
      { error: error.message || "Error reading file" },
      { status: 500 }
    );
  }
}

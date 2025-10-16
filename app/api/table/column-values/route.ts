import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { authenticate } from "@/lib/middleware/authenticate";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const body = await req.json();
    const { tableColumns } = body;

    if (!tableColumns || !Array.isArray(tableColumns)) {
      return NextResponse.json(
        { success: false, message: "tableColumns array is required" },
        { status: 400 }
      );
    }

    const uniqueValues = new Set<string>();

    // Process each table
    for (const tc of tableColumns) {
      const { tableId, tableColumn } = tc;

      // Fetch table info
      const table = await Table.findById(tableId);
      if (!table || !table.file) {
        console.log(`Table ${tableId} not found or has no file`);
        continue;
      }

      const filePath = path.join(process.cwd(), "public", table.file);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }

      // Get delimiter
      const delimiterMap: Record<string, string> = {
        comma: ",",
        semicolon: ";",
        tab: "\t",
        pipe: "|",
      };
      const delimiter = delimiterMap[table.delimiter] || ",";

      // Parse CSV and extract unique values for the column
      await new Promise<void>((resolve) => {
        const parser = parse({
          delimiter,
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
          trim: true,
          skip_records_with_error: true,
        });

        const readStream = fs.createReadStream(filePath);
        
        parser.on("readable", function () {
          let record;
          while ((record = parser.read()) !== null) {
            const value = record[tableColumn];
            if (value && typeof value === "string" && value.trim() !== "") {
              uniqueValues.add(value.trim());
            }
          }
        });

        parser.on("error", (err) => {
          console.error(`Error parsing file ${filePath}:`, err);
          resolve(); // Continue with other tables
        });

        parser.on("end", () => {
          resolve();
        });

        readStream.pipe(parser);
      });
    }

    // Convert to sorted array
    const sortedValues = Array.from(uniqueValues).sort();

    return NextResponse.json({
      success: true,
      values: sortedValues,
      count: sortedValues.length,
    });
  } catch (error: any) {
    console.error("Error fetching column values:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch column values" },
      { status: 500 }
    );
  }
}


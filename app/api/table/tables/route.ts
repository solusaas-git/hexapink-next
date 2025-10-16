import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";
import { getFileFromBlob } from "@/lib/services/vercelBlobService";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { tableIds } = await request.json();

    if (!tableIds || tableIds.length === 0) {
      return NextResponse.json(
        { message: "Table IDs are required" },
        { status: 400 }
      );
    }

    // Fetch table metadata
    const tables = await Table.find({ _id: { $in: tableIds } });

    if (tables.length === 0) {
      return NextResponse.json([]);
    }

    // Parse CSV files and return data
    const filesData = await Promise.all(
      tables.map(async (table) => {
        try {
          // Check if table has a file path
          if (!table.file) {
            console.error(`Table ${table._id} has no file field`);
            return {
              id: table._id.toString(),
              data: [],
            };
          }

          // Get file content based on whether it's a blob URL or local path
          let fileContent: string;
          if (table.file.startsWith('http')) {
            // It's a blob URL, fetch from Vercel Blob
            const buffer = await getFileFromBlob(table.file);
            fileContent = buffer.toString('utf-8');
          } else {
            // It's a local file path (for development)
            const filePath = path.join(process.cwd(), "public", table.file);
            fileContent = await fs.readFile(filePath, "utf-8");
          }

          // Parse CSV with robust configuration
          const records: Record<string, string>[] = [];
          
          return new Promise((resolve) => {
            const parser = parse(fileContent, {
              columns: true,
              skip_empty_lines: true,
              relax_quotes: true,
              relax_column_count: true,
              delimiter: table.delimiter || ",",
              trim: true,
              max_record_size: 1000000,
            });

            parser.on("readable", function () {
              let record;
              while ((record = parser.read()) !== null) {
                // Clean the record data
                const cleanedRecord: Record<string, string> = {};
                for (const [key, value] of Object.entries(record)) {
                  if (typeof value === "string") {
                    // Remove standalone quotes and normalize whitespace
                    cleanedRecord[key] = value
                      .replace(/^["']|["']$/g, "")
                      .replace(/\s+/g, " ")
                      .trim();
                  } else {
                    cleanedRecord[key] = value as string;
                  }
                }
                records.push(cleanedRecord);
              }
            });

            parser.on("error", function (err) {
              console.error(`Error parsing table ${table._id}:`, err);
              // Return empty data on error
              resolve({
                id: table._id.toString(),
                data: [],
              });
            });

            parser.on("end", function () {
              resolve({
                id: table._id.toString(),
                data: records,
              });
            });
          });
        } catch (error) {
          console.error(`Error reading file for table ${table._id}:`, error);
          return {
            id: table._id.toString(),
            data: [],
          };
        }
      })
    );

    return NextResponse.json(filesData);
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


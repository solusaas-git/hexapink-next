import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware/authenticate";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import Collection from "@/lib/models/Collection";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { getFileFromBlob } from "@/lib/services/vercelBlobService";
import { Readable } from "stream";

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
    const { collectionId, columnName, currentFilters } = body;

    if (!collectionId || !columnName) {
      return NextResponse.json(
        { success: false, message: "collectionId and columnName are required" },
        { status: 400 }
      );
    }

    // Find the collection
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return NextResponse.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    // Find the column to get its table columns
    const collectionColumn = collection.columns.find((col: any) => col.name === columnName);
    
    if (!collectionColumn || !collectionColumn.tableColumns || collectionColumn.tableColumns.length === 0) {
      return NextResponse.json(
        { success: false, message: "Column not found or has no table columns" },
        { status: 404 }
      );
    }

    // Get the CSV column name
    const targetCsvColumn = collectionColumn.tableColumns[0].tableColumn;

    // Build filters from currentFilters (excluding the current column)
    const filters: Record<string, any> = {};
    
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      for (const [filterColumnName, filterData] of Object.entries(currentFilters)) {
        // Skip the column we're fetching values for
        if (filterColumnName === columnName) continue;
        
        if (filterData && typeof filterData === 'object' && 'value' in filterData) {
          const { value, type } = filterData as any;
          
          // Find the CSV column name for this filter
          const filterColumn = collection.columns.find((col: any) => col.name === filterColumnName);
          
          if (!filterColumn || !filterColumn.tableColumns || filterColumn.tableColumns.length === 0) {
            continue;
          }
          
          const csvColumnName = filterColumn.tableColumns[0].tableColumn;
          
          if (Array.isArray(value) && value.length > 0) {
            filters[csvColumnName] = { values: value, type: 'array' };
          } else if (typeof value === 'object' && (value.min || value.max)) {
            filters[csvColumnName] = { min: value.min, max: value.max, type };
          }
        }
      }
    }

    // Get table IDs
    const tableIds = collectionColumn.tableColumns.map((tc: any) => tc.tableId);
    const tables = await Table.find({ _id: { $in: tableIds } });

    if (tables.length === 0) {
      return NextResponse.json({
        success: true,
        values: [],
        count: 0,
      });
    }

    // Extract unique values for the target column from filtered data
    const uniqueValues = new Set<string>();

    for (const table of tables) {
      if (!table.file) continue;

      let fileContent: Buffer;
      
      // Check if it's a blob URL or local file path
      if (table.file.startsWith('http')) {
        // It's a blob URL, fetch from Vercel Blob
        try {
          fileContent = await getFileFromBlob(table.file);
        } catch (error) {
          console.log(`Failed to fetch blob file: ${table.file}`, error);
          continue;
        }
      } else {
        // It's a local file path (for development)
        const filePath = path.join(process.cwd(), "public", table.file);
        
        if (!fs.existsSync(filePath)) continue;
        
        fileContent = await fs.promises.readFile(filePath);
      }

      // Get delimiter
      const delimiterMap: Record<string, string> = {
        comma: ",",
        semicolon: ";",
        tab: "\t",
        pipe: "|",
      };
      const delimiter = delimiterMap[table.delimiter] || ";";

      // Parse CSV and extract values
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

        // Create a readable stream from the buffer content
        const readStream = Readable.from(fileContent);

        parser.on("readable", function () {
          let record;
          while ((record = parser.read()) !== null) {
            // Check if record matches all filters
            let matches = true;

            // Apply filters (if any)
            for (const [columnName, filterConfig] of Object.entries(filters)) {
              const cellValue = record[columnName];
              
              if (cellValue === undefined || cellValue === null || cellValue === '') {
                matches = false;
                break;
              }

              const trimmedValue = cellValue.toString().trim();

              if (filterConfig.type === 'array') {
                if (!filterConfig.values.includes(trimmedValue)) {
                  matches = false;
                  break;
                }
              } else if (filterConfig.min || filterConfig.max) {
                const { min, max, type } = filterConfig;
                
                if (type === 'ZIP Code' || type === 'Text') {
                  if (min && trimmedValue < min) {
                    matches = false;
                    break;
                  }
                  if (max && trimmedValue > max) {
                    matches = false;
                    break;
                  }
                } else if (type === 'number') {
                  const numValue = parseFloat(trimmedValue);
                  if (isNaN(numValue)) {
                    matches = false;
                    break;
                  }
                  if (min && numValue < parseFloat(min)) {
                    matches = false;
                    break;
                  }
                  if (max && numValue > parseFloat(max)) {
                    matches = false;
                    break;
                  }
                } else if (type === 'date') {
                  const dateValue = new Date(trimmedValue);
                  if (min && dateValue < new Date(min)) {
                    matches = false;
                    break;
                  }
                  if (max && dateValue > new Date(max)) {
                    matches = false;
                    break;
                  }
                }
              }
            }

            // If row matches filters, add the target column value
            if (matches) {
              const targetValue = record[targetCsvColumn];
              if (targetValue && typeof targetValue === "string" && targetValue.trim() !== "") {
                uniqueValues.add(targetValue.trim());
              }
            }
          }
        });

        parser.on("error", (err) => {
          console.error(`Error parsing file ${table.file}:`, err);
          resolve();
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
    console.error("Error fetching filtered column values:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch filtered column values" },
      { status: 500 }
    );
  }
}


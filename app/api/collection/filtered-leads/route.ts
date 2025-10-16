import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import Table from "@/lib/models/Table";
import PurchasedLead from "@/lib/models/PurchasedLead";
import { authenticate } from "@/lib/middleware/authenticate";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { collectionId, selectedData } = await request.json();

    if (!collectionId) {
      return NextResponse.json(
        { message: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Find the collection
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    // Extract unique table IDs from collection columns
    const tableIds = Array.from(
      new Set(
        collection.columns
          ?.flatMap((col: any) =>
            col.tableColumns?.map((tc: any) => tc.tableId) || []
          )
          .filter((id: any) => id)
      )
    );

    if (tableIds.length === 0) {
      return NextResponse.json({ filteredLeadsCount: 0 });
    }

    // Get all tables
    const tables = await Table.find({ _id: { $in: tableIds } });
    
    if (tables.length === 0) {
      return NextResponse.json({ filteredLeadsCount: 0 });
    }

    // Fetch all purchased lead IDs for this user and collection
    const purchasedLeads = await PurchasedLead.find({
      user: user._id,
      collectionId: collectionId,
    }).select('leadIdentifier');
    
    const purchasedLeadIds = new Set(purchasedLeads.map(pl => pl.leadIdentifier));
    console.log(`User has already purchased ${purchasedLeadIds.size} leads from this collection`);

    // If no filters selected, return total leads minus purchased
    if (!selectedData || Object.keys(selectedData).length === 0) {
      const totalLeads = tables.reduce((sum, table) => sum + (table.leads || 0), 0);
      const availableLeads = Math.max(0, totalLeads - purchasedLeadIds.size);
      return NextResponse.json({ filteredLeadsCount: availableLeads });
    }

    // Build filter criteria from selectedData
    // We need to map collection column names to actual CSV column names
    const filters: Record<string, any> = {};
    
    console.log('Selected Data:', JSON.stringify(selectedData, null, 2));
    
    for (const [columnName, filterData] of Object.entries(selectedData)) {
      if (filterData && typeof filterData === 'object' && 'value' in filterData) {
        const { value, type } = filterData as any;
        
        // Find the actual CSV column names from collection columns
        const collectionColumn = collection.columns.find((col: any) => col.name === columnName);
        
        if (!collectionColumn || !collectionColumn.tableColumns || collectionColumn.tableColumns.length === 0) {
          console.log(`No table columns found for ${columnName}`);
          continue;
        }
        
        // Get the actual CSV column name from the first tableColumn
        const csvColumnName = collectionColumn.tableColumns[0].tableColumn;
        
        console.log(`Mapping collection column "${columnName}" to CSV column "${csvColumnName}"`);
        
        if (Array.isArray(value) && value.length > 0) {
          // Array of selected values (for multi-select)
          filters[csvColumnName] = { values: value, type: 'array' };
        } else if (typeof value === 'object' && (value.min || value.max)) {
          // Range filter (for numbers, dates, zip codes)
          filters[csvColumnName] = { min: value.min, max: value.max, type };
        }
      }
    }

    console.log('Filters to apply:', JSON.stringify(filters, null, 2));

    // If no valid filters, return total leads
    if (Object.keys(filters).length === 0) {
      const totalLeads = tables.reduce((sum, table) => sum + (table.leads || 0), 0);
      console.log('No filters applied, returning total leads:', totalLeads);
      return NextResponse.json({ filteredLeadsCount: totalLeads });
    }

    // Process each table and count matching rows
    let totalFilteredCount = 0;

    for (const table of tables) {
      if (!table.file) continue;

      const filePath = path.join(process.cwd(), "public", table.file);
      
      if (!fs.existsSync(filePath)) continue;

      // Get delimiter
      const delimiterMap: Record<string, string> = {
        comma: ",",
        semicolon: ";",
        tab: "\t",
        pipe: "|",
      };
      const delimiter = delimiterMap[table.delimiter] || ";";

      // Count matching rows
      const count = await new Promise<number>((resolve) => {
        let matchCount = 0;

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
            // Skip if this lead has already been purchased
            if (record.lead_id && purchasedLeadIds.has(record.lead_id)) {
              continue;
            }

            // Check if record matches all filters
            let matches = true;

            for (const [columnName, filterConfig] of Object.entries(filters)) {
              const cellValue = record[columnName];
              
              if (cellValue === undefined || cellValue === null || cellValue === '') {
                matches = false;
                break;
              }

              const trimmedValue = cellValue.toString().trim();

              if (filterConfig.type === 'array') {
                // Multi-select filter
                if (!filterConfig.values.includes(trimmedValue)) {
                  matches = false;
                  break;
                }
              } else if (filterConfig.min || filterConfig.max) {
                // Range filter
                const { min, max, type } = filterConfig;
                
                if (type === 'ZIP Code' || type === 'Text') {
                  // String comparison for ZIP codes
                  if (min && trimmedValue < min) {
                    matches = false;
                    break;
                  }
                  if (max && trimmedValue > max) {
                    matches = false;
                    break;
                  }
                } else if (type === 'number') {
                  // Numeric comparison
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
                  // Date comparison
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

            if (matches) {
              matchCount++;
            }
          }
        });

        parser.on("error", (err) => {
          console.error(`Error parsing file ${filePath}:`, err);
          resolve(0);
        });

        parser.on("end", () => {
          resolve(matchCount);
        });

        readStream.pipe(parser);
      });

      console.log(`Table ${table._id} matched ${count} rows`);
      totalFilteredCount += count;
    }

    console.log(`Total filtered count: ${totalFilteredCount}`);
    return NextResponse.json({ filteredLeadsCount: totalFilteredCount });
  } catch (error) {
    console.error("Error calculating filtered leads:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


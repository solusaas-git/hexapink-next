import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import path from "path";
import { parse } from "csv-parse";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection";
import Table from "@/lib/models/Table";
import PurchasedLead from "@/lib/models/PurchasedLead";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";
import { getFileFromBlob, saveFileToBlob } from "@/lib/services/vercelBlobService";
import { Readable } from "stream";

export const maxDuration = 300; // Set max duration for this route

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Parse multipart form data
    const formData = await request.formData();
    
    const filesJSON = formData.get("files") as string;
    const volume = parseInt(formData.get("volume") as string) || 0;
    const prix = parseFloat(formData.get("prix") as string) || 0;
    const paid = formData.get("paid") as string;
    const paymentMethodType = formData.get("paymentMethod") as string;
    const receipts = formData.getAll("receipts") as File[];

    // Validate required fields
    if (!filesJSON || volume === 0 || prix === 0 || !paid || !paymentMethodType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const files = JSON.parse(filesJSON);

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { message: "At least one file is required" },
        { status: 400 }
      );
    }

    // Validate balance if payment method is Balance
    if (paymentMethodType === "Balance" && user.balance < prix) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Save receipt files
    const receiptPaths: string[] = [];
    for (const receipt of receipts) {
      if (receipt && receipt.size > 0) {
        const receiptPath = await saveFile(receipt, "receipts");
        receiptPaths.push(receiptPath);
      }
    }

    // Create order
    const order = await Order.create({
      user: user._id,
      volume,
      prix,
      paid,
      paymentMethod: paymentMethodType,
      receipts: receiptPaths,
      files: [], // Will be populated after creating files
    });

    // Create file documents and save CSV files
    const createdFiles: any[] = [];

    for (const fileData of files) {
      try {
        let csvContent = "";
        let actualVolume = 0;
        let headers: string[] = [];
        let rowsWithLeadIds: any[] = []; // Track rows for saving purchased leads

        // If filteredData is provided and not empty, use it (for cart items)
        if (fileData.filteredData && fileData.filteredData.length > 0) {
          csvContent = generateCSV(fileData.filteredData, fileData.columns);
          actualVolume = fileData.filteredData.length;
          headers = Object.keys(fileData.filteredData[0] || {});
          rowsWithLeadIds = fileData.filteredData; // Save for purchased leads tracking
        } else {
          // Otherwise, filter from collection tables (for direct orders)
          console.log(`Filtering data for collection: ${fileData.collectionId}`);
          const collection = await Collection.findById(fileData.collectionId);
          if (!collection) {
            console.error(`Collection not found: ${fileData.collectionId}`);
            continue;
          }
          console.log(`Found collection: ${collection.title}`);

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
            console.error(`No tables found for collection: ${fileData.collectionId}`);
            continue;
          }

          const tables = await Table.find({ _id: { $in: tableIds } });
          console.log(`Found ${tables.length} tables for filtering`);

          // Fetch purchased leads for this user and collection
          const purchasedLeads = await PurchasedLead.find({
            user: user._id,
            collectionId: fileData.collectionId,
          }).select('leadIdentifier');
          
          const purchasedLeadIds = new Set(purchasedLeads.map(pl => pl.leadIdentifier));
          console.log(`User has already purchased ${purchasedLeadIds.size} leads from this collection`);

          // Build filters from columns
          const filters: Record<string, any> = {};
          for (const [columnName, filterData] of Object.entries(fileData.columns)) {
            if (filterData && typeof filterData === 'object' && 'value' in filterData) {
              const { value, type } = filterData as any;
              const collectionColumn = collection.columns.find((col: any) => col.name === columnName);
              if (!collectionColumn || !collectionColumn.tableColumns || collectionColumn.tableColumns.length === 0) {
                continue;
              }
              const csvColumnName = collectionColumn.tableColumns[0].tableColumn;
              if (Array.isArray(value) && value.length > 0) {
                filters[csvColumnName] = { values: value, type: 'array' };
              } else if (typeof value === 'object' && (value.min || value.max)) {
                filters[csvColumnName] = { min: value.min, max: value.max, type };
              }
            }
          }
          console.log(`Built filters:`, filters);

          // Get delimiter mapping
          const delimiterMap: Record<string, string> = {
            comma: ",",
            semicolon: ";",
            tab: "\t",
            pipe: "|",
          };
          
          // Get headers from table columns
          headers = tables[0].columns || [];
          console.log(`CSV has ${headers.length} columns`);

          // Filter and collect data
          const filteredRows: any[] = [];
          console.log(`Starting to filter CSV data, target volume: ${volume}`);

          for (const table of tables) {
            const delimiter = delimiterMap[table.delimiter] || ",";
            console.log(`Processing table: ${table.tableName}, delimiter: ${table.delimiter}`);

            await new Promise<void>(async (resolve) => {
              try {
                // Get file content based on whether it's a blob URL or local path
                let fileContent: Buffer;
                if (table.file.startsWith('http')) {
                  // It's a blob URL, fetch from Vercel Blob
                  fileContent = await getFileFromBlob(table.file);
                } else {
                  // It's a local file path (for development)
                  const filePath = path.join(process.cwd(), "public", table.file);
                  fileContent = await fsPromises.readFile(filePath);
                }

                const parser = parse({
                  delimiter,
                  columns: true,
                  skip_empty_lines: true,
                  relax_quotes: true,
                  relax_column_count: true,
                  trim: true,
                  skip_records_with_error: true,
                });

                // Create a readable stream from the buffer
                const readStream = Readable.from(fileContent);
              let reachedLimit = false;

              parser.on("readable", function () {
                if (reachedLimit) return;
                
                let record;
                while ((record = parser.read()) !== null) {
                  if (filteredRows.length >= volume) {
                    reachedLimit = true;
                    readStream.unpipe(parser);
                    readStream.destroy();
                    parser.end();
                    resolve();
                    return;
                  }

                  // Skip if this lead has already been purchased
                  if (record.lead_id && purchasedLeadIds.has(record.lead_id)) {
                    continue;
                  }

                  let matches = true;
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
                        if (min && trimmedValue < min) { matches = false; break; }
                        if (max && trimmedValue > max) { matches = false; break; }
                      } else if (type === 'number') {
                        const numValue = parseFloat(trimmedValue);
                        if (isNaN(numValue)) { matches = false; break; }
                        if (min && numValue < parseFloat(min)) { matches = false; break; }
                        if (max && numValue > parseFloat(max)) { matches = false; break; }
                      } else if (type === 'date') {
                        const dateValue = new Date(trimmedValue);
                        if (min && dateValue < new Date(min)) { matches = false; break; }
                        if (max && dateValue > new Date(max)) { matches = false; break; }
                      }
                    }
                  }
                  if (matches) {
                    filteredRows.push(record);
                  }
                }
              });

              parser.on("error", (err) => {
                console.error(`Parser error: ${err.message}`);
                readStream.destroy();
                resolve();
              });

              parser.on("end", () => {
                resolve();
              });

              readStream.on("error", (err) => {
                console.error(`ReadStream error: ${err.message}`);
                parser.destroy();
                resolve();
              });

              readStream.pipe(parser);
              } catch (error) {
                console.error(`Error processing table ${table.tableName}:`, error);
                resolve();
              }
            });

            if (filteredRows.length >= volume) {
              break;
            }
          }

          // Generate CSV content
          csvContent = generateCSVFromRows(filteredRows, headers);
          actualVolume = filteredRows.length;
          rowsWithLeadIds = filteredRows; // Save for purchased leads tracking
        }
        
        // Save CSV file with collection name + company name + date + time
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const collectionName = fileData.title.replace(/[^a-z0-9]/gi, '_');
        const userDisplayName = user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'user';
        const companyName = userDisplayName.replace(/[^a-z0-9]/gi, '_');
        const fileTitle = `${fileData.title} - ${userDisplayName} - ${dateStr} ${timeStr.replace(/-/g, ':')}`;
        const fileName = `${collectionName}_${companyName}_${dateStr}_${timeStr}.csv`;

        // Save file using the appropriate method (blob or local)
        let filePath: string;
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          // Use Vercel Blob for production
          const csvBlob = new Blob([csvContent], { type: 'text/csv' });
          
          // Create a File object with the proper name for blob storage
          const fileWithName = new File([csvBlob], fileName, { type: 'text/csv' });
          const blobInfo = await saveFileToBlob(fileWithName, "orders");
          filePath = blobInfo.url;
        } else {
          // Use local filesystem for development
          const localFilePath = `uploads/orders/${fileName}`;
          const fullPath = path.join(process.cwd(), "public", localFilePath);
          
          // Ensure directory exists
          await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
          await fsPromises.writeFile(fullPath, csvContent, "utf-8");
          filePath = `/${localFilePath}`;
        }

        // Determine the number of columns in the actual CSV
        const columnCount = headers.length || 0;

        // Create File document
        const fileDoc = await File.create({
          user: user._id,
          title: fileTitle,
          type: fileData.type,
          countries: fileData.countries,
          collectionId: fileData.collectionId,
          image: fileData.image || "",
          unitPrice: fileData.unitPrice || 0,
          volume: actualVolume,
          columns: columnCount,
          status: "Ready",
          path: filePath, // Use the correct path (blob URL or local path)
          orderId: order._id,
        });

        createdFiles.push(fileDoc._id);

        // Save purchased lead identifiers to PurchasedLead collection
        if (rowsWithLeadIds && rowsWithLeadIds.length > 0) {
          console.log(`Saving ${rowsWithLeadIds.length} purchased lead identifiers...`);
          const purchasedLeadDocs = rowsWithLeadIds
            .filter(row => row.lead_id) // Only save rows that have a lead_id
            .map(row => ({
              user: user._id,
              collectionId: fileData.collectionId,
              orderId: order._id,
              leadIdentifier: row.lead_id,
              purchaseDate: new Date(),
            }));

          if (purchasedLeadDocs.length > 0) {
            try {
              // Use insertMany with ordered: false to continue even if some duplicates exist
              await PurchasedLead.insertMany(purchasedLeadDocs, { ordered: false });
              console.log(`Successfully saved ${purchasedLeadDocs.length} purchased lead identifiers`);
            } catch (error: any) {
              // Ignore duplicate key errors (code 11000), but log other errors
              if (error.code !== 11000) {
                console.error("Error saving purchased leads:", error);
              } else {
                console.log(`Some leads were already purchased (duplicates ignored)`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error creating file for ${fileData.title}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Update order with file IDs
    order.files = createdFiles;
    await order.save();

    // Create transaction
    await Transaction.create({
      userId: user._id,
      price: prix,
      type: "Order",
      paymentmethod: paymentMethodType === "Balance" 
        ? "Balance" 
        : paymentMethodType === "Bank Transfer" 
        ? "Bank Transfer" 
        : "Credit Card",
      paymentId: order._id,
      status: paid === "Paid" ? "Completed" : "Waiting",
      receipts: receiptPaths,
    });

    // If payment method is Balance and order is paid, deduct from user balance
    if (paymentMethodType === "Balance" && paid === "Paid") {
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { balance: -prix } },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        volume: order.volume,
        prix: order.prix,
        paid: order.paid,
        filesCount: createdFiles.length,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate CSV content
function generateCSV(data: Record<string, string>[], columns: any): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Get headers from columns or first data row
  const headers = columns && typeof columns === "object" 
    ? Object.keys(columns) 
    : Object.keys(data[0]);

  // CSV header row
  const csvHeaders = headers.join(",");

  // CSV data rows
  const csvRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header] || "";
      // Escape values with commas or quotes
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}

// Helper function to generate CSV from filtered rows
function generateCSVFromRows(rows: any[], headers: string[]): string {
  if (!rows || rows.length === 0) {
    return headers.join(",");
  }

  // CSV header row
  const csvHeaders = headers.join(",");

  // CSV data rows
  const csvRows = rows.map((row) => {
    return headers.map((header) => {
      const value = row[header] || "";
      // Escape values with commas or quotes
      if (typeof value === 'string' && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}


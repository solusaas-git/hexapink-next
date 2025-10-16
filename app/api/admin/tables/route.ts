import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";
import { parseCSV } from "@/lib/utils/csvParser";
import { hasIdentifierColumn, addIdentifiersToCSV } from "@/lib/utils/addIdentifiersToCSV";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const tables = await Table.find().sort({ createdAt: -1 });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract fields from formData
    const tableName = formData.get("tableName") as string;
    const csvFile = formData.get("file") as File;
    const delimiterFromForm = formData.get("delimiter") as string | null;
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? JSON.parse(tagsStr) : [];
    const dedupeColumnsStr = formData.get("dedupeColumns") as string;
    const dedupeColumns = dedupeColumnsStr ? JSON.parse(dedupeColumnsStr) : [];
    const dedupeMode = formData.get("dedupeMode") as string || "file";

    if (!tableName || !csvFile) {
      return NextResponse.json(
        { message: "Table name and CSV file are required" },
        { status: 400 }
      );
    }

    // Save the CSV file
    let filePath = await saveFile(csvFile, "tables");

    // Parse CSV - use provided delimiter or auto-detect
    const { columns, rowCount, detectedDelimiter, totalLines } = await parseCSV(csvFile);
    const finalDelimiter = delimiterFromForm || detectedDelimiter;

    // Create table first to get the ID for identifier generation
    await connectDB();
    const tempTable = await Table.create({
      tableName,
      file: filePath,
      delimiter: finalDelimiter,
      columns: columns, // Store column names array, not count
      count: rowCount,
      leads: rowCount,
      userId: user._id,
      tags,
    });
    
    // Diagnose file first
    console.log("🔍 Diagnosing CSV file...");
    const { diagnoseCSV } = await import("@/lib/utils/diagnoseCSV");
    const diagnosis = await diagnoseCSV(filePath, finalDelimiter);
    
    console.log(`📊 Diagnosis Results:`);
    console.log(`   Total lines: ${diagnosis.totalLines}`);
    console.log(`   Successfully parsed: ${diagnosis.successfullyParsed}`);
    console.log(`   Errors found: ${diagnosis.errors.length}`);
    
    if (diagnosis.errors.length > 0) {
      console.warn(`⚠️  First few errors:`);
      diagnosis.errors.slice(0, 5).forEach((err, i) => {
        console.warn(`   ${i + 1}. Line ${err.line}: ${err.error}`);
        console.warn(`      Sample: ${err.sample}`);
      });
    }
    
    // Clean malformed quotes first
    console.log("🧹 Cleaning malformed quotes...");
    const { cleanCSVQuotes } = await import("@/lib/utils/cleanCSVQuotes");
    const cleanResult = await cleanCSVQuotes(filePath, finalDelimiter);
    if (cleanResult.cleaned > 0) {
      console.log(`✓ Fixed ${cleanResult.cleaned} lines with quote issues`);
    }
    
    // Check if file has identifier column, if not, add it
    const hasId = await hasIdentifierColumn(filePath, finalDelimiter);
    let finalColumns = columns;
    if (!hasId) {
      console.log("No lead_id column found, adding lead_id column...");
      const identifierResult = await addIdentifiersToCSV(filePath, finalDelimiter, tempTable._id.toString());
      console.log("✓ Lead identifiers added successfully (format: LEAD-XXXXXXXXXXXXXXXX)");
      
      // Update the file path if it's a blob URL (new blob was created)
      if (filePath.startsWith('http') && identifierResult.newFilePath) {
        filePath = identifierResult.newFilePath;
        console.log(`Updated file path to new blob URL: ${filePath}`);
      }
      
      // Update columns array to include lead_id as first column
      finalColumns = ['lead_id', ...columns];
    } else {
      console.log("✓ File already has lead_id column");
    }

    // If deduplication is requested, process the file
    let finalRowCount = rowCount;
    let duplicatesRemoved = 0;
    let dbDuplicatesRemoved = 0;
    let duplicatesFile: string | undefined;
    let dbDuplicatesFile: string | undefined;
    
    if (dedupeColumns.length > 0 && (dedupeMode === "file" || dedupeMode === "both")) {
      // Import deduplication utility for in-file deduplication
      const { deduplicateCSV } = await import("@/lib/utils/csvDeduplicator");
      const dedupeResult = await deduplicateCSV(filePath, finalDelimiter, dedupeColumns);
      finalRowCount = dedupeResult.uniqueCount;
      duplicatesRemoved = dedupeResult.duplicatesRemoved;
      duplicatesFile = dedupeResult.duplicatesFile;
      console.log(`Removed ${duplicatesRemoved} in-file duplicates. Current count: ${finalRowCount}`);
    }
    
    if (dedupeColumns.length > 0 && (dedupeMode === "database" || dedupeMode === "both")) {
      // Import database deduplication utility
      await connectDB();
      const { deduplicateAgainstDatabase } = await import("@/lib/utils/csvDeduplicator");
      const dbDedupeResult = await deduplicateAgainstDatabase(
        filePath, 
        finalDelimiter, 
        dedupeColumns,
        user._id
      );
      finalRowCount = dbDedupeResult.uniqueCount;
      dbDuplicatesRemoved = dbDedupeResult.duplicatesRemoved;
      dbDuplicatesFile = dbDedupeResult.duplicatesFile;
      console.log(`Removed ${dbDuplicatesRemoved} database duplicates. Final count: ${finalRowCount}`);
    }

    // Update table entry with final row count after deduplication
    tempTable.leads = finalRowCount;
    tempTable.columns = finalColumns; // Store column names array (including lead_id), not count
    tempTable.file = filePath; // Update file path if it changed (e.g., new blob URL with identifiers)
    await tempTable.save();

    // Return additional info for validation
    return NextResponse.json({
      ...tempTable.toObject(),
      _importInfo: {
        totalLines,
        expectedRows: rowCount,
        finalRows: finalRowCount,
        duplicatesRemoved,
        dbDuplicatesRemoved,
        duplicatesFile,
        dbDuplicatesFile,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import * as XLSX from "xlsx";
import { authenticate } from "@/lib/middleware/authenticate";
import File from "@/lib/models/File";
import connectDB from "@/lib/db";
import { getFileFromBlob } from "@/lib/services/vercelBlobService";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");
    const format = searchParams.get("format") || "csv"; // csv or xlsx

    if (!fileId) {
      return NextResponse.json(
        { message: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file from database
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Check if user owns the file
    if (fileDoc.user?.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Get file content based on whether it's a blob URL or local path
    let csvContent: string;
    if (fileDoc.path?.startsWith('http')) {
      // It's a blob URL, fetch from Vercel Blob
      const buffer = await getFileFromBlob(fileDoc.path);
      csvContent = buffer.toString('utf-8');
    } else {
      // It's a local file path (for development)
      const csvFilePath = path.join(process.cwd(), "public", fileDoc.path || "");
      
      // Check if file exists
      try {
        await fsPromises.access(csvFilePath);
      } catch {
        return NextResponse.json(
          { message: "File not found on disk" },
          { status: 404 }
        );
      }
      
      csvContent = await fsPromises.readFile(csvFilePath, "utf-8");
    }

    if (format === "csv") {
      // Return CSV file directly
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${fileDoc.title}.csv"`,
        },
      });
    } else if (format === "xlsx") {
      // Convert CSV to XLSX
      const rows: any[] = [];

      await new Promise<void>((resolve, reject) => {
        const parser = parse({
          delimiter: ",",
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
          trim: true,
          skip_records_with_error: true,
        });

        const readStream = fs.createReadStream(csvFilePath);

        parser.on("readable", function () {
          let record;
          while ((record = parser.read()) !== null) {
            rows.push(record);
          }
        });

        parser.on("error", (err) => {
          reject(err);
        });

        parser.on("end", () => {
          resolve();
        });

        readStream.pipe(parser);
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      // Generate XLSX buffer
      const xlsxBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      return new NextResponse(xlsxBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileDoc.title}.xlsx"`,
        },
      });
    } else {
      return NextResponse.json(
        { message: "Invalid format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


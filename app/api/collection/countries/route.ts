import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all active collections (status is "Active" with capital A)
    const collections = await Collection.find({ status: "Active" });

    console.log(`Found ${collections.length} active collections`);

    // Extract unique countries from all collections
    const countriesSet = new Set<string>();
    collections.forEach((collection) => {
      console.log(`Collection: ${collection.title}, Countries:`, collection.countries);
      if (collection.countries && Array.isArray(collection.countries)) {
        collection.countries.forEach((country: string) => {
          if (country && country.trim() !== "") {
            countriesSet.add(country.trim());
          }
        });
      }
    });

    console.log("Unique countries found:", Array.from(countriesSet));

    // Convert to array and sort
    const countries = Array.from(countriesSet).sort().map((name, index) => ({
      _id: `country-${index}`,
      name,
      code: name.substring(0, 2).toUpperCase(),
      inApp: true,
    }));

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries from collections:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


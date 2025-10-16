import PurchasedLead from "@/lib/models/PurchasedLead";
import mongoose from "mongoose";

/**
 * Check if specific leads were already purchased by a user for a collection
 */
export async function checkPurchasedLeads(
  userId: string | mongoose.Types.ObjectId,
  collectionId: string | mongoose.Types.ObjectId,
  identifiers: string[]
): Promise<string[]> {
  try {
    const purchased = await PurchasedLead.find({
      userId,
      collectionId,
      identifier: { $in: identifiers.map(id => id.toLowerCase().trim()) },
    }).select("identifier");

    return purchased.map(p => (p as any).identifier);
  } catch (error) {
    console.error("Error checking purchased leads:", error);
    return [];
  }
}

/**
 * Get count of already purchased leads for a user in a collection
 */
export async function getPurchasedLeadsCount(
  userId: string | mongoose.Types.ObjectId,
  collectionId: string | mongoose.Types.ObjectId
): Promise<number> {
  try {
    return await PurchasedLead.countDocuments({
      userId,
      collectionId,
    });
  } catch (error) {
    console.error("Error getting purchased leads count:", error);
    return 0;
  }
}

/**
 * Record purchased leads after order creation
 */
export async function recordPurchasedLeads(
  userId: string | mongoose.Types.ObjectId,
  collectionId: string | mongoose.Types.ObjectId,
  fileId: string | mongoose.Types.ObjectId,
  orderId: string | mongoose.Types.ObjectId,
  identifiers: string[],
  identifierType: "email" | "phone" | "id" = "email"
): Promise<void> {
  try {
    // Prepare bulk insert (ignore duplicates)
    const leads = identifiers.map(identifier => ({
      userId,
      collectionId,
      fileId,
      orderId,
      identifier: identifier.toLowerCase().trim(),
      identifierType,
      purchasedAt: new Date(),
    }));

    // Insert in batches of 1000 to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      await PurchasedLead.insertMany(batch, { ordered: false }).catch(err => {
        // Ignore duplicate key errors (11000)
        if (err.code !== 11000) {
          console.error("Error inserting purchased leads batch:", err);
        }
      });
    }

    console.log(`Recorded ${identifiers.length} purchased leads for user ${userId}`);
  } catch (error) {
    console.error("Error recording purchased leads:", error);
    throw error;
  }
}

/**
 * Filter out already purchased leads from a dataset
 * Returns array of row indices that are NOT purchased
 */
export async function filterAlreadyPurchased(
  userId: string | mongoose.Types.ObjectId,
  collectionId: string | mongoose.Types.ObjectId,
  dataRows: any[],
  identifierColumn: string = "lead_id" // Changed default to lead_id
): Promise<number[]> {
  try {
    // Extract identifiers from data (prefer lead_id column if available)
    const idColumn = dataRows[0]?.lead_id ? "lead_id" : (dataRows[0]?._id ? "_id" : identifierColumn);
    
    const identifiers = dataRows
      .map(row => row[idColumn])
      .filter(id => id && typeof id === "string" && id.trim() !== "")
      .map(id => id.toLowerCase().trim());

    if (identifiers.length === 0) {
      console.warn("No identifiers found in data rows");
      return dataRows.map((_, index) => index); // Return all indices
    }

    // Get purchased identifiers
    const purchased = await checkPurchasedLeads(userId, collectionId, identifiers);
    const purchasedSet = new Set(purchased);

    console.log(`Filtering ${dataRows.length} rows, ${purchased.length} already purchased`);

    // Return indices of non-purchased rows
    return dataRows
      .map((row, index) => {
        const identifier = row[idColumn];
        if (!identifier || typeof identifier !== "string" || identifier.trim() === "") {
          return index; // Keep rows without identifiers
        }
        const normalized = identifier.toLowerCase().trim();
        return purchasedSet.has(normalized) ? -1 : index;
      })
      .filter(index => index !== -1);
  } catch (error) {
    console.error("Error filtering purchased leads:", error);
    return dataRows.map((_, index) => index); // Return all on error
  }
}


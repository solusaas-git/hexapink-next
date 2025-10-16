import crypto from "crypto";

/**
 * Generate a universal unique identifier for a lead
 * Format: LEAD-XXXXXXXXXXXXXXXX (20 chars total)
 * This ID is used for:
 * - Tracking purchased leads
 * - Lead enrichment
 * - Deduplication
 * - Reference across system
 */
export function generateLeadIdentifier(): string {
  // Generate completely random hash (not based on data)
  const randomHash = crypto.randomBytes(8).toString("hex").toUpperCase();
  
  // Format as LEAD-XXXXXXXXXXXXXXXX
  return `LEAD-${randomHash}`;
}


/**
 * Validate if a string is a valid Lead ID
 */
export function isValidLeadId(id: string): boolean {
  return /^LEAD-[A-F0-9]{16}$/.test(id);
}

/**
 * Batch generate identifiers for multiple rows
 */
export function generateLeadIdentifiers(rows: Record<string, any>[]): string[] {
  return rows.map(() => generateLeadIdentifier());
}

/**
 * Parse a Lead ID to extract the hash portion
 */
export function parseLeadId(leadId: string): string | null {
  if (!isValidLeadId(leadId)) {
    return null;
  }
  return leadId.replace("LEAD-", "");
}


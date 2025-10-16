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
export function generateLeadIdentifier(row: Record<string, any>, tableId?: string): string {
  // Generate completely random hash (not based on data)
  const randomHash = crypto.randomBytes(8).toString("hex").toUpperCase();
  
  // Format as LEAD-XXXXXXXXXXXXXXXX
  return `LEAD-${randomHash}`;
}

/**
 * Generate a deterministic hash from lead data
 * Same data will always produce the same hash
 */
function generateDeterministicHash(row: Record<string, any>, tableId?: string): string {
  // Collect all significant values from the row
  const values: string[] = [];
  
  // Add table ID if provided (for uniqueness across tables)
  if (tableId) {
    values.push(tableId);
  }

  // Priority fields for hash generation
  const priorityFields = [
    "Email", "email", "EMAIL",
    "Phone", "phone", "PHONE", "Telephone", "telephone",
    "Company", "CompanyName", "company", "COMPANY",
    "VAT", "vat", "TaxID", "SIRET", "SIREN",
    "FirstName", "LastName", "Name", "FullName",
    "Address", "Street", "City", "PostalCode", "ZipCode",
    "Country", "Website", "Domain"
  ];

  // Collect values from priority fields
  for (const field of priorityFields) {
    if (row[field]) {
      const value = row[field].toString().toLowerCase().trim();
      if (value && value !== "" && value !== "null" && value !== "undefined") {
        values.push(value);
      }
    }
  }

  // If we have no significant data, use all available fields
  if (values.length === 0) {
    Object.values(row).forEach(val => {
      if (val && val.toString().trim() !== "") {
        values.push(val.toString().toLowerCase().trim());
      }
    });
  }

  // If still no data, generate random (very rare case)
  if (values.length === 0) {
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  // Create SHA-256 hash and take first 16 chars
  const combined = values.join("|");
  const hash = crypto
    .createHash("sha256")
    .update(combined)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();
  
  return hash;
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
export function generateLeadIdentifiers(rows: Record<string, any>[], tableId?: string): string[] {
  return rows.map(row => generateLeadIdentifier(row, tableId));
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


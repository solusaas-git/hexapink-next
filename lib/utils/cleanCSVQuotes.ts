import fs from "fs";
import readline from "readline";

/**
 * Clean malformed quotes in a CSV file
 * Fixes issues like:
 * - Quotes not properly closed
 * - Extra characters after closing quotes
 * - Unescaped quotes within fields
 */
export async function cleanCSVQuotes(
  filePath: string,
  delimiter: string = ";"
): Promise<{ cleaned: number; total: number }> {
  return new Promise((resolve, reject) => {
    try {
      const tempPath = `${filePath}.cleaning`;
      const writeStream = fs.createWriteStream(tempPath);
      
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
      });

      let lineNumber = 0;
      let cleanedLines = 0;

      rl.on("line", (line) => {
        lineNumber++;
        
        // Clean the line
        const cleaned = cleanLine(line, delimiter);
        if (cleaned !== line) {
          cleanedLines++;
        }
        
        writeStream.write(cleaned + "\n");
      });

      rl.on("close", () => {
        writeStream.end();
        
        // Replace original file with cleaned version
        fs.rename(tempPath, filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✓ Cleaned ${cleanedLines} lines out of ${lineNumber} total`);
            resolve({ cleaned: cleanedLines, total: lineNumber });
          }
        });
      });

      rl.on("error", reject);
      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clean a single CSV line - more aggressive cleaning
 */
function cleanLine(line: string, delimiter: string): string {
  // Skip empty lines
  if (!line.trim()) {
    return line;
  }

  let cleaned = line;
  
  // Strategy: Fix quotes that break CSV parsing
  // Pattern 1: "text"X where X is not delimiter/EOL -> "text X"
  cleaned = cleaned.replace(new RegExp(`"([^"]*)"([^${delimiter}\\s])`, 'g'), '"$1 $2');
  
  // Pattern 2: X"text where X is not delimiter/start -> X "text  
  cleaned = cleaned.replace(new RegExp(`([^${delimiter}\\s])"`, 'g'), '$1 "');
  
  // Pattern 3: Quote in the middle of unquoted field -> remove it
  // Split by delimiter and process each field
  const fields = cleaned.split(delimiter);
  cleaned = fields.map(field => {
    const trimmed = field.trim();
    
    // If field starts with quote but doesn't end with quote (or vice versa)
    if ((trimmed.startsWith('"') && !trimmed.endsWith('"')) || 
        (!trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      // Remove the mismatched quote
      return field.replace(/"/g, '');
    }
    
    // If field has quotes but not at start/end, it's probably malformed
    if (!trimmed.startsWith('"') && trimmed.includes('"')) {
      // Check if it's a proper quoted field that got spaces around it
      const quoteStart = trimmed.indexOf('"');
      const quoteEnd = trimmed.lastIndexOf('"');
      if (quoteStart > 0 || quoteEnd < trimmed.length - 1) {
        // Malformed - remove all quotes
        return field.replace(/"/g, '');
      }
    }
    
    return field;
  }).join(delimiter);
  
  // Final check: ensure even number of quotes
  const quoteCount = (cleaned.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // Remove all standalone quotes as last resort
    const parts = cleaned.split(delimiter);
    cleaned = parts.map(part => {
      const trimmed = part.trim();
      // Keep only properly quoted fields (starts AND ends with quote)
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return part;
      }
      // Remove all quotes from improperly quoted fields
      return part.replace(/"/g, '');
    }).join(delimiter);
  }

  return cleaned;
}


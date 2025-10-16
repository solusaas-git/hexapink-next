export function getFullFileUrl(urlPart: string): string {
  // If the URL already starts with http:// or https://, return as is
  if (urlPart.startsWith("http://") || urlPart.startsWith("https://")) {
    return urlPart;
  }
  
  // If urlPart is empty, return empty string
  if (!urlPart) {
    return "";
  }
  
  // Ensure there's a leading slash if urlPart doesn't have one
  const normalizedPath = urlPart.startsWith("/") ? urlPart : `/${urlPart}`;
  
  // Return the full URL with proper path separator
  return `${process.env.NEXT_PUBLIC_APP_URL || ""}${normalizedPath}`;
}

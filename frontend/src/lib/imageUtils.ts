/**
 * Utility to handle image URLs.
 * If the URL is absolute (starts with http), it returns the URL.
 * If the URL is relative, it prefixes it with the backend URL.
 */
export const getImageUrl = (url?: string) => {
  if (!url) return "";
  
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  
  // Base URL for assets (backend host)
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_URL || "http://localhost:5001";
  
  // Ensure the relative URL starts with a slash
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${cleanUrl}`;
};

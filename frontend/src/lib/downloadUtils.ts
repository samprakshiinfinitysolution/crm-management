/**
 * Download Utility
 *
 * Provides a reliable, cross-origin-compatible browser download trigger.
 * Modern browsers disregard the HTML5 `<a download>` attribute on cross-origin
 * URLs (such as Cloudinary or S3 CDN links).
 *
 * This utility:
 * 1. Fetches the resource and creates a same-origin Blob URL (`blob:`).
 *    Because `blob:` URLs originate from the current window, browsers honor
 *    the `download` attribute and save the file directly to the user's computer.
 * 2. If direct fetch fails (e.g. strict CORS or offline), falls back to:
 *    - Cloudinary's `/fl_attachment:${filename}/` transformation which instructs
 *      the CDN to send `Content-Disposition: attachment; filename="..."`.
 *    - Direct anchor navigation.
 */

export async function downloadAttachment(
  url: string,
  fileName?: string,
): Promise<boolean> {
  if (!url || typeof window === "undefined") {
    return false;
  }

  // Derive a clean, safe filename
  const fallbackName = url.split("/").pop()?.split("?")[0] || `download_${Date.now()}`;
  const targetName = (fileName && fileName.trim()) ? fileName.trim() : fallbackName;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = targetName;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke object URL after download is dispatched
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    return true;
  } catch (error) {
    console.warn("Direct blob download failed, attempting attachment URL fallback:", error);

    let downloadUrl = url;
    // For Cloudinary URLs, inject fl_attachment transformation to force attachment header
    if (url.includes("/upload/")) {
      const sanitized = encodeURIComponent(targetName.replace(/[^\w.-]/g, "_"));
      downloadUrl = url.replace("/upload/", `/upload/fl_attachment:${sanitized}/`);
    }

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = targetName;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    return true;
  }
}

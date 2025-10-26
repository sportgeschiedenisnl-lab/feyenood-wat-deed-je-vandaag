import type { WikimediaImage, WikimediaApiPage } from '../types';

const API_ENDPOINT = "https://commons.wikimedia.org/w/api.php";

function parseDate(dateString: string | undefined): string | null {
  if (!dateString) return null;

  // Clean up HTML tags and other noise
  const cleanedString = dateString.replace(/<[^>]*>/g, '').trim();

  // 1. Check for YYYY-MM-DD format
  let match = cleanedString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    // Basic validation
    if (month > 0 && month <= 12 && day > 0 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day));
      // Final check for validity (e.g., handles Feb 30)
      if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // 2. Check for DD Month YYYY format (Dutch)
  const dutchMonths: { [key: string]: number } = {
    'januari': 1, 'februari': 2, 'maart': 3, 'april': 4, 'mei': 5, 'juni': 6,
    'juli': 7, 'augustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'december': 12
  };
  const monthNames = Object.keys(dutchMonths).join('|');

  match = cleanedString.match(new RegExp(`^(\\d{1,2})\\s+(${monthNames})\\s+(\\d{4})$`, 'i'));
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const month = dutchMonths[monthName];
    const year = parseInt(match[3], 10);
    
    if (month > 0 && month <= 12 && day > 0 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  // If no full, valid date is found, return null to skip the photo.
  // This prevents "1970" from becoming "1970-01-01".
  return null;
}


export const fetchFeyenoordPhotos = async (): Promise<WikimediaImage[]> => {
  let continueParams: Record<string, string> = {};
  const allImages: WikimediaImage[] = [];
  let hasMore = true;

  const baseParams = {
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "500", // Max limit per request
    gsrsearch: '"Feyenoord" "Nationaal Archief"',
    prop: "imageinfo",
    iiprop: "url|extmetadata",
  };

  try {
    while (hasMore) {
      const params = new URLSearchParams({
        ...baseParams,
        ...continueParams,
      });

      const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Wikimedia API error: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.query && data.query.pages) {
        const pages = data.query.pages as Record<string, WikimediaApiPage>;
        for (const pageId in pages) {
          const page = pages[pageId];
          if (page.imageinfo && page.imageinfo.length > 0) {
            const info = page.imageinfo[0];
            const extmetadata = info.extmetadata;
            const date = parseDate(extmetadata.DateTimeOriginal?.value);
            if (date) {
              allImages.push({
                pageid: page.pageid,
                title: page.title,
                url: info.url,
                descriptionurl: info.descriptionurl,
                description: extmetadata.ImageDescription?.value || 'Geen beschrijving beschikbaar.',
                date: date,
              });
            }
          }
        }
      }

      if (data.continue) {
        continueParams = data.continue;
      } else {
        hasMore = false;
      }
    }
    return allImages;
  } catch (error) {
    console.error("Failed to fetch photos from Wikimedia:", error);
    return allImages; // Return whatever was fetched before the error
  }
};
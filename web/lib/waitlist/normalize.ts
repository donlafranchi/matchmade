// Common location aliases for normalization
const LOCATION_ALIASES: Record<string, string> = {
  // New York
  nyc: "New York",
  "new york city": "New York",
  manhattan: "New York",
  brooklyn: "New York",
  queens: "New York",
  bronx: "New York",
  "staten island": "New York",

  // California
  la: "Los Angeles",
  "los angeles": "Los Angeles",
  sf: "San Francisco",
  "san fran": "San Francisco",
  "san francisco": "San Francisco",
  sd: "San Diego",
  "san diego": "San Diego",
  sj: "San Jose",
  "san jose": "San Jose",
  oak: "Oakland",
  oakland: "Oakland",

  // Other major cities
  chi: "Chicago",
  chicago: "Chicago",
  philly: "Philadelphia",
  philadelphia: "Philadelphia",
  dc: "Washington DC",
  washington: "Washington DC",
  "washington dc": "Washington DC",
  "washington d.c.": "Washington DC",
  atl: "Atlanta",
  atlanta: "Atlanta",
  hou: "Houston",
  houston: "Houston",
  dal: "Dallas",
  dallas: "Dallas",
  dfw: "Dallas",
  sea: "Seattle",
  seattle: "Seattle",
  bos: "Boston",
  boston: "Boston",
  mia: "Miami",
  miami: "Miami",
  den: "Denver",
  denver: "Denver",
  phx: "Phoenix",
  phoenix: "Phoenix",
  pdx: "Portland",
  portland: "Portland",
  aus: "Austin",
  austin: "Austin",
  nash: "Nashville",
  nashville: "Nashville",
  vegas: "Las Vegas",
  "las vegas": "Las Vegas",
  nola: "New Orleans",
  "new orleans": "New Orleans",
  det: "Detroit",
  detroit: "Detroit",
  msp: "Minneapolis",
  minneapolis: "Minneapolis",
};

/**
 * Normalize a location string for consistent storage and grouping.
 * - Maps common aliases (NYC → New York)
 * - Title cases the result
 */
export function normalizeLocation(location: string): string {
  const trimmed = location.trim();
  const lowered = trimmed.toLowerCase();

  // Check aliases
  if (LOCATION_ALIASES[lowered]) {
    return LOCATION_ALIASES[lowered];
  }

  // Title case the input
  return trimmed
    .split(" ")
    .map((word) => {
      // Keep common lowercase words lowercase (unless first word)
      const lowerWords = ["of", "the", "and", "in", "on", "at"];
      if (lowerWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

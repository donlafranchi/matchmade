// Major US metro areas for waitlist location selection
// Sorted alphabetically for easy browsing
// Suburbs and nearby cities should be represented by their major metro

export const METRO_AREAS = [
  "Albuquerque, NM",
  "Atlanta, GA",
  "Austin, TX",
  "Baltimore, MD",
  "Birmingham, AL",
  "Boise, ID",
  "Boston, MA",
  "Buffalo, NY",
  "Charlotte, NC",
  "Chicago, IL",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Colorado Springs, CO",
  "Columbus, OH",
  "Dallas-Fort Worth, TX",
  "Denver, CO",
  "Detroit, MI",
  "El Paso, TX",
  "Hartford, CT",
  "Honolulu, HI",
  "Houston, TX",
  "Indianapolis, IN",
  "Jacksonville, FL",
  "Kansas City, MO",
  "Las Vegas, NV",
  "Los Angeles, CA",
  "Louisville, KY",
  "Memphis, TN",
  "Miami, FL",
  "Milwaukee, WI",
  "Minneapolis-St. Paul, MN",
  "Nashville, TN",
  "New Orleans, LA",
  "New York City, NY",
  "Oklahoma City, OK",
  "Omaha, NE",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Pittsburgh, PA",
  "Portland, OR",
  "Providence, RI",
  "Raleigh-Durham, NC",
  "Richmond, VA",
  "Rochester, NY",
  "Sacramento, CA",
  "Salt Lake City, UT",
  "San Antonio, TX",
  "San Diego, CA",
  "San Francisco Bay Area, CA",
  "San Jose, CA",
  "Seattle, WA",
  "St. Louis, MO",
  "Tampa Bay, FL",
  "Tucson, AZ",
  "Virginia Beach, VA",
  "Washington, DC",
] as const;

export type MetroArea = (typeof METRO_AREAS)[number];

// Helper to search metros (case-insensitive, partial match)
export function searchMetros(query: string): string[] {
  if (!query.trim()) return [...METRO_AREAS];

  const lowered = query.toLowerCase();
  return METRO_AREAS.filter((metro) => metro.toLowerCase().includes(lowered));
}

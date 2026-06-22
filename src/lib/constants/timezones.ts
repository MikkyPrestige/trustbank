export const TIMEZONES = [
    // Americas
    { label: "Eastern Time (US & Canada)",  value: "America/New_York",                  region: "Americas" },
    { label: "Central Time (US & Canada)",  value: "America/Chicago",                   region: "Americas" },
    { label: "Mountain Time (US & Canada)", value: "America/Denver",                    region: "Americas" },
    { label: "Pacific Time (US & Canada)",  value: "America/Los_Angeles",               region: "Americas" },
    { label: "Alaska",                      value: "America/Anchorage",                 region: "Americas" },
    { label: "Hawaii",                      value: "Pacific/Honolulu",                  region: "Americas" },
    { label: "Toronto (Canada)",            value: "America/Toronto",                   region: "Americas" },
    { label: "Vancouver (Canada)",          value: "America/Vancouver",                 region: "Americas" },
    { label: "Mexico City",                 value: "America/Mexico_City",               region: "Americas" },
    { label: "São Paulo (Brazil)",          value: "America/Sao_Paulo",                 region: "Americas" },
    { label: "Buenos Aires (Argentina)",    value: "America/Argentina/Buenos_Aires",    region: "Americas" },
    { label: "Santiago (Chile)",            value: "America/Santiago",                  region: "Americas" },
    { label: "Bogotá (Colombia)",           value: "America/Bogota",                    region: "Americas" },
    { label: "Lima (Peru)",                 value: "America/Lima",                      region: "Americas" },
    // Europe
    { label: "London (UK)",                 value: "Europe/London",                     region: "Europe" },
    { label: "Dublin (Ireland)",            value: "Europe/Dublin",                     region: "Europe" },
    { label: "Paris (France)",              value: "Europe/Paris",                      region: "Europe" },
    { label: "Berlin (Germany)",            value: "Europe/Berlin",                     region: "Europe" },
    { label: "Madrid (Spain)",              value: "Europe/Madrid",                     region: "Europe" },
    { label: "Rome (Italy)",                value: "Europe/Rome",                       region: "Europe" },
    { label: "Athens (Greece)",             value: "Europe/Athens",                     region: "Europe" },
    { label: "Warsaw (Poland)",             value: "Europe/Warsaw",                     region: "Europe" },
    { label: "Moscow (Russia)",             value: "Europe/Moscow",                     region: "Europe" },
    { label: "Istanbul (Turkey)",           value: "Europe/Istanbul",                   region: "Europe" },
    // Africa
    { label: "Johannesburg (South Africa)", value: "Africa/Johannesburg",               region: "Africa" },
    { label: "Cairo (Egypt)",               value: "Africa/Cairo",                      region: "Africa" },
    { label: "Lagos (Nigeria)",             value: "Africa/Lagos",                      region: "Africa" },
    { label: "Nairobi (Kenya)",             value: "Africa/Nairobi",                    region: "Africa" },
    { label: "Casablanca (Morocco)",        value: "Africa/Casablanca",                 region: "Africa" },
    // Asia
    { label: "Dubai (UAE)",                 value: "Asia/Dubai",                        region: "Asia" },
    { label: "Mumbai (India)",              value: "Asia/Kolkata",                      region: "Asia" },
    { label: "Dhaka (Bangladesh)",          value: "Asia/Dhaka",                        region: "Asia" },
    { label: "Bangkok (Thailand)",          value: "Asia/Bangkok",                      region: "Asia" },
    { label: "Singapore",                   value: "Asia/Singapore",                    region: "Asia" },
    { label: "Hong Kong",                   value: "Asia/Hong_Kong",                    region: "Asia" },
    { label: "Shanghai (China)",            value: "Asia/Shanghai",                     region: "Asia" },
    { label: "Tokyo (Japan)",               value: "Asia/Tokyo",                        region: "Asia" },
    { label: "Seoul (South Korea)",         value: "Asia/Seoul",                        region: "Asia" },
    // Oceania
    { label: "Sydney (Australia)",          value: "Australia/Sydney",                  region: "Oceania" },
    { label: "Melbourne (Australia)",       value: "Australia/Melbourne",               region: "Oceania" },
    { label: "Auckland (New Zealand)",      value: "Pacific/Auckland",                  region: "Oceania" },
    // Reference
    { label: "UTC",                         value: "Etc/UTC",                           region: "Reference" },
] as const;

export type TimezoneValue = typeof TIMEZONES[number]["value"];

export const TIMEZONE_REGIONS = ["Americas", "Europe", "Africa", "Asia", "Oceania", "Reference"] as const;

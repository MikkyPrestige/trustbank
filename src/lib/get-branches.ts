import { db } from "@/lib/db";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.0060 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "Phoenix": { lat: 33.4484, lng: -112.0740 },
  "default": { lat: 40.7128, lng: -74.0060 }
};

export async function getBranches() {
  try {
    const branches = await db.branch.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    return branches.map(branch => {
      const cityKey = Object.keys(CITY_COORDS).find(key =>
        branch.city.includes(key)
      ) || "default";

      const coords = CITY_COORDS[cityKey];

      return {
        ...branch,
        state: branch.city.includes(',') ? branch.city.split(',')[1].trim() : '',
        hasAtm: true,
        hasDriveThru: true,
        lat: coords.lat,
        lng: coords.lng
      };
    });
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}
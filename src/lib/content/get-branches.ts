import { db } from "@/lib/db";

export async function getBranches() {
  try {
    const branches = await db.branch.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    return branches.map(branch => ({
      ...branch,
      state: branch.city.includes(',') ? branch.city.split(',')[1].trim() : '',
    }));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}
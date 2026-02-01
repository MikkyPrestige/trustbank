import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log("🧹 Clearing cached navigation data...");

  try {
    // We only clear the JSON structure.
    // We KEEP the titles/descriptions (nav_bank_title, etc.) because those are compatible!
    const result = await db.siteSettings.updateMany({
      data: {
        nav_structure_json: "" // Wiping this forces the code to read the new constants file
      }
    });

    console.log("✅ Success! Old menu structure removed.");
    console.log("👉 Now go to your Admin Panel and click 'Save' to write the NEW structure to the DB.");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
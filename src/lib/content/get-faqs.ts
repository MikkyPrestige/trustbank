import { db } from "@/lib/db";

export async function getFaqs() {
  try {
    const faqs = await db.faqItem.findMany({
      orderBy: { order: 'asc' }
    });

    return faqs;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}
import { db } from "@/lib/db";
import FaqClientManager from "@/components/admin/faqs/FaqClientManager";

export default async function AdminFaqsPage() {
    const faqs = await db.faqItem.findMany({
        orderBy: { order: 'asc' }
    });

    return <FaqClientManager initialFaqs={faqs} />;
}
'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitKyc(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    // In a real app, you would upload files here using formData
    // const passportFile = formData.get('passport');
    // const idFile = formData.get('idCard');

    try {
        // We assume file upload succeeded and we got these dummy URLs
      const passportUrl = `https://ui-avatars.com/api/?name=${session.user.name}+Passport&background=0D8ABC&color=fff&size=512`;
        const idCardUrl = `https://ui-avatars.com/api/?name=${session.user.name}+ID&background=random&size=512`;

        await db.user.update({
            where: { id: session.user.id },
            data: {
                passportUrl,
                idCardUrl,
                kycStatus: 'PENDING'
            }
        });

        revalidatePath("/dashboard/verify");
       return { success: true, message: "Documents uploaded. Awaiting Admin Review." };
    } catch (err) {
        return { success: false, message: "Submission failed." };
    }
}
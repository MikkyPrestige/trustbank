// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { UserStatus } from "@prisma/client";

// export async function submitKYC(prevState: any, formData: FormData) {
//   const session = await auth();
//   if (!session?.user?.id) return { message: "Unauthorized" };

//   const idNumber = formData.get("idNumber") as string;

//   if (!idNumber || idNumber.length < 5) {
//     return { message: "Invalid ID number provided." };
//   }

//   try {
//     // 1. Simulate "AI Processing" delay
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     // 2. Upgrade User Status AND Verification
//     await db.user.update({
//       where: { id: session.user.id },
//       data: {
//         status: UserStatus.ACTIVE,
//         kycVerified: true
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     return { message: "Verification failed. Please try again." };
//   }

//   //  Refresh and Redirect
//   revalidatePath("/dashboard");
//   redirect("/dashboard");
// }
import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/verify-email/VerifyEmailForm";

export const metadata = {
    title: "Verify Account | Trust Capital",
};

export default function VerifyPage() {
      return (
            <Suspense fallback={<div>Loading form...</div>}>
              <VerifyEmailForm />
            </Suspense>
        );
}
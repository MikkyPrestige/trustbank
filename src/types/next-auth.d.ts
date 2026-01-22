import { UserRole, UserStatus, KycStatus } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession()`, and `getSession()`
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      kycStatus: KycStatus;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    kycStatus: KycStatus;
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    kycStatus: KycStatus;
  }
}


// import { UserRole, UserStatus, KycStatus } from "@prisma/client";
// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: UserRole;
//       status: UserStatus;
//       kycStatus: KycStatus;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     id: string;
//     role: UserRole;
//     status: UserStatus;
//     kycStatus: KycStatus;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: UserRole;
//     status: UserStatus;
//     kycStatus: KycStatus;
//   }
// }

// // src/types/index.ts

// export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';
// export type TransactionType = 'DEPOSIT' | 'TRANSFER' | 'PAYMENT';

// export interface Transaction {
//     id: string;
//     amount: number;
//     description: string; // e.g., "Netflix Subscription" or "Transfer to John"
//     date: string;        // ISO Date string
//     type: TransactionType;
//     status: TransactionStatus;
//     recipient?: string;  // Optional, for transfers
// }
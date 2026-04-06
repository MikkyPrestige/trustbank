# TrustBank: | Full-Stack Banking Simulation

TrustBank is a resilient, full-stack banking ecosystem designed for **100% financial truth**, defensive security, and absolute administrative accountability. Unlike standard banking simulations, TrustBank operates as a **Financial Ledger System**, where every movement of value is recorded as an immutable entry.

---

### 🔗 Quick Links
* **Live Demo:** [trustbank-omega.vercel.app](https://trustbank-omega.vercel.app/)
* **Source Code:** [github.com/MikkyPrestige/trustbank](https://github.com/MikkyPrestige/trustbank)

---

### Core Engineering Principles
The system is built upon a **"Failure-First"** architecture, assuming that networks drop, users make mistakes, and systems fail.

* **Ledger-First Accounting:** Balances are never "just changed"; they are derived from an immutable, append-only ledger of movements.
* **Atomic Transactions:** Money moves as a single unit or not at all, preventing partial states or "lost" funds.
* **Capability-Based Security:** Features are unlocked via granular "flags" (e.g., `canTransfer`, `dailyLimit`) rather than simple binary roles.
* **System Reconciliation:** A core script validates that `Sum(LedgerEntries) === Account.Balance` to detect and prevent data corruption.

---

### Technical Architecture

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Unified server/client logic for secure, full-stack applications. |
| **Database** | PostgreSQL (Supabase) | Ensures ACID-compliant financial data integrity. |
| **ORM** | Prisma | Type-safe database queries and transactional safety. |
| **Security** | NextAuth.js | Robust session management and authentication governance. |
| **Hashing** | Bcrypt / Argon2id | State-of-the-art hashing for sensitive user data. |
| **Styling** | CSS Modules | Clean UI. |

---

### Key Features

#### 1. The Client Vault (Dashboard)
* **Wealth Ledger:** A real-time view of total assets vs. **Reserved Balance**.
* **Atomic Account Generation:** Instant generation of unique 10-digit account numbers with collision checking.
* **Privacy Mode:** A balance toggle (eye icon) using local React state to obscure sensitive data.
* **Evidence Hub:** Generation of official PDF statements via `jsPDF`, including ledger hash snapshots to prove history hasn't been altered.

#### 2. The Movement Engine
* **Local P2P Transfers:** Instant, ledger-verified transfers using `prisma.$transaction` for atomicity.
* **International State Machine:** A complex, multi-state movement protocol:
    * **Initiated:** Funds move from *Available* to *Reserved*.
    * **Pending:** The transaction awaits Admin clearance.
    * **Settled:** Ledger is updated, and status changes to *Completed*.
* **Idempotency Protection:** Unique request keys ensure that network retries or double-clicks never result in a double-charge.

#### 3. Admin Command Center
* **God-View Dashboard:** Monitoring for total bank liquidity and high-risk anomaly detection.
* **The Clearing House:** UI for Admins to manage pending transfers and generate single-use, time-bound **TAA / COT / IJY** codes.
* **Immutable Audit Logs:** Forensic-grade recording of every admin action, including IP addresses and change hashes.

---

### Database Strategy (Source of Truth)

* **Users:** Capability-Based (UUID, Hashed Pass/PIN, Capability Flags).
* **Accounts:** Versioned (Account No, Balances, Versioning for Optimistic Locking).
* **Ledger:** Append-Only (Account ID, Amount +/-, Previous/Current Hashes, Idempotency Key).
* **Audit Logs:** Forensic-Grade (Admin ID, Action, IP Address, Timestamp, Change Hash).

---

### Development Milestones

1.  **The Foundation:** Next.js setup with Prisma, PostgreSQL, and global error boundaries.
2.  **The Vault:** KYC portal implementation and unique account generation.
3.  **The Engine:** Transactional logic for P2P and the International State Machine.
4.  **Governance:** Admin dashboard development and Clearance code generation logic.
5.  **Forensics:** PDF reporting, session-timeout security, and system reconciliation tools.

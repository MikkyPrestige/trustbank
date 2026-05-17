# 🔐 TrustBank Recovery Guide

This document describes the automated/manual backup and recovery procedures for the TrustBank application.
The system is designed to be fully self‑sufficient — no external services, no single point of failure.
Everything can be restored from scratch even if the original hosting providers become unavailable.

---

## What Is Backed Up

| Component          | Backup Method                        | Storage Location                |
|--------------------|--------------------------------------|---------------------------------|
| Database (PostgreSQL on Supabase) | Nightly encrypted `pg_dump` via GitHub Actions | GitHub Actions Artifact (30‑day retention) |
| Uploaded files (Cloudinary)       | Built‑in Cloudinary backup          | Cloudinary backup storage       |
| Environment variables             | Manual export (one‑time)            | Secure offline storage          |

---

## 1. Database Backup (Automatic)

### How It Works

- A GitHub Actions workflow runs **every night at 2 AM UTC** (and can be triggered manually).
- It creates a complete dump of the entire database, **encrypts it with AES‑256‑CBC**, and uploads the encrypted file as a GitHub artifact.
- The encryption password is stored securely in the GitHub repository’s secrets (`ENCRYPTION_PASSWORD`) and is never visible in logs.

### Downloading a Backup

1. Go to the **Actions** tab of the TrustBank backup repository.
2. Open the most recent successful workflow run (green checkmark).
3. Scroll down to the **Artifacts** section.
4. Click the artifact named `trustbank-backup-YYYY‑MM‑DD` to download it.
5. Extract the ZIP; you will find a file called `backup.dump.enc` — the encrypted database dump.

### Decrypting the Backup

You need the same encryption password that is stored in the repository’s `ENCRYPTION_PASSWORD` secret.

Open a terminal and run:

```bash
openssl enc -aes-256-cbc -d -pbkdf2 -pass pass:"YOUR_ENCRYPTION_PASSWORD" -in backup.dump.enc -out backup.dump
```

After successful decryption, `backup.dump` will be a standard PostgreSQL custom‑format dump.

### Restoring the Database

1. Create a new PostgreSQL database (e.g., a fresh Supabase project, or any PostgreSQL server).
2. Use `pg_restore` to load the dump:

```bash
pg_restore -d "YOUR_NEW_DATABASE_URL" -v backup.dump
```

Replace `YOUR_NEW_DATABASE_URL` with the connection string of the target database (including the password).
Make sure the `pg_restore` version matches the PostgreSQL server version (17 at the time of writing).

The restoration will recreate all tables, data, indexes, and functions.

---

## Manual Local Backup (Alternative)

For quick, on‑demand backups directly from your own computer, a local backup script is included in the project.

### File Location

The script is located in the `scripts/` folder:
- `scripts/backup.bat` – the backup script
- `backup-key.txt` – the encryption password file (must be kept in the project root and **never committed to Git**)

### How to Run a Manual Backup

1. Open a Command Prompt or terminal in the project root.
2. Run the backup script:

```bash
backup.bat
```

3. The script will:
   - Connect to the live Supabase database
   - Dump the entire database to a timestamped `.dump` file inside the `backups/` folder
   - Encrypt the dump with AES‑256‑CBC using the password from `backup-key.txt`
   - Delete the unencrypted dump

4. The resulting file is `trustbank-YYYY-MM-DD.dump.enc` inside the `backups/` folder.

### Restoring from a Manual Backup

Decrypt the backup:

```bash
openssl enc -aes-256-cbc -d -pbkdf2 -pass file:backup-key.txt -in backups\trustbank-YYYY-MM-DD.dump.enc -out backups\restored.dump
```

Then restore with `pg_restore` as described above.

### Important Notes
- `backup-key.txt` must contain only the encryption password, with no extra spaces or newlines.
- This local backup is an **additional safety net** and does **not** replace the automated nightly backup.

---

## 2. File Backup (Cloudinary)

Cloudinary offers built‑in automatic backup that keeps copies of every uploaded asset.
It can also backfill existing assets on demand.

### Enabling Backup

1. Log in to the [Cloudinary Console](https://console.cloudinary.com/app/settings/backup).
2. Turn on **"Enable automatic backup"** and save.
3. (Optional) To back up everything that was already uploaded before enabling, click the **"Perform initial backup"** link on the same page.

Backups are stored by Cloudinary and count toward your managed storage quota. The feature is available on all plans, including Free.

### Restoring Files

- Cloudinary keeps previous versions of each asset. You can restore a previous version from the Cloudinary Console (Media Library → select asset → Version History).
- If you ever need a full export of all assets, Cloudinary provides admin APIs for bulk download. Refer to the [Cloudinary Admin API](https://cloudinary.com/documentation/admin_api) documentation for details.

---

## 3. Environment Variables

Environment variables are stored on Vercel and are not automatically backed up.
It is important to **export them manually** and keep a secure copy.

### Exporting Variables

1. Install the Vercel CLI (`npm i -g vercel`).
2. Run the following command to pull all environment variables for the production environment:

```bash
vercel env pull --environment=production > vercel-vars.txt
```

3. Encrypt the file (recommended):

```bash
openssl enc -aes-256-cbc -pbkdf2 -pass pass:"YOUR_PASSWORD" -in vercel-vars.txt -out vercel-vars.txt.enc
```

4. Store the encrypted file (and the password) securely offline.

### Restoring Variables

1. Import the variables to a new Vercel project:

```bash
vercel env add --environment=production $(cat vercel-vars.txt)
```

(Or manually enter them in the Vercel Dashboard → Settings → Environment Variables.)

---

## 4. Codebase

The application source code is stored on GitHub.
To re‑deploy:

1. Clone the repository.
2. Install dependencies (`npm install`).
3. Set up the environment variables as described above.
4. Deploy to Vercel (or any Next.js‑compatible host).

---

## Disaster Recovery Summary

If a complete loss occurs:

1. **Restore the database** → download the latest artifact, decrypt, and restore with `pg_restore`.
2. **Restore files** → Cloudinary backup automatically recovers previous versions; no manual action required.
3. **Restore environment variables** → import the saved `vercel-vars.txt`.
4. **Redeploy the application** → push the code to Vercel (or any host).

All steps are documented in this guide.

---

For any questions, please refer to the individual service documentation:
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)
- [Cloudinary Backup](https://cloudinary.com/documentation/backups)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/managing-workflow-runs/downloading-workflow-artifacts)
```
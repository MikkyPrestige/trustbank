@echo off
set PGPASSWORD=HospitoFind10
set PGUSER=postgres.levhdvmipmkhdyvikimp
set PGHOST=aws-1-us-west-1.pooler.supabase.com
set PGPORT=6543
set PGDATABASE=postgres

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TODAY=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

pg_dump -F c -f "C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backups\trustbank_%TODAY%.dump"

REM Encrypt the backup
"C:\Program Files\Git\usr\bin\openssl.exe" enc -aes-256-cbc -pbkdf2 -pass file:C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backup-key.txt -in "C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backups\trustbank_%TODAY%.dump" -out "C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backups\trustbank_%TODAY%.dump.enc"

REM Remove the unencrypted dump
del "C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backups\trustbank_%TODAY%.dump"

echo Backup completed: C:\Users\Mikky\OneDrive\Desktop\Personal\Banks\trust\trustbank\backups\trustbank_%TODAY%.dump

import os
import subprocess
import sys

# Configuration
WORKSPACE_ROOT = os.getcwd()
DB_PACKAGE_DIR = os.path.join(WORKSPACE_ROOT, "packages", "db")
PRISMA_SCHEMA_PATH = os.path.join(DB_PACKAGE_DIR, "prisma", "schema.prisma")

def run_command(command, cwd=WORKSPACE_ROOT, check=True):
    print(f"Running: {command} in {cwd}")
    subprocess.run(command, cwd=cwd, shell=True, check=check, text=True)

def write_schema():
    print("Writing Prisma schema...")
    schema_content = """// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  OPERATOR
  ADMIN
}

enum OperatorStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  clientProfile   ClientProfile?
  operatorProfile OperatorProfile?
}

model ClientProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
  name   String

  jobs JobRequest[]
}

model OperatorProfile {
  id          String         @id @default(cuid())
  userId      String         @unique
  user        User           @relation(fields: [userId], references: [id])
  name        String
  description String?
  status      OperatorStatus @default(PENDING)
  services    String[]       // Array of service strings e.g. "Photography", "Surveying"
  radius      Float?         // in km
  lat         Float?
  lng         Float?

  documents Document[]
  proposals Proposal[]
}

model JobRequest {
  id          String   @id @default(cuid())
  clientId    String
  client      ClientProfile @relation(fields: [clientId], references: [id])
  title       String
  description String
  category    String
  location    String
  lat         Float?
  lng         Float?
  createdAt   DateTime @default(now())
  status      String   @default("OPEN") // OPEN, AWARDED, COMPLETED, CANCELLED

  proposals Proposal[]
  threads   Thread[]
}

model Proposal {
  id         String   @id @default(cuid())
  jobId      String
  job        JobRequest @relation(fields: [jobId], references: [id])
  operatorId String
  operator   OperatorProfile @relation(fields: [operatorId], references: [id])
  price      Decimal
  message    String?
  status     String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
  
  createdAt  DateTime @default(now())
}

model Thread {
  id        String   @id @default(cuid())
  jobId     String
  job       JobRequest @relation(fields: [jobId], references: [id])
  participants String[] // User IDs
  
  messages Message[]
}

model Message {
  id        String   @id @default(cuid())
  threadId  String
  thread    Thread   @relation(fields: [threadId], references: [id])
  senderId  String
  content   String
  createdAt DateTime @default(now())
}

model Document {
  id         String   @id @default(cuid())
  operatorId String
  operator   OperatorProfile @relation(fields: [operatorId], references: [id])
  name       String
  url        String
  type       String   // LICENSE, INSURANCE, OTHER
  uploadedAt DateTime @default(now())
}
"""
    os.makedirs(os.path.dirname(PRISMA_SCHEMA_PATH), exist_ok=True)
    with open(PRISMA_SCHEMA_PATH, "w") as f:
        f.write(schema_content)
    print("Prisma schema written.")

def main():
    if not os.path.exists(DB_PACKAGE_DIR):
        print(f"Error: {DB_PACKAGE_DIR} does not exist. Run scaffold_repo.py first.", file=sys.stderr)
        sys.exit(1)
        
    write_schema()
    
    print("To apply schema, run: npx prisma db push")
    # We don't auto-push here effectively because we might not have a running DB yet or env vars set.
    # The user/agent needs to ensure DB is up.

if __name__ == "__main__":
    main()

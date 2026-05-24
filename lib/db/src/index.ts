import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isExternalDb =
  process.env.DATABASE_URL.includes("supabase.co") ||
  process.env.DATABASE_URL.includes("supabase.com") ||
  process.env.DATABASE_URL.includes("sslmode=require");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Force IPv4 so Supabase direct connections don't resolve to IPv6 on hosts
  // that don't support it (e.g. Render free tier).
  family: 4,
  ...(isExternalDb ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";

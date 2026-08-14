import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// This module is evaluated while Next.js collects route configuration during a
// production build. The synchronous API is only available inside a request, so
// use OpenNext's asynchronous context lookup for this top-level initialization.
const { env } = await getCloudflareContext({ async: true });
const db = drizzle((env as unknown as { DB: D1Database }).DB, { schema });

export function getDb() {
  return db;
}

export type Database = ReturnType<typeof getDb>;

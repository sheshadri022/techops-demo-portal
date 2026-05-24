// Force IPv4 DNS resolution globally — must be called before any network
// operations so hosts like db.*.supabase.co resolve to their A record
// rather than the AAAA record on environments without IPv6 routing (Render).
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./migrate";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err: unknown) => {
    logger.error({ err }, "Startup migration failed — exiting");
    process.exit(1);
  });

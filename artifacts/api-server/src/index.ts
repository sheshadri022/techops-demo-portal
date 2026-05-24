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

// Start listening first — then migrate in the background.
// Routes will return 503 if the DB isn't ready, but the server won't crash
// so Render can complete its health check and mark the deploy live.
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");

  runMigrations()
    .then(() => logger.info("Migrations complete"))
    .catch((migrationErr: unknown) => {
      logger.error({ err: migrationErr }, "Startup migration failed — DB may be unavailable");
    });
});

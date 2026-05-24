import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/db-check", async (_req, res): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        (SELECT count(*)::int FROM employees) AS employees,
        (SELECT count(*)::int FROM assets) AS assets,
        (SELECT count(*)::int FROM tickets) AS tickets`
    );
    client.release();
    res.json({ status: "ok", counts: result.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ status: "db_error", error: msg });
  }
});

export default router;

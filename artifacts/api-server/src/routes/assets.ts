import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, assetsTable, employeesTable } from "@workspace/db";
import {
  CreateAssetBody,
  GetAssetParams,
  GetAssetResponse,
  UpdateAssetParams,
  UpdateAssetBody,
  UpdateAssetResponse,
  DeleteAssetParams,
  ListAssetsResponse,
  ListAssetsQueryParams,
  AssignAssetParams,
  AssignAssetBody,
  AssignAssetResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatAsset(asset: typeof assetsTable.$inferSelect, assignedToName?: string | null) {
  return {
    ...asset,
    purchasePrice: asset.purchasePrice != null ? Number(asset.purchasePrice) : null,
    assignedToName: assignedToName ?? null,
    createdAt: asset.createdAt.toISOString(),
  };
}

router.get("/assets", async (req, res): Promise<void> => {
  const qp = ListAssetsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  let query = db.select().from(assetsTable).$dynamic();
  if (qp.data.status) {
    query = query.where(eq(assetsTable.status, qp.data.status));
  }
  if (qp.data.category) {
    query = query.where(eq(assetsTable.category, qp.data.category));
  }

  const assets = await query.orderBy(assetsTable.createdAt);

  const assignedIds = [...new Set(assets.filter(a => a.assignedToId).map(a => a.assignedToId!))];
  const employeesMap: Record<number, string> = {};
  if (assignedIds.length > 0) {
    for (const empId of assignedIds) {
      const [emp] = await db.select({ id: employeesTable.id, name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, empId));
      if (emp) employeesMap[emp.id] = emp.name;
    }
  }

  res.json(ListAssetsResponse.parse(assets.map(a => formatAsset(a, a.assignedToId ? employeesMap[a.assignedToId] : null))));
});

router.post("/assets", async (req, res): Promise<void> => {
  const parsed = CreateAssetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { assignedToId, purchasePrice, ...rest } = parsed.data;
  const [asset] = await db.insert(assetsTable).values({
    ...rest,
    assignedToId: assignedToId ?? null,
    purchasePrice: purchasePrice != null ? String(purchasePrice) : null,
    status: parsed.data.status ?? (assignedToId ? "assigned" : "available"),
  }).returning();

  let assignedToName: string | null = null;
  if (asset.assignedToId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, asset.assignedToId));
    assignedToName = emp?.name ?? null;
  }

  res.status(201).json(GetAssetResponse.parse(formatAsset(asset, assignedToName)));
});

router.get("/assets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAssetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, params.data.id));
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  let assignedToName: string | null = null;
  if (asset.assignedToId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, asset.assignedToId));
    assignedToName = emp?.name ?? null;
  }
  res.json(GetAssetResponse.parse(formatAsset(asset, assignedToName)));
});

router.patch("/assets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateAssetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAssetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { purchasePrice, ...rest } = parsed.data;
  const [asset] = await db.update(assetsTable).set({
    ...rest,
    ...(purchasePrice !== undefined ? { purchasePrice: String(purchasePrice) } : {}),
  }).where(eq(assetsTable.id, params.data.id)).returning();
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  let assignedToName: string | null = null;
  if (asset.assignedToId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, asset.assignedToId));
    assignedToName = emp?.name ?? null;
  }
  res.json(UpdateAssetResponse.parse(formatAsset(asset, assignedToName)));
});

router.delete("/assets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteAssetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [asset] = await db.delete(assetsTable).where(eq(assetsTable.id, params.data.id)).returning();
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/assets/:id/assign", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AssignAssetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AssignAssetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const newStatus = parsed.data.assignedToId ? "assigned" : "available";
  const [asset] = await db.update(assetsTable).set({
    assignedToId: parsed.data.assignedToId ?? null,
    status: newStatus,
  }).where(eq(assetsTable.id, params.data.id)).returning();
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  let assignedToName: string | null = null;
  if (asset.assignedToId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, asset.assignedToId));
    assignedToName = emp?.name ?? null;
  }
  res.json(AssignAssetResponse.parse(formatAsset(asset, assignedToName)));
});

export default router;

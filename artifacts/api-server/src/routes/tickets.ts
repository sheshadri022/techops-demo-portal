import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ticketsTable, employeesTable, assetsTable } from "@workspace/db";
import {
  CreateTicketBody,
  GetTicketParams,
  GetTicketResponse,
  UpdateTicketParams,
  UpdateTicketBody,
  UpdateTicketResponse,
  DeleteTicketParams,
  ListTicketsResponse,
  ListTicketsQueryParams,
  CloseTicketParams,
  CloseTicketResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichTicket(ticket: typeof ticketsTable.$inferSelect) {
  let assignedToName: string | null = null;
  let requesterName: string | null = null;
  let relatedAssetName: string | null = null;

  if (ticket.assignedToId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, ticket.assignedToId));
    assignedToName = emp?.name ?? null;
  }
  if (ticket.requesterId) {
    const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, ticket.requesterId));
    requesterName = emp?.name ?? null;
  }
  if (ticket.relatedAssetId) {
    const [asset] = await db.select({ name: assetsTable.name }).from(assetsTable).where(eq(assetsTable.id, ticket.relatedAssetId));
    relatedAssetName = asset?.name ?? null;
  }

  return {
    ...ticket,
    assignedToName,
    requesterName,
    relatedAssetName,
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

router.get("/tickets", async (req, res): Promise<void> => {
  const qp = ListTicketsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  let query = db.select().from(ticketsTable).$dynamic();
  if (qp.data.status) {
    query = query.where(eq(ticketsTable.status, qp.data.status));
  }
  if (qp.data.priority) {
    query = query.where(eq(ticketsTable.priority, qp.data.priority));
  }

  const tickets = await query.orderBy(ticketsTable.createdAt);
  const enriched = await Promise.all(tickets.map(enrichTicket));
  res.json(ListTicketsResponse.parse(enriched));
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db.insert(ticketsTable).values({
    ...parsed.data,
    assignedToId: parsed.data.assignedToId ?? null,
    requesterId: parsed.data.requesterId ?? null,
    relatedAssetId: parsed.data.relatedAssetId ?? null,
    status: parsed.data.status ?? "open",
  }).returning();
  res.status(201).json(GetTicketResponse.parse(await enrichTicket(ticket)));
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTicketParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(GetTicketResponse.parse(await enrichTicket(ticket)));
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTicketParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db.update(ticketsTable).set(parsed.data).where(eq(ticketsTable.id, params.data.id)).returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(UpdateTicketResponse.parse(await enrichTicket(ticket)));
});

router.delete("/tickets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTicketParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db.delete(ticketsTable).where(eq(ticketsTable.id, params.data.id)).returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/tickets/:id/close", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CloseTicketParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db.update(ticketsTable).set({
    status: "closed",
    resolvedAt: new Date(),
  }).where(eq(ticketsTable.id, params.data.id)).returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(CloseTicketResponse.parse(await enrichTicket(ticket)));
});

export default router;

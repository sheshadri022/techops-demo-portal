import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, employeesTable, assetsTable, ticketsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetAssetBreakdownResponse,
  GetTicketTrendResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalAssetsRow] = await db.select({ count: count() }).from(assetsTable);
  const [assignedAssetsRow] = await db.select({ count: count() }).from(assetsTable).where(eq(assetsTable.status, "assigned"));
  const [availableAssetsRow] = await db.select({ count: count() }).from(assetsTable).where(eq(assetsTable.status, "available"));
  const [maintenanceAssetsRow] = await db.select({ count: count() }).from(assetsTable).where(eq(assetsTable.status, "maintenance"));
  const [totalTicketsRow] = await db.select({ count: count() }).from(ticketsTable);
  const [openTicketsRow] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
  const [inProgressRow] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "in_progress"));
  const [resolvedRow] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "resolved"));
  const [urgentRow] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.priority, "urgent"));
  const [totalEmployeesRow] = await db.select({ count: count() }).from(employeesTable);

  res.json(GetDashboardSummaryResponse.parse({
    totalAssets: totalAssetsRow.count,
    assignedAssets: assignedAssetsRow.count,
    availableAssets: availableAssetsRow.count,
    maintenanceAssets: maintenanceAssetsRow.count,
    totalTickets: totalTicketsRow.count,
    openTickets: openTicketsRow.count,
    inProgressTickets: inProgressRow.count,
    resolvedTickets: resolvedRow.count,
    urgentTickets: urgentRow.count,
    totalEmployees: totalEmployeesRow.count,
  }));
});

router.get("/dashboard/asset-breakdown", async (_req, res): Promise<void> => {
  const categories = ["Laptop", "Desktop", "Monitor", "Phone", "Tablet", "Peripheral", "Other"];
  const breakdown = await Promise.all(
    categories.map(async (category) => {
      const [totalRow] = await db.select({ count: count() }).from(assetsTable).where(eq(assetsTable.category, category));
      const [availRow] = await db.select({ count: count() }).from(assetsTable).where(sql`${assetsTable.category} = ${category} AND ${assetsTable.status} = 'available'`);
      const [assignRow] = await db.select({ count: count() }).from(assetsTable).where(sql`${assetsTable.category} = ${category} AND ${assetsTable.status} = 'assigned'`);
      return {
        category,
        count: totalRow.count,
        available: availRow.count,
        assigned: assignRow.count,
      };
    })
  );
  res.json(GetAssetBreakdownResponse.parse(breakdown.filter(b => b.count > 0)));
});

router.get("/dashboard/ticket-trend", async (_req, res): Promise<void> => {
  const days = 14;
  const trend = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [openRow] = await db.select({ count: count() }).from(ticketsTable).where(
      sql`DATE(${ticketsTable.createdAt}) = ${dateStr} AND ${ticketsTable.status} != 'closed'`
    );
    const [resolvedRow] = await db.select({ count: count() }).from(ticketsTable).where(
      sql`DATE(${ticketsTable.resolvedAt}) = ${dateStr}`
    );
    trend.push({ date: dateStr, open: openRow.count, resolved: resolvedRow.count });
  }
  res.json(GetTicketTrendResponse.parse(trend));
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const recentTickets = await db.select().from(ticketsTable).orderBy(sql`${ticketsTable.createdAt} DESC`).limit(5);
  const recentAssets = await db.select().from(assetsTable).orderBy(sql`${assetsTable.createdAt} DESC`).limit(5);

  const activity = [
    ...recentTickets.map(t => ({
      id: t.id,
      type: "ticket",
      title: `Ticket: ${t.title}`,
      description: `Status: ${t.status} • Priority: ${t.priority}`,
      createdAt: t.createdAt.toISOString(),
      metadata: t.category,
    })),
    ...recentAssets.map(a => ({
      id: a.id + 10000,
      type: "asset",
      title: `Asset: ${a.name}`,
      description: `${a.category} • Status: ${a.status}`,
      createdAt: a.createdAt.toISOString(),
      metadata: a.category,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  res.json(GetRecentActivityResponse.parse(activity));
});

export default router;

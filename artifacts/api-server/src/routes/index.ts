import { Router, type IRouter } from "express";
import healthRouter from "./health";
import employeesRouter from "./employees";
import assetsRouter from "./assets";
import ticketsRouter from "./tickets";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(employeesRouter);
router.use(assetsRouter);
router.use(ticketsRouter);
router.use(dashboardRouter);

export default router;
